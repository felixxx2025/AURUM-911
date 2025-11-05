import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { RevenueSharingModule } from '../modules/revenue-sharing'

const periodSchema = z.enum(['1d', '7d', '30d', '90d'])

export async function revenueRoutes(fastify: FastifyInstance) {
  const revenue = new RevenueSharingModule(fastify)

  // Get app revenue breakdown
  fastify.get('/api/v1/revenue/apps/:appId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        appId: z.string().uuid(),
      }),
      querystring: z.object({
        period: periodSchema.optional().default('30d'),
      })
    }
  }, async (request) => {
    const { appId } = request.params
    const { period } = request.query
    return await revenue.calculateRevenue(appId, period)
  })

  // Get developer earnings
  fastify.get('/api/v1/revenue/developers/:developerId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        developerId: z.string().uuid(),
      }),
      querystring: z.object({
        period: periodSchema.optional().default('30d'),
      })
    }
  }, async (request) => {
    const { developerId } = request.params
    const { period } = request.query
    return await revenue.getDeveloperEarnings(developerId, period)
  })

  // Process revenue split (webhook endpoint)
  fastify.post('/api/v1/revenue/process', {
    schema: {
      body: z.object({
        appId: z.string().uuid(),
        developerId: z.string().uuid(),
        tenantId: z.string().uuid(),
        amount: z.number().positive(),
        currency: z.string().default('BRL'),
        transactionType: z.enum(['subscription', 'usage', 'commission']),
        metadata: z.record(z.any()).optional(),
      })
    }
  }, async (request, reply) => {
    const transaction = request.body
    const result = await revenue.processRevenueSplit(transaction)
    return reply.code(201).send(result)
  })
}