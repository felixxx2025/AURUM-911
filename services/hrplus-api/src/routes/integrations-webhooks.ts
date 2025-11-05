import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import crypto from 'node:crypto'
import client from 'prom-client'

import { inboundValidators } from '../contracts/integrations-schemas'
import { register } from '../metrics'

// Time window constants for stats and KPI calculations (in milliseconds)
const TIME_WINDOWS = {
  '5m': 5 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
} as const

type HeadersLike = Record<string, string | string[] | undefined>

type InboundLog = {
  id: string
  provider: string
  receivedAt: string
  verified: boolean
  signature?: string
  timestamp?: string
  correlationId?: string
  headers: HeadersLike
  body: unknown
}

const logs: InboundLog[] = []
const MAX_LOGS = 2000

const inboundCounter = new client.Counter({
  name: 'integrations_inbound_webhooks_total',
  help: 'Total de webhooks inbound recebidos por conector',
  labelNames: ['provider', 'verified'] as const,
})
register.registerMetric(inboundCounter)

const inboundLatency = new client.Histogram({
  name: 'integrations_inbound_webhook_duration_seconds',
  help: 'Duração do processamento de webhooks inbound por conector',
  labelNames: ['provider'] as const,
  buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5]
})
register.registerMetric(inboundLatency)

const inbound4xx = new client.Counter({
  name: 'integrations_inbound_webhooks_4xx_total',
  help: 'Total de respostas 4xx em webhooks inbound',
  labelNames: ['provider'] as const,
})
register.registerMetric(inbound4xx)

const validationErrors = new client.Counter({
  name: 'integrations_inbound_webhooks_validation_errors_total',
  help: 'Total de erros de validação por conector e tipo de erro',
  labelNames: ['provider', 'event_type', 'error_type'] as const,
})
register.registerMetric(validationErrors)

const successRate = new client.Gauge({
  name: 'integrations_inbound_webhooks_success_rate',
  help: 'Taxa de sucesso de webhooks por conector',
  labelNames: ['provider'] as const,
})
register.registerMetric(successRate)

const verificationFailures = new client.Counter({
  name: 'integrations_inbound_webhooks_verification_failures_total',
  help: 'Total de falhas de verificação de assinatura por conector',
  labelNames: ['provider'] as const,
})
register.registerMetric(verificationFailures)

function hmac256(secret: string, base: string) {
  return crypto.createHmac('sha256', secret).update(base).digest('hex')
}

function tryVerifyGeneric(headers: HeadersLike, body: unknown, secret?: string): { ok: boolean; sig?: string; ts?: string } {
  if (!secret) return { ok: false }
  // Padrão genérico compatível com nosso outbound: x-aurum-signature: t=<ts>,v1=<hmac>
  const sigHeader = String(headers['x-aurum-signature'] || '')
  if (!sigHeader.includes('v1=')) return { ok: false }
  const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('='))) as Record<string, string>
  const ts = parts['t']
  const v1 = parts['v1']
  const base = `${ts}.${typeof body === 'string' ? body : JSON.stringify(body)}`
  const expected = hmac256(secret, base)
  const ok = crypto.timingSafeEqual(Buffer.from(v1||''), Buffer.from(expected))
  return { ok, sig: v1, ts }
}

