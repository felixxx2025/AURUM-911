/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { signWebhook } from '../lib/hmac';

type WebhookConfig = { id: string; url: string; eventTypes: string[] }
type Partner = {
  id: string
  name: string
  clientId: string
  clientSecret: string
  webhookSecret: string
  scopes: string[]
  webhooks: WebhookConfig[]
}

type DeliveryStatus = 'queued' | 'delivered' | 'failed'
type DeliveryLog = {
  id: string
  partnerId: string
  webhookId: string
  event: string
  payload: unknown
  status: DeliveryStatus
  attempt: number
  responseStatus?: number
  responseBody?: string
  lastError?: string
  timestamp: number
}

const partners = new Map<string, Partner>()
const deliveries = new Map<string, DeliveryLog>()

function uuid() { return crypto.randomUUID() }

async function dispatchEvent(event: string, payload: unknown) {
  const proms: Promise<void>[] = []
  for (const p of partners.values()) {
    for (const wh of p.webhooks) {
      if (!wh.eventTypes.includes(event)) continue
      const id = uuid()
      const log: DeliveryLog = {
        id, partnerId: p.id, webhookId: wh.id, event, payload, status: 'queued', attempt: 0, timestamp: Date.now()
      }
      deliveries.set(id, log)
      proms.push(sendOnce(p, wh, log))
    }
  }
  await Promise.allSettled(proms)
}

async function sendOnce(partner: Partner, webhook: WebhookConfig, log: DeliveryLog) {
  log.attempt += 1
  const headers = signWebhook(log.payload, partner.webhookSecret)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ event: log.event, data: log.payload, id: log.id, createdAt: new Date(log.timestamp).toISOString() }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    log.responseStatus = res.status
    log.responseBody = await res.text().catch(() => '')
    log.status = res.ok ? 'delivered' : 'failed'
    if (!res.ok) log.lastError = `HTTP ${res.status}`
  } catch (err: any) {
    clearTimeout(timer)
    log.status = 'failed'
    log.lastError = err?.message || 'network_error'
  } finally {
    deliveries.set(log.id, log)
  }
}

