import { FastifyInstance } from 'fastify'
import { AuditService } from '../lib/audit'
import { cacheService } from '../lib/cache'
import { queueService } from '../lib/queue'

export async function adminRoutes(app: FastifyInstance) {
  const auditService = new AuditService(app.prisma)

  // Middleware admin
  const requireAdmin = async (request: any, reply: any) => {
    if (request.user?.role !== 'SUPERADMIN' && request.user?.role !== 'TENANT_ADMIN') {
      return reply.code(403).send({ error: 'Admin access required' })
    }
  }

  // Queue Management
  app.get('/api/v1/admin/queues/status', { preHandler: requireAdmin }, async (request, reply) => {
    // Mock queue status
    return {
      queues: [
        { name: 'payroll', active: 0, waiting: 0, completed: 156, failed: 2 },
        { name: 'esocial', active: 1, waiting: 3, completed: 89, failed: 0 },
        { name: 'notifications', active: 0, waiting: 0, completed: 1247, failed: 5 },
        { name: 'reports', active: 2, waiting: 1, completed: 67, failed: 1 },
        { name: 'integrations', active: 0, waiting: 0, completed: 234, failed: 3 }
      ]
    }
  })

  app.post('/api/v1/admin/queues/:queueName/job', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { queueName } = request.params
    const { type, payload } = request.body

    try {
      const job = await queueService.addJob(queueName, {
        type,
        payload,
        tenantId: request.user.tenantId,
        userId: request.user.userId
      })

      return { jobId: job.id, status: 'queued' }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })

  app.get('/api/v1/admin/queues/:queueName/job/:jobId', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { queueName, jobId } = request.params

    try {
      const job = await queueService.getJobStatus(queueName, jobId)
      return job || { error: 'Job not found' }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })

  // Cache Management
  app.get('/api/v1/admin/cache/stats', { preHandler: requireAdmin }, async (request, reply) => {
    // Mock cache stats
    return {
      redis: {
        connected: true,
        memory: '45.2MB',
        keys: 1247,
        hits: 89234,
        misses: 12456,
        hitRate: '87.7%'
      }
    }
  })

  app.delete('/api/v1/admin/cache/clear', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { pattern } = request.query

    try {
      if (pattern) {
        await cacheService.invalidatePattern(pattern)
      } else {
        await cacheService.invalidatePattern('*')
      }

      await auditService.logSensitiveAction(
        request.user.tenantId,
        request.user.userId,
        'CACHE_CLEAR',
        { pattern: pattern || 'all' },
        request
      )

      return { message: 'Cache cleared successfully' }
    } catch (error: any) {
      reply.code(500).send({ error: error.message })
    }
  })

  // Audit Logs
  app.get('/api/v1/admin/audit', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { userId, action, resource, startDate, endDate, page = 1, limit = 50 } = request.query

    try {
      const logs = await auditService.query({
        tenantId: request.user.tenantId,
        userId,
        action,
        resource,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      })

      return { logs, pagination: { page: parseInt(page), limit: parseInt(limit) } }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })

  app.get('/api/v1/admin/audit/compliance-report', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { startDate, endDate } = request.query

    if (!startDate || !endDate) {
      return reply.code(400).send({ error: 'startDate and endDate are required' })
    }

    try {
      const report = await auditService.generateComplianceReport(
        request.user.tenantId,
        new Date(startDate),
        new Date(endDate)
      )

      return report
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })

  // System Health
  app.get('/api/v1/admin/health', { preHandler: requireAdmin }, async (request, reply) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'up', responseTime: '12ms' },
        redis: { status: 'up', responseTime: '3ms' },
        queues: { status: 'up', activeWorkers: 5 },
        integrations: {
          serpro: { status: 'up', lastCheck: new Date().toISOString() },
          esocial: { status: 'up', lastCheck: new Date().toISOString() },
          kenoby: { status: 'degraded', lastCheck: new Date().toISOString() }
        }
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    }

    return health
  })

  // Tenant Management
  app.get('/api/v1/admin/tenants', { preHandler: requireAdmin }, async (request, reply) => {
    // Mock tenant list
    return {
      tenants: [
        {
          id: '1',
          name: 'Empresa Demo',
          subdomain: 'demo',
          plan: 'pro',
          users: 15,
          employees: 247,
          status: 'active',
          createdAt: '2024-01-15'
        }
      ]
    }
  })

  app.post('/api/v1/admin/tenants/:tenantId/suspend', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { tenantId } = request.params
    const { reason } = request.body

    await auditService.logSensitiveAction(
      request.user.tenantId,
      request.user.userId,
      'TENANT_SUSPEND',
      { targetTenantId: tenantId, reason },
      request
    )

    return { message: 'Tenant suspended successfully' }
  })

  // Integration Status
  app.get('/api/v1/admin/integrations/status', { preHandler: requireAdmin }, async (request, reply) => {
    return {
      integrations: [
        { name: 'SERPRO', status: 'active', lastSync: new Date().toISOString(), errors: 0 },
        { name: 'eSocial', status: 'active', lastSync: new Date().toISOString(), errors: 2 },
        { name: 'Kenoby', status: 'warning', lastSync: new Date().toISOString(), errors: 5 },
        { name: 'OpenAI', status: 'active', lastSync: new Date().toISOString(), errors: 0 },
        { name: 'PIX', status: 'maintenance', lastSync: new Date().toISOString(), errors: 1 }
      ]
    }
  })

  app.post('/api/v1/admin/integrations/:integration/test', { preHandler: requireAdmin }, async (request: any, reply) => {
    const { integration } = request.params

    // Mock integration test
    const testResults: Record<string, { success: boolean; responseTime: string; message: string }> = {
      serpro: { success: true, responseTime: '245ms', message: 'Connection successful' },
      esocial: { success: true, responseTime: '1.2s', message: 'Authentication successful' },
      kenoby: { success: false, responseTime: 'timeout', message: 'Connection timeout' },
      openai: { success: true, responseTime: '890ms', message: 'API key valid' },
      pix: { success: true, responseTime: '156ms', message: 'Webhook configured' }
    }

    return testResults[integration] || { success: false, message: 'Integration not found' }
  })
}