import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AnalyticsModule } from '../modules/analytics'

const periodSchema = z.enum(['1d', '7d', '30d', '90d'])

export async function analyticsRoutes(fastify: FastifyInstance) {
  const analytics = new AnalyticsModule(fastify)

  // Get dashboard metrics
  fastify.get('/api/v1/analytics/dashboard', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        period: periodSchema.optional().default('7d'),
      })
    }
  }, async (request) => {
    const { period } = request.query
    return await analytics.getDashboardMetrics(request.user.tenantId, period)
  })

  // Track custom event
  fastify.post('/api/v1/analytics/events', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        eventType: z.string(),
        module: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    }
  }, async (request, reply) => {
    const { eventType, module, metadata } = request.body
    
    await analytics.trackEvent({
      tenantId: request.user.tenantId,
      userId: request.user.userId,
      eventType,
      module,
      metadata,
    })

    return reply.code(201).send({ success: true })
  })

  // Get module usage stats
  fastify.get('/api/v1/analytics/modules', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        period: periodSchema.optional().default('30d'),
      })
    }
  }, async (request) => {
    const { period } = request.query
    const metrics = await analytics.getDashboardMetrics(request.user.tenantId, period)
    return { moduleUsage: metrics.moduleUsage, period }
  })
}