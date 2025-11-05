import { FastifyRequest, FastifyReply } from 'fastify'
import { promClient } from '../metrics'

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
})

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
})

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
})

export const monitoringMiddleware = {
  requestMetrics: async (req: FastifyRequest, reply: FastifyReply) => {
    const start = Date.now()
    activeConnections.inc()

    reply.addHook('onSend', async () => {
      const duration = (Date.now() - start) / 1000
      const labels = {
        method: req.method,
        route: req.routerPath || 'unknown',
        status_code: reply.statusCode.toString(),
        tenant_id: req.tenantId || 'none',
      }

      httpRequestDuration.observe(labels, duration)
      httpRequestsTotal.inc(labels)
      activeConnections.dec()
    })
  },

  errorTracking: async (req: FastifyRequest, reply: FastifyReply) => {
    reply.addHook('onError', async (request, reply, error) => {
      console.error('Request error:', {
        url: request.url,
        method: request.method,
        tenantId: request.tenantId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    })
  },

  performanceLogging: async (req: FastifyRequest, reply: FastifyReply) => {
    const start = process.hrtime.bigint()
    
    reply.addHook('onSend', async () => {
      const end = process.hrtime.bigint()
      const duration = Number(end - start) / 1000000 // Convert to ms
      
      if (duration > 1000) { // Log slow requests (>1s)
        console.warn('Slow request detected:', {
          url: req.url,
          method: req.method,
          duration: `${duration}ms`,
          tenantId: req.tenantId,
        })
      }
    })
  },
}