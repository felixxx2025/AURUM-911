import { FastifyInstance } from 'fastify'

import { circuitBreakers } from '../lib/circuit-breaker'
import { traceAsync } from '../tracing'

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  details?: unknown
}

export async function healthRoutes(fastify: FastifyInstance) {
  let appStartedAtISO: string | undefined
  // Status com build info (para status page/API)
  fastify.get('/status', {
    schema: {
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            version: { type: 'string' },
            buildId: { type: 'string' },
            commit: { type: 'string' },
            startedAt: { type: 'string' },
            uptime: { type: 'number' },
          },
          required: ['status','uptime']
        }
      }
    }
  }, async () => {
    if (!appStartedAtISO) appStartedAtISO = new Date().toISOString()
    return traceAsync('health.status', async () => ({
      status: 'ok',
      version: process.env.APP_VERSION || 'dev',
      buildId: process.env.BUILD_ID || '',
      commit: process.env.GIT_COMMIT || '',
      startedAt: appStartedAtISO as string,
      uptime: process.uptime(),
    }))
  })
  // Liveness probe - basic health
  fastify.get('/health', {
    schema: {
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' }, timestamp: { type: 'string' } },
          required: ['status', 'timestamp']
        }
      }
    }
  }, async () => {
    return traceAsync('health.liveness', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  })

  // Readiness probe - detailed health
  fastify.get('/health/ready', {
    schema: {
      tags: ['health'],
      response: { 200: { type: 'object', additionalProperties: true }, 503: { type: 'object', additionalProperties: true } }
    }
  }, async (request, reply) => {
  const checks: HealthCheck[] = []
    let overallStatus = 'healthy'

    // Database check
  const dbCheck = await checkDatabase(fastify)
    checks.push(dbCheck)
    if (dbCheck.status === 'unhealthy') {
      overallStatus = 'unhealthy'
    } else if (dbCheck.status === 'degraded' && overallStatus === 'healthy') {
      overallStatus = 'degraded'
    }

    // Redis check
    const redisCheck = await checkRedis()
    checks.push(redisCheck)
    if (redisCheck.status !== 'healthy' && overallStatus === 'healthy') {
      overallStatus = 'degraded'
    }

    // External services check
    const externalChecks = await checkExternalServices()
    checks.push(...externalChecks)

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return traceAsync('health.readiness', async () => reply.code(statusCode).send({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }))
  })

  // Metrics endpoint
  fastify.get('/health/metrics', {
    schema: { tags: ['health'], response: { 200: { type: 'object', additionalProperties: true } } }
  }, async () => {
    return traceAsync('health.metrics', async () => ({
      circuitBreakers: Object.entries(circuitBreakers).map(([name, cb]) => ({
        name,
        ...cb.getMetrics(),
      })),
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    }))
  })
}

async function checkDatabase(app: FastifyInstance): Promise<HealthCheck> {
  const start = Date.now()
  
  try {
    // Se Prisma não estiver configurado (ex.: ambiente de teste sem DATABASE_URL), reporta como degradado
    // em vez de lançar erro. Quando presente, executa um ping simples.
    if (!('prisma' in app) || !app.prisma) {
      return {
        name: 'database',
        status: 'degraded',
        responseTime: Date.now() - start,
        error: 'Prisma não configurado (sem DATABASE_URL)'
      }
    }

    await app.prisma.$queryRaw`SELECT 1`
    return {
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - start,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      name: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: message,
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now()
  
  try {
    // Simulate Redis check
    await new Promise(resolve => setTimeout(resolve, 10))
    return {
      name: 'redis',
      status: 'healthy',
      responseTime: Date.now() - start,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      name: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: message,
    }
  }
}

async function checkExternalServices(): Promise<HealthCheck[]> {
  return Object.entries(circuitBreakers).map(([name, cb]) => {
    const metrics = cb.getMetrics()
    return {
      name: `external_${name}`,
      status: metrics.state === 'OPEN' ? 'unhealthy' : 'healthy',
      details: metrics,
    }
  })
}