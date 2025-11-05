/* eslint-disable @typescript-eslint/no-explicit-any */
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
// import { trace } from '@opentelemetry/api'
import Fastify from 'fastify'

import { employeeSchema, employeeUpdateSchema, loginSchema, partnerEligibilitySchema, timePunchSchema, transferSchema } from './lib/validation'
import { toJsonSchema } from './lib/zod-json'
import { setupMetrics } from './metrics'
import { correlationMiddleware } from './middleware/correlation'
import { idempotency } from './middleware/idempotency'
import prismaPlugin from './plugins/prisma'
import { InMemoryPeopleRepo, PrismaPeopleRepo } from './repo/people'
import { integrationsRoutes } from './routes/integrations'
import { pilotsRoutes } from './routes/pilots'
import { traceAsync } from './tracing'

export async function createApp() {
  const app = Fastify({ logger: true })
  // Correlation ID para todas as requisições
  app.addHook('onRequest', correlationMiddleware.assignCorrelationId)
  // Limite simples em memória para tentativas de login (fallback para testes)
  const loginAttempts = new Map<string, { count: number; firstAt: number }>()

  // Schema de erro padronizado inline
  const errorSchema = { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] }

  setupMetrics(app)
  // Plugins
  app.register(prismaPlugin)
  app.register(helmet)
  app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  })


  app.register(cors, {
    origin: (_origin: any, callback: any) => {
      try {
        const hostname = new URL(_origin || 'http://localhost').hostname
        if (hostname === 'localhost' || hostname.endsWith('.aurum.cool')) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'), false)
        }
      } catch {
        callback(null, true)
      }
    },
    credentials: true,
  })

  // JWT/OAuth configuration: prefer RS256 keys if provided
  const privKey = (process.env.OAUTH_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const pubKey = (process.env.OAUTH_PUBLIC_KEY || '').replace(/\\n/g, '\n')
  if (privKey && pubKey) {
    app.register(jwt, {
      secret: { private: privKey, public: pubKey },
      sign: { algorithm: 'RS256' },
    })
  } else {
    app.register(jwt, { secret: process.env.JWT_SECRET || 'fallback-secret' })
  }

  // Auth middleware
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify({
        issuer: process.env.OAUTH_ISSUER || undefined,
        audience: process.env.OAUTH_AUDIENCE || undefined,
      })
    } catch {
      reply.code(401).send({ error: 'unauthorized' })
    }
  }

  const roleScopes: Record<string, string[]> = {
    admin: ['*'],
    hr_manager: ['hr:read', 'hr:write', 'time:punch', 'payroll:run'],
    payroll: ['payroll:run'],
    finance: ['fin:transfer'],
    partner_ops: ['partners:eligibility'],
  }

  function requireScope(scope: string) {
    return async (request: any, reply: any) => {
      // Prefer OAuth scopes when present
      const scopeStr: string | undefined = request.user?.scope
      if (scopeStr) {
        const scopes = scopeStr.split(' ')
        const allowed = scopes.includes('*') || scopes.includes(scope)
        if (!allowed) return reply.code(403).send({ error: 'forbidden', missing: scope })
        return
      }
      // Fallback to role-based mapping
      const role: string | undefined = request.user?.role
      if (!role) return reply.code(401).send({ error: 'unauthorized' })
      const scopes = roleScopes[role] || []
      const allowed = scopes.includes('*') || scopes.includes(scope)
      if (!allowed) return reply.code(403).send({ error: 'forbidden', missing: scope })
    }
  }

  // Expor autenticação/escopos para módulos de rotas
  ;(app as any).authenticate = authenticate
  ;(app as any).requireScope = requireScope
  ;(app as any).auth = (handlers: Array<(req: any, rep: any) => any>) => {
    return async (req: any, rep: any) => {
      for (const h of handlers) {
        // Cada handler pode ser sync ou async
        // Se algum handler enviar resposta (rep.sent), interrompe
        await h(req, rep)
        if (rep.sent) return
      }
    }
  }

  // Choose repo (DB if available, otherwise in-memory)
  const peopleRepo = process.env.DATABASE_URL
    ? new PrismaPeopleRepo((app as any).prisma)
    : new InMemoryPeopleRepo()

  // Routes
  app.post('/api/v1/auth/login', {
    schema: {
      tags: ['auth'],
      security: [],
      body: toJsonSchema(loginSchema, 'LoginRequest'),
      response: {
        200: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            token_type: { type: 'string' },
            user: { type: 'object' },
            tenant_id: { type: 'string' }
          },
          required: ['access_token', 'token_type']
        },
        400: errorSchema,
        401: errorSchema,
        429: errorSchema
      }
    },
    // Rate limit específico para login
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request: any, reply) => {
      return traceAsync('auth.login', async () => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      // Rate limit em memória (chave por email) – útil em testes sem Redis
      const now = Date.now()
      const windowMs = 60_000
      const max = 5
      const rec = loginAttempts.get(email) || { count: 0, firstAt: now }
      if (now - rec.firstAt > windowMs) {
        rec.count = 0
        rec.firstAt = now
      }
      rec.count += 1
      loginAttempts.set(email, rec)
      if (rec.count > max) {
        return reply.code(429).send({ error: 'too_many_requests' })
      }
      // Autenticação simples em memória para testes
      const validEmail = 'test@aurum.cool'
      const validPassword = 'test123'
      if (email !== validEmail || password !== validPassword) {
        return reply.code(401).send({ error: 'invalid_credentials' })
      }

      // Stub de emissão de token com role e tenant padrão
      const token = (app as any).jwt.sign({
        userId: email,
        tenantId: '00000000-0000-0000-0000-000000000000',
        email,
        role: 'admin',
      })
      return { access_token: token, token_type: 'Bearer', user: { email }, tenant_id: '00000000-0000-0000-0000-000000000000' }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
      }, { route: 'auth.login' })
  })

  // People endpoints (use repo)
  app.get('/api/v1/hr/people', {
    preHandler: [authenticate, requireScope('hr:read')],
    schema: {
      tags: ['people'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 200 },
          filter: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  tenant_id: { type: 'string' },
                  first_name: { type: 'string', nullable: true },
                  last_name: { type: 'string', nullable: true },
                  email: { type: 'string', nullable: true },
                  created_at: { type: 'string', format: 'date-time', nullable: true }
                },
                required: ['id','tenant_id']
              } 
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
              required: ['page','pageSize','total','totalPages']
            }
          },
          required: ['data','pagination']
        },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema
      }
    }
  }, async (request: any) => {
      return traceAsync('people.list', async () => {
    const page = Number(request.query?.page || 1)
    const pageSize = Number(request.query?.pageSize || 20)
    const filter = (request.query?.filter as string | undefined) || undefined
    const { items, total } = await peopleRepo.list(request.user.tenantId, page, pageSize, filter)
    return { data: items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
      }, { tenantId: request.user?.tenantId, page: request.query?.page, pageSize: request.query?.pageSize, filter: request.query?.filter })
  })

  app.get('/api/v1/hr/people/:id', {
    preHandler: [authenticate, requireScope('hr:read')],
    schema: {
      tags: ['people'],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tenant_id: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            created_at: { type: 'string', format: 'date-time', nullable: true },
          },
          required: ['id','tenant_id']
        },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('people.get', async () => {
    const emp = await peopleRepo.get(request.user.tenantId, request.params.id)
    if (!emp) return reply.code(404).send({ error: 'Employee not found' })
    return emp
    }, { tenantId: request.user?.tenantId, id: request.params?.id })
  })

  app.post('/api/v1/hr/people', {
    preHandler: [authenticate, requireScope('hr:write')],
    onSend: [idempotency.onSend],
    schema: {
      tags: ['people'],
      body: toJsonSchema(employeeSchema, 'EmployeeCreate'),
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tenant_id: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            created_at: { type: 'string', format: 'date-time', nullable: true },
          },
          required: ['id','tenant_id']
        },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema
      }
    }
  }, async (request: any, reply) => {
    await idempotency.preHandler(request, reply)
      return traceAsync('people.create', async () => {
    try {
      const data = employeeSchema.parse(request.body)
      const created = await peopleRepo.create(request.user.tenantId, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      })
      return reply.code(201).send(created)
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
      }, { tenantId: request.user?.tenantId })
  })

  app.put('/api/v1/hr/people/:id', {
    preHandler: [authenticate, requireScope('hr:write')],
    schema: {
      tags: ['people'],
      body: toJsonSchema(employeeUpdateSchema, 'EmployeeUpdate'),
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tenant_id: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            created_at: { type: 'string', format: 'date-time', nullable: true },
          },
          required: ['id','tenant_id']
        },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request: any, reply) => {
      return traceAsync('people.update', async () => {
    try {
      const data = employeeUpdateSchema.parse(request.body)
      const updated = await peopleRepo.update(request.user.tenantId, request.params.id, data)
      if (!updated) return reply.code(404).send({ error: 'Employee not found' })
      return reply.send(updated)
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
      }, { tenantId: request.user?.tenantId, id: request.params?.id })
  })

  // Legacy mock endpoints with validations + RBAC
  app.post('/api/v1/hr/payroll/run', { preHandler: [authenticate, requireScope('payroll:run')], schema: { tags: ['payroll'], response: { 202: { type: 'object', properties: { runId: { type: 'string' }, status: { type: 'string' } }, required: ['runId','status'] }, 400: errorSchema, 401: errorSchema, 403: errorSchema } } }, async (request: any, reply) => {
    return traceAsync('payroll.run', async () => {
      const { simulate } = request.body || {}
      return reply
        .code(202)
        .send({ runId: 'run-1', status: simulate ? 'simulated' : 'draft' })
    }, { tenantId: request.user?.tenantId, simulate: !!(request.body && request.body.simulate) })
  })

  app.post('/api/v1/hr/time/punch', {
    preHandler: [authenticate, requireScope('time:punch')],
    schema: {
      tags: ['time'],
      body: toJsonSchema(timePunchSchema, 'TimePunch'),
      response: {
        201: { type: 'object', properties: { id: { type: 'string' } }, additionalProperties: true },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('time.punch', async () => {
      try {
        const data = timePunchSchema.parse(request.body)
        return reply.code(201).send({ id: 'punch-1', ...data })
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    }, { tenantId: request.user?.tenantId })
  })

  app.post('/api/v1/partners/zetra-consig/eligibility', {
    preHandler: [authenticate, requireScope('partners:eligibility')],
    schema: {
      tags: ['partners'],
      body: toJsonSchema(partnerEligibilitySchema, 'PartnerEligibility'),
      response: {
        200: { type: 'object', additionalProperties: true },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('partners.eligibility', async () => {
      try {
        const data = partnerEligibilitySchema.parse(request.body)
        return reply.send({ eligible: true, maxAmount: 1200.0, fee: 25.0, margin_after: 5.2, ...data })
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    }, { tenantId: request.user?.tenantId })
  })

  app.post('/api/v1/fin/payments/transfer', {
    preHandler: [authenticate, requireScope('fin:transfer')],
    onSend: [idempotency.onSend],
    schema: {
      tags: ['finance'],
      body: toJsonSchema(transferSchema, 'Transfer'),
      response: {
        202: { type: 'object', additionalProperties: true },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema
      }
    }
  }, async (request: any, reply) => {
    await idempotency.preHandler(request, reply)
    return traceAsync('finance.transfer', async () => {
      try {
        const data = transferSchema.parse(request.body)
        return reply.code(202).send({ status: 'accepted', batch_id: 'batch-1', ...data })
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    }, { tenantId: request.user?.tenantId })
  })

  // Register integration routes
  app.register(integrationsRoutes, { prefix: '' })
  // Register pilot routes for demo E-sign, PIX and Open Finance
  app.register(pilotsRoutes, { prefix: '' })
  
  // Register module routes (optional, avoid static resolution)
  if (process.env.MODULES_ENABLED === 'true') {
    const modPath = './routes/' + 'modules'
    const { modulesRoutes } = await import(modPath as any)
    app.register(modulesRoutes, { prefix: '' })
  }
  
  // Register admin routes only if DB is configured
  if (process.env.DATABASE_URL) {
    const { adminRoutes } = await import('./routes/admin')
    app.register(adminRoutes, { prefix: '' })
  }
  
  // Register marketplace routes (optional)
  if (process.env.MARKETPLACE_ENABLED === 'true') {
    const { marketplaceRoutes } = await import('./routes/marketplace')
    app.register(marketplaceRoutes, { prefix: '' })
  }
  
  // Register analytics routes (optional, avoid static resolution)
  if (process.env.ANALYTICS_ENABLED === 'true') {
    const analyticsPath = './routes/' + 'analytics'
    const { analyticsRoutes } = await import(analyticsPath as any)
    app.register(analyticsRoutes, { prefix: '' })
  }
  
  // Register revenue routes (optional, avoid static resolution)
  if (process.env.REVENUE_ENABLED === 'true') {
    const revenuePath = './routes/' + 'revenue'
    const { revenueRoutes } = await import(revenuePath as any)
    app.register(revenueRoutes, { prefix: '' })
  }
  
  // Register AI insights routes (optional, avoid static resolution)
  if (process.env.AI_ENABLED === 'true') {
    const aiPath = './routes/' + 'ai-insights'
    const { aiInsightsRoutes } = await import(aiPath as any)
    app.register(aiInsightsRoutes, { prefix: '' })
  }

  // Register compliance routes (optional, avoid static resolution)
  if (process.env.COMPLIANCE_ENABLED === 'true') {
    const compPath = './routes/' + 'compliance'
    const { complianceRoutes } = await import(compPath as any)
    app.register(complianceRoutes, { prefix: '' })
  }
  
  // Register health routes
  const { healthRoutes } = await import('./routes/health')
  app.register(healthRoutes, { prefix: '' })

  // Register OAuth2 routes (optional: require RSA keys). In testes, ignorar se chaves não existirem
  if (process.env.OAUTH_PRIVATE_KEY && process.env.OAUTH_PUBLIC_KEY) {
    const { oauthRoutes } = await import('./routes/oauth')
    app.register(oauthRoutes, { prefix: '' })
  } else if (process.env.NODE_ENV !== 'test') {
    app.log.warn('OAuth routes not registered: missing OAUTH_PRIVATE_KEY/OAUTH_PUBLIC_KEY')
  }

  // Register Partners + Sandbox routes
  const { partnersRoutes } = await import('./routes/partners')
  app.register(partnersRoutes, { prefix: '' })
  const { sandboxRoutes } = await import('./routes/sandbox')
  app.register(sandboxRoutes, { prefix: '' })
  const { webhooksRoutes } = await import('./routes/webhooks')
  app.register(webhooksRoutes, { prefix: '' })
  const { integrationsInboundWebhooksRoutes } = await import('./routes/integrations-webhooks')
  app.register(integrationsInboundWebhooksRoutes, { prefix: '' })
  const { securityRoutes } = await import('./routes/security')
  app.register(securityRoutes, { prefix: '' })

  // Tracing hooks disabled for stability

  return app
}
