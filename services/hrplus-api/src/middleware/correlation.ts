import { randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    correlationId?: string
  }
}

export const correlationMiddleware = {
  assignCorrelationId: async (req: FastifyRequest, reply: FastifyReply) => {
    const headerKey = 'x-correlation-id'
    const incoming = (req.headers[headerKey] as string) || (req.headers['x-request-id'] as string)
    const cid = incoming || randomUUID()
    req.correlationId = cid
    reply.header('X-Correlation-Id', cid)
  }
}
