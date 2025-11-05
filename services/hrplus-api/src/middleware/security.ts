import { FastifyRequest, FastifyReply } from 'fastify'

export const securityMiddleware = {
  rateLimit: {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Rate limit exceeded',
      message: 'Muitas tentativas. Tente novamente em 1 minuto.',
    }),
  },

  loginRateLimit: {
    max: 5,
    timeWindow: '15 minutes',
    keyGenerator: (req: FastifyRequest) => {
      const body = req.body as any
      return `login:${body?.email || req.ip}`
    },
    errorResponseBuilder: () => ({
      error: 'Login rate limit exceeded',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    }),
  },

  inputValidation: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    
    if (body && typeof body === 'object') {
      for (const key in body) {
        if (typeof body[key] === 'string') {
          body[key] = body[key].trim()
          body[key] = body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        }
      }
    }
  },

  attackDetection: async (req: FastifyRequest, reply: FastifyReply) => {
    const userAgent = req.headers['user-agent'] || ''
    const suspicious = ['sqlmap', 'nikto', 'nmap', 'burp', 'w3af']
    
    if (suspicious.some(tool => userAgent.toLowerCase().includes(tool))) {
      reply.code(403).send({ error: 'Suspicious activity detected' })
      return
    }
  },
}