import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import client from 'prom-client'

export const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status'] as const,
})
register.registerMetric(httpRequests)

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
})
register.registerMetric(httpDuration)

export function setupMetrics(app: FastifyInstance) {
  app.addHook('onRequest', async (req: FastifyRequest & { _timer?: (labels: Record<string, string>) => void }) => {
    req._timer = httpDuration.startTimer()
  })
  app.addHook('onResponse', async (req: FastifyRequest & { _timer?: (labels: Record<string, string>) => void }, reply: FastifyReply) => {
    const route = req?.routeOptions?.url || req?.routerPath || req?.url
    const labels = { method: req.method, route, status: String(reply.statusCode) }
    httpRequests.inc(labels)
    if (req._timer) {
      try {
        req._timer(labels)
      } catch {
        /* ignore metrics timer errors */
      }
    }
  })

  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', register.contentType)
    return reply.send(await register.metrics())
  })
}
