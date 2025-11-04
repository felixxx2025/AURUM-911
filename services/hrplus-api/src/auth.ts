import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { type Secret } from 'jsonwebtoken'

export type JwtPayload = {
  sub: string
  tenant_id: string
  roles?: string[]
}

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'dev-secret') as Secret

export function signToken(payload: JwtPayload, expiresIn = '1h') {
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers['authorization']
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) {
    reply.code(401).send({ error: 'unauthorized' })
    return false
  }
  const payload = verifyToken(token)
  if (!payload) {
    reply.code(401).send({ error: 'invalid_token' })
    return false
  }
  ;(req as any).user = payload
  return true
}

export function requireRole(role: string) {
  return (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user as JwtPayload | undefined
    if (!user) {
      reply.code(401).send({ error: 'unauthorized' })
      return false
    }
    const has = user.roles?.includes(role) || user.roles?.includes('admin')
    if (!has) {
      reply.code(403).send({ error: 'forbidden', missing: role })
      return false
    }
    return true
  }
}
