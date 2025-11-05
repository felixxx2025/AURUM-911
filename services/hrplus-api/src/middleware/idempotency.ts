import { FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    _idempotencyKey?: string
  }
}

type CachedResponse = {
  statusCode: number
  payload: string
  headers: Record<string, string>
}

// In-memory store with simple TTL (default 24h)
const store = new Map<string, { value: CachedResponse; expiresAt: number }>()
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key)
  }
}

function keyFor(req: FastifyRequest, idempotencyKey: string) {
  // Route + method + key provide enough uniqueness; body hash poderia ser adicionado no futuro
  return `${req.method}:${req.routerPath || req.url}:${idempotencyKey}`
}

export const idempotency = {
  preHandler: async (req: FastifyRequest, reply: FastifyReply) => {
    const idk = (req.headers['idempotency-key'] as string) || ''
    if (!idk) return // not enforced globally; aplicar por rota

    const k = keyFor(req, idk)
    cleanup()
    const cached = store.get(k)
    if (cached) {
      // Replay cached response
      for (const [h, v] of Object.entries(cached.value.headers)) reply.header(h, v)
      reply.header('Idempotency-Replayed', 'true')
      reply.code(cached.value.statusCode)
      return reply.send(cached.value.payload)
    }
    // Mark as processing using a temp header; se outra requisição chegar, responder 409
    reply.header('Idempotency-Key', idk)
    req._idempotencyKey = idk
  },

  onSend: async (req: FastifyRequest, reply: FastifyReply, payload: unknown) => {
    const idk = req._idempotencyKey
    if (!idk) return
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      const k = keyFor(req, idk)
      const headers: Record<string, string> = {}
      // Capture a small subset of headers useful for replay
      for (const h of ['content-type', 'x-correlation-id', 'idempotency-key']) {
        const v = reply.getHeader(h)
        if (typeof v === 'string') headers[h] = v
      }
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
      store.set(k, { value: { statusCode: reply.statusCode, payload: body, headers }, expiresAt: Date.now() + DEFAULT_TTL_MS })
    }
  },
}