export async function partnersRoutes(app: FastifyInstance) {
  // Criar parceiro (admin)
  app.post('/api/v1/partners', { preHandler: app.auth([app.authenticate, app.requireScope('partners:admin')]) as any, schema: {
    tags: ['partners'],
    body: { type: 'object', properties: { name: { type: 'string' }, scopes: { type: 'array', items: { type: 'string' } } }, required: ['name'] },
    response: { 201: { type: 'object', properties: { id: { type: 'string' }, clientId: { type: 'string' }, clientSecret: { type: 'string' }, webhookSecret: { type: 'string' }, scopes: { type: 'array', items: { type: 'string' } } }, required: ['id','clientId','clientSecret','webhookSecret'] } }
  } }, async (req: FastifyRequest<{ Body: { name: string; scopes?: string[] } }>, reply: FastifyReply) => {
    const id = uuid()
    const partner: Partner = {
      id,
      name: req.body.name,
      clientId: `cli_${uuid()}`,
      clientSecret: `sec_${uuid()}`,
      webhookSecret: `whs_${uuid()}`,
      scopes: req.body.scopes?.length ? req.body.scopes : ['*'],
      webhooks: [],
    }
    partners.set(id, partner)
    return reply.code(201).send({ id: partner.id, clientId: partner.clientId, clientSecret: partner.clientSecret, webhookSecret: partner.webhookSecret, scopes: partner.scopes })
  })

  // Listar parceiros (read)
  app.get('/api/v1/partners', { preHandler: [(app as any).authenticate, (app as any).requireScope('partners:read')], schema: { tags: ['partners'] } as any }, async () => {
    return Array.from(partners.values()).map(p => ({ id: p.id, name: p.name, scopes: p.scopes, webhooks: p.webhooks.length }))
  })

  // Rotacionar credenciais (admin)
  app.post('/api/v1/partners/:id/rotate-credentials', { preHandler: [(app as any).authenticate, (app as any).requireScope('partners:admin')], schema: { tags: ['partners'], params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } } as any }, async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const p = partners.get(req.params.id)
    if (!p) return { error: 'not_found' }
    p.clientSecret = `sec_${uuid()}`
    p.webhookSecret = `whs_${uuid()}`
    return { id: p.id, clientId: p.clientId, clientSecret: p.clientSecret, webhookSecret: p.webhookSecret }
  })

  // Registrar webhook (webhooks)
  app.post('/api/v1/partners/:id/webhooks', { preHandler: [(app as any).authenticate, (app as any).requireScope('partners:webhooks')], schema: {
    tags: ['partners'],
    params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    body: { type: 'object', properties: { url: { type: 'string' }, eventTypes: { type: 'array', items: { type: 'string' }, minItems: 1 } }, required: ['url','eventTypes'] }
  } as any }, async (req: FastifyRequest<{ Params: { id: string }; Body: { url: string; eventTypes: string[] } }>, reply: FastifyReply) => {
    const p = partners.get(req.params.id)
    if (!p) return reply.code(404).send({ error: 'not_found' })
    const wh: WebhookConfig = { id: uuid(), url: req.body.url, eventTypes: req.body.eventTypes }
    p.webhooks.push(wh)
    return reply.code(201).send(wh)
  })

  // Listar webhooks
  app.get('/api/v1/partners/:id/webhooks', { preHandler: [(app as any).authenticate, (app as any).requireScope('partners:read')], schema: { tags: ['partners'], params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } } as any }, async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const p = partners.get(req.params.id)
    if (!p) return reply.code(404).send({ error: 'not_found' })
    return p.webhooks
  })

  // Listar logs
  app.get('/api/v1/partners/:id/logs', {
    preHandler: [(app as any).authenticate, (app as any).requireScope('partners:read')],
    schema: {
      tags: ['partners'],
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['queued','delivered','failed','all'], nullable: true },
          q: { type: 'string', nullable: true },
          from: { type: 'string', nullable: true },
          to: { type: 'string', nullable: true },
          limit: { type: 'integer', minimum: 1, maximum: 500, nullable: true },
          offset: { type: 'integer', minimum: 0, nullable: true },
          sort: { type: 'string', enum: ['asc','desc'], nullable: true }
        }
      }
    } as any
  }, async (req: FastifyRequest<{ Params: { id: string }; Querystring: { status?: 'queued'|'delivered'|'failed'|'all'; q?: string; from?: string; to?: string; limit?: number; offset?: number; sort?: 'asc'|'desc' } }>, reply: FastifyReply) => {
    const p = partners.get(req.params.id)
    if (!p) return reply.code(404).send({ error: 'not_found' })
    const { status = 'all', q, from, to, limit = 200, offset = 0, sort = 'desc' } = (req.query || {})
    let list = Array.from(deliveries.values()).filter(d => d.partnerId === p.id)
    if (status && status !== 'all') list = list.filter(d => d.status === status)
    // Date range filter
    let fromTs: number | null = null
    let toTs: number | null = null
    if (from && typeof from === 'string' && from.trim()) {
      const t = Date.parse(from)
      if (!isNaN(t)) fromTs = t
    }
    if (to && typeof to === 'string' && to.trim()) {
      const t = Date.parse(to)
      if (!isNaN(t)) toTs = t
    }
    if (fromTs != null) list = list.filter(d => d.timestamp >= fromTs!)
    if (toTs != null) list = list.filter(d => d.timestamp <= toTs!)
    if (q && q.trim()) {
      const term = q.trim().toLowerCase()
      list = list.filter(d =>
        d.id.toLowerCase().includes(term) ||
        d.event.toLowerCase().includes(term) ||
        (d.lastError || '').toLowerCase().includes(term) ||
        String(d.responseStatus || '').includes(term)
      )
    }
    list.sort((a,b) => sort === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp)
    const slice = list.slice(offset, offset + limit)
    reply.header('X-Total-Count', String(list.length))
    reply.header('X-Result-Limit', String(limit))
    reply.header('X-Result-Offset', String(offset))
    return slice
  })

  // Replay
  app.post('/api/v1/partners/:id/webhooks/:deliveryId/replay', { preHandler: [(app as any).authenticate, (app as any).requireScope('partners:replay')], schema: { tags: ['partners'], params: { type: 'object', properties: { id: { type: 'string' }, deliveryId: { type: 'string' } }, required: ['id','deliveryId'] } } as any }, async (req: FastifyRequest<{ Params: { id: string; deliveryId: string } }>, reply: FastifyReply) => {
    const p = partners.get(req.params.id)
    if (!p) return reply.code(404).send({ error: 'not_found' })
    const log = deliveries.get(req.params.deliveryId)
    if (!log || log.partnerId !== p.id) return reply.code(404).send({ error: 'delivery_not_found' })
    const wh = p.webhooks.find(w => w.id === log.webhookId)
    if (!wh) return reply.code(404).send({ error: 'webhook_not_found' })
    await sendOnce(p, wh, log)
    return { id: log.id, status: log.status, responseStatus: log.responseStatus, lastError: log.lastError }
  })

  // Expor dispatcher para outros módulos (ex.: sandbox)
  app.decorate('dispatchPartnerEvent', dispatchEvent)
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
    requireScope: (scope: string) => any
    auth: any
    dispatchPartnerEvent: (event: string, payload: unknown) => Promise<void>
  }
}
