import type { FastifyInstance } from 'fastify'
import client from 'prom-client'

const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status'] as const,
})
register.registerMetric(httpRequests)

export function setupMetrics(app: FastifyInstance) {
  app.addHook('onResponse', async (req: any, reply: any) => {
    const route = req?.routeOptions?.url || req?.routerPath || req?.url
    httpRequests.inc({ method: req.method, route, status: String(reply.statusCode) })
  })

  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', register.contentType)
    return reply.send(await register.metrics())
  })
}