export async function integrationsInboundWebhooksRoutes(app: FastifyInstance) {
  // Recebe webhooks de provedores externos
  // Note: Rate limiting is configured globally via @fastify/rate-limit in app.ts
  // For production, consider per-provider rate limits based on SLA agreements
  // Webhooks are also protected by HMAC signature verification
  app.post('/integrations/webhooks/:provider', { 
    schema: { 
      tags: ['integrations'], 
      security: [], 
      body: { type: ['object','string'] }, 
      response: { 
        202: { type: 'object', properties: { status: { type: 'string' }, id: { type: 'string' }, verified: { type: 'boolean' } }, required: ['status','id','verified'] }, 
        400: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array', items: { type: 'string' } } }, required: ['error'] } 
      } 
    },
    config: {
      // Per-route rate limit: 1000 requests per minute per IP for webhooks
      // This is generous to accommodate legitimate provider traffic bursts
      rateLimit: { max: 1000, timeWindow: '1 minute' }
    }
  }, async (request: FastifyRequest<{ Params: { provider: string }; Body: unknown }>, reply: FastifyReply) => {
    const endTimer = inboundLatency.startTimer()
    const provider = String(request.params.provider || '').toLowerCase()
    const rawSecretEnv = `AURUM_INTEGRATIONS_${provider.replace(/[^a-z0-9]/g,'').toUpperCase()}_WEBHOOK_SECRET`
    const secret = process.env[rawSecretEnv]
    // Validação opcional por provider/type (não quebra provedores desconhecidos)
    let validationErrors_local: string[] | undefined
    try {
      const bt = request.body && typeof request.body === 'object' ? (request.body as Record<string, unknown>) : undefined
      const t = typeof (bt?.['type']) === 'string' ? String(bt?.['type']) : undefined
      const validator = t ? inboundValidators[provider]?.[t] : undefined
      if (validator && bt) {
        const r = validator.safeParse(bt)
        if (!r.success) { 
          // Use the first error's code as representative error type for metrics
          // Multiple errors would require aggregation strategy to be defined
          const errorType = r.error.errors[0]?.code || 'unknown'
          validationErrors_local = r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
          validationErrors.inc({ provider, event_type: t || 'unknown', error_type: errorType })
          inbound4xx.inc({ provider })
          endTimer({ provider })
          return reply.code(400).send({ error: 'invalid_payload', details: validationErrors_local })
        }
      }
    } catch {
      // ignora validação para formatos desconhecidos
    }
    const verification = tryVerifyGeneric(request.headers, request.body, secret)
    // Track verification failures
    if (!verification.ok && secret) {
      verificationFailures.inc({ provider })
    }
    // event_id para deduplicação: preferir id/event_id do payload; fallback hash do corpo
    const bto = request.body && typeof request.body === 'object' ? (request.body as Record<string, unknown>) : undefined
    const bodyStr = typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
    const rawId = (bto?.['event_id'] as string | undefined) || (bto?.['id'] as string | undefined) || hmac256('evt', bodyStr)
    const id = `in-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const entry: InboundLog = {
      id,
      provider,
      receivedAt: new Date().toISOString(),
      verified: verification.ok,
      signature: verification.sig,
      timestamp: verification.ts,
      correlationId: request.headers['x-correlation-id'] as string | undefined,
      headers: request.headers,
      body: request.body,
    }
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS)
    inboundCounter.inc({ provider, verified: String(entry.verified) })
    // Persistência em DB se disponível
    try {
  interface PrismaInboundLike { inboundWebhookLog: { deleteMany: (args: unknown) => Promise<unknown>; create: (args: unknown) => Promise<unknown> } }
  const prisma = (app as unknown as { prisma?: PrismaInboundLike }).prisma
      if (prisma?.inboundWebhookLog) {
        const ttlDays = Number(process.env.INBOUND_LOG_TTL_DAYS || 30)
        const expiresAt = new Date(Date.now() + ttlDays*24*60*60*1000)
        // Cleanup simples por TTL
        await prisma.inboundWebhookLog.deleteMany({ where: { expires_at: { lt: new Date() } } })
        await prisma.inboundWebhookLog.create({ data: {
          provider,
          event_id: rawId,
          received_at: new Date(entry.receivedAt),
          verified: entry.verified,
          signature: entry.signature,
          timestamp: entry.timestamp,
          correlation_id: entry.correlationId,
          headers: entry.headers as unknown,
          body: entry.body as unknown,
          expires_at: expiresAt,
        } })
      }
    } catch (error: unknown) {
      // Ignora erro de unique (dedupe) e demais erros de DB não bloqueiam 202
      // Ainda assim, registramos em log de nível warn para observabilidade
      try {
        app.log.warn({ err: error }, 'inbound log persistence error')
      } catch {
        // noop
      }
    }
    const res = reply.code(202).send({ status: 'accepted', id, verified: entry.verified })
    endTimer({ provider })
    return res
  })

  // Consulta logs de webhooks recebidos
  app.get('/integrations/webhooks/logs', { schema: { tags: ['integrations'], security: [], querystring: { type: 'object', properties: { provider: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 200 }, offset: { type: 'integer', minimum: 0 } } } } }, async (request: FastifyRequest<{ Querystring: { provider?: string; limit?: number; offset?: number } }>) => {
    const provider = request.query?.provider?.toLowerCase()
    const limit = Number(request.query?.limit || 50)
    const offset = Number(request.query?.offset || 0)
    const filtered = provider ? logs.filter(l => l.provider === provider) : logs
    const items = filtered.slice(offset, offset + limit)
    return { items, total: filtered.length, limit, offset }
  })

  // Estatísticas simples a partir dos logs em memória
  app.get('/integrations/webhooks/stats', { schema: { tags: ['integrations'], security: [], querystring: { type: 'object', properties: { provider: { type: 'string' }, window: { type: 'string', enum: ['5m', '1h', '24h', 'all'] } } }, response: { 200: { type: 'object', additionalProperties: true } } } }, async (request: FastifyRequest<{ Querystring: { provider?: string; window?: string } }>) => {
    const providerFilter = request.query?.provider?.toLowerCase()
    const timeWindow = request.query?.window || 'all'
    
    // Calculate time threshold based on window
    const now = Date.now()
    let timeThreshold = 0
    if (timeWindow === '5m') timeThreshold = now - TIME_WINDOWS['5m']
    else if (timeWindow === '1h') timeThreshold = now - TIME_WINDOWS['1h']
    else if (timeWindow === '24h') timeThreshold = now - TIME_WINDOWS['24h']
    
    // Filter logs by time window and provider
    const filteredLogs = logs.filter(l => {
      const logTime = new Date(l.receivedAt).getTime()
      const matchesTime = timeWindow === 'all' || logTime >= timeThreshold
      const matchesProvider = !providerFilter || l.provider === providerFilter
      return matchesTime && matchesProvider
    })
    
    // Calculate KPIs by provider
    const byProvider: Record<string, {
      total: number
      verified: number
      unverified: number
      successRate: number
      verificationRate: number
      latestReceived?: string
      oldestReceived?: string
    }> = Object.create(null) // Use null prototype to prevent prototype pollution
    
    for (const l of filteredLogs) {
      if (!byProvider[l.provider]) {
        byProvider[l.provider] = {
          total: 0,
          verified: 0,
          unverified: 0,
          successRate: 0,
          verificationRate: 0
        }
      }
      
      const rec = byProvider[l.provider]
      rec.total += 1
      if (l.verified) rec.verified += 1
      else rec.unverified += 1
      
      // Track time range
      if (!rec.latestReceived || l.receivedAt > rec.latestReceived) {
        rec.latestReceived = l.receivedAt
      }
      if (!rec.oldestReceived || l.receivedAt < rec.oldestReceived) {
        rec.oldestReceived = l.receivedAt
      }
    }
    
    // Calculate rates
    for (const provider in byProvider) {
      const rec = byProvider[provider]
      rec.verificationRate = rec.total > 0 ? rec.verified / rec.total : 0
      // TODO: In future, success rate may differ from verification rate if we track delivery outcomes
      rec.successRate = rec.verificationRate // For now, success = verification
    }
    
    // Overall stats
    const totalWebhooks = filteredLogs.length
    const totalVerified = filteredLogs.filter(l => l.verified).length
    const overallVerificationRate = totalWebhooks > 0 ? totalVerified / totalWebhooks : 0
    
    return {
      window: timeWindow,
      provider: providerFilter || 'all',
      overall: {
        total: totalWebhooks,
        verified: totalVerified,
        unverified: totalWebhooks - totalVerified,
        verificationRate: overallVerificationRate,
        successRate: overallVerificationRate
      },
      providers: byProvider
    }
  })

  // KPIs detalhados para dashboard e monitoramento
  app.get('/integrations/webhooks/kpis', { schema: { tags: ['integrations'], security: [], querystring: { type: 'object', properties: { provider: { type: 'string' } } }, response: { 200: { type: 'object', additionalProperties: true } } } }, async (request: FastifyRequest<{ Querystring: { provider?: string } }>) => {
    const providerFilter = request.query?.provider?.toLowerCase()
    const now = Date.now()
    
    // Time windows for different metrics
    const windows = {
      last5m: now - TIME_WINDOWS['5m'],
      last1h: now - TIME_WINDOWS['1h'],
      last24h: now - TIME_WINDOWS['24h']
    }
    
    // Filter logs
    const filteredLogs = providerFilter 
      ? logs.filter(l => l.provider === providerFilter)
      : logs
    
    // Calculate KPIs for each time window
    const kpis: Record<string, {
      totalRequests: number
      verifiedRequests: number
      unverifiedRequests: number
      verificationRate: number
      requestsPerMinute: number
    }> = {}
    
    for (const [windowName, threshold] of Object.entries(windows)) {
      const windowLogs = filteredLogs.filter(l => new Date(l.receivedAt).getTime() >= threshold)
      const totalRequests = windowLogs.length
      const verifiedRequests = windowLogs.filter(l => l.verified).length
      const unverifiedRequests = totalRequests - verifiedRequests
      
      // Calculate time span in minutes for rate calculation
      const windowMinutes = windowName === 'last5m' ? 5 : windowName === 'last1h' ? 60 : 24 * 60
      
      kpis[windowName] = {
        totalRequests,
        verifiedRequests,
        unverifiedRequests,
        verificationRate: totalRequests > 0 ? verifiedRequests / totalRequests : 0,
        requestsPerMinute: totalRequests / windowMinutes
      }
    }
    
    // Provider-specific metrics
    const providerMetrics: Record<string, {
      total: number
      verified: number
      verificationRate: number
      last5mCount: number
    }> = Object.create(null) // Use null prototype to prevent prototype pollution
    
    for (const log of filteredLogs) {
      if (!providerMetrics[log.provider]) {
        providerMetrics[log.provider] = {
          total: 0,
          verified: 0,
          verificationRate: 0,
          last5mCount: 0
        }
      }
      
      const metric = providerMetrics[log.provider]
      metric.total += 1
      if (log.verified) metric.verified += 1
      
      const logTime = new Date(log.receivedAt).getTime()
      if (logTime >= windows.last5m) {
        metric.last5mCount += 1
      }
    }
    
    // Calculate rates
    for (const provider in providerMetrics) {
      const metric = providerMetrics[provider]
      metric.verificationRate = metric.total > 0 ? metric.verified / metric.total : 0
    }
    
    // Update success rate gauge metric for each provider
    for (const [provider, metric] of Object.entries(providerMetrics)) {
      successRate.set({ provider }, metric.verificationRate)
    }
    
    return {
      provider: providerFilter || 'all',
      timestamp: new Date().toISOString(),
      kpis,
      providers: providerMetrics,
      summary: {
        totalProviders: Object.keys(providerMetrics).length,
        totalWebhooks: filteredLogs.length,
        totalVerified: filteredLogs.filter(l => l.verified).length
      }
    }
  })
}
