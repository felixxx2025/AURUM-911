import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AIInsightsModule } from '../modules/ai-insights'

export async function aiInsightsRoutes(fastify: FastifyInstance) {
  const aiInsights = new AIInsightsModule(fastify)

  fastify.get('/api/v1/ai/insights/turnover', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    return await aiInsights.predictTurnover(request.user.tenantId)
  })

  fastify.get('/api/v1/ai/insights/performance', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    return await aiInsights.analyzePerformanceTrends(request.user.tenantId)
  })

  fastify.post('/api/v1/ai/insights/hiring', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        jobDescription: z.string().min(50),
      })
    }
  }, async (request) => {
    const { jobDescription } = request.body
    return await aiInsights.generateHiringRecommendations(request.user.tenantId, jobDescription)
  })

  fastify.get('/api/v1/ai/insights/salary', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    return await aiInsights.predictSalaryAdjustments(request.user.tenantId)
  })

  fastify.get('/api/v1/ai/insights/dashboard', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const [turnover, performance, salary] = await Promise.all([
      aiInsights.predictTurnover(request.user.tenantId),
      aiInsights.analyzePerformanceTrends(request.user.tenantId),
      aiInsights.predictSalaryAdjustments(request.user.tenantId),
    ])

    return {
      summary: {
        turnoverRisk: turnover.prediction.riskPercentage,
        performanceTrend: performance.prediction.trendDirection,
        salaryAdjustments: salary.prediction.employeesForAdjustment,
      },
      insights: { turnover, performance, salary },
      generatedAt: new Date().toISOString(),
    }
  })
}