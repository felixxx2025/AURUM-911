import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';

type PilotStatus = 'pending' | 'started' | 'succeeded' | 'failed'

type ESigFlow = { id: string; documentId: string; status: PilotStatus; createdAt: string; updatedAt: string }
type PixCharge = { id: string; amount: number; currency: string; status: PilotStatus; createdAt: string; updatedAt: string }
type ConsentFlow = { id: string; userId: string; status: PilotStatus; createdAt: string; updatedAt: string }

const eSignStore = new Map<string, ESigFlow>()
const charges = new Map<string, PixCharge>()
const consents = new Map<string, ConsentFlow>()

function hmac256(secret: string, base: string) {
  return crypto.createHmac('sha256', secret).update(base).digest('hex')
}

async function sendInboundWebhook(app: FastifyInstance, provider: string, secretEnv: string, type: string, payload: Record<string, unknown>) {
  const secret = process.env[secretEnv]
  const ts = Math.floor(Date.now() / 1000).toString()
  const base = `${ts}.${JSON.stringify({ type, ...payload })}`
  const v1 = secret ? hmac256(secret, base) : ''
  const signature = secret ? `t=${ts},v1=${v1}` : ''
  await app.inject({
    method: 'POST',
    url: `/integrations/webhooks/${provider}`,
    headers: { 'content-type': 'application/json', ...(signature ? { 'x-aurum-signature': signature } : {}) },
    payload: { type, ...payload },
  })
}

export async function pilotsRoutes(app: FastifyInstance) {
  // Clicksign: iniciar assinatura simulada e disparar webhook de conclusão
  app.post('/pilot/e-sign/clicksign/start', {
    schema: {
      tags: ['pilot', 'e-sign'], security: [],
      body: { type: 'object', properties: { documentId: { type: 'string' } }, required: ['documentId'] },
      response: { 202: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' } }, required: ['id','status'] } }
    }
  }, async (request: FastifyRequest<{ Body: { documentId: string } }>, reply: FastifyReply) => {
    const id = `sig-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const flow: ESigFlow = { id, documentId: request.body.documentId, status: 'started', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    eSignStore.set(id, flow)
    try {
      const prisma = (app as unknown as { prisma?: { pilotESignFlow: { upsert: (args: unknown)=>Promise<unknown> } } }).prisma
      await prisma?.pilotESignFlow.upsert({
        where: { id },
        update: { document_id: flow.documentId, status: flow.status },
        create: { id, document_id: flow.documentId, status: flow.status },
      })
    } catch {
      // ignore db persistence errors in pilot flow
    }
    // Simular conclusão assíncrona via webhook inbound
    setTimeout(async () => {
      flow.status = 'succeeded'; flow.updatedAt = new Date().toISOString()
      try {
        const prisma = (app as unknown as { prisma?: { pilotESignFlow: { update: (args: unknown)=>Promise<unknown> } } }).prisma
        await prisma?.pilotESignFlow.update({ where: { id }, data: { status: flow.status } })
      } catch {
        // ignore db persistence errors in pilot flow
      }
      await sendInboundWebhook(app, 'clicksign', 'AURUM_INTEGRATIONS_CLICKSIGN_WEBHOOK_SECRET', 'signing.completed', { id, documentId: flow.documentId })
    }, 300)
    return reply.code(202).send({ id, status: flow.status })
  })

  app.get('/pilot/e-sign/clicksign/:id/status', { schema: { tags: ['pilot','e-sign'], security: [], response: { 200: { type: 'object', additionalProperties: true }, 404: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } } } }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const flow = eSignStore.get(request.params.id)
    if (!flow) return reply.code(404).send({ error: 'not_found' })
    return flow
  })

  // PIX: criar cobrança e simular confirmação via webhook inbound
  app.post('/pilot/payments/stripe/pix-charge', { schema: { tags: ['pilot','payments'], security: [], body: { type: 'object', properties: { amount: { type: 'number' }, currency: { type: 'string' } }, required: ['amount'] }, response: { 202: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' } }, required: ['id','status'] } } } }, async (request: FastifyRequest<{ Body: { amount: number; currency?: string } }>, reply: FastifyReply) => {
    const id = `pix-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const cur = request.body.currency || 'BRL'
    const ch: PixCharge = { id, amount: request.body.amount, currency: cur, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    charges.set(id, ch)
    try {
      const prisma = (app as unknown as { prisma?: { pilotPixCharge: { upsert: (args: unknown)=>Promise<unknown> } } }).prisma
      await prisma?.pilotPixCharge.upsert({ where: { id }, update: { amount: ch.amount, currency: ch.currency, status: ch.status }, create: { id, amount: ch.amount, currency: ch.currency, status: ch.status } })
    } catch {
      // ignore db persistence errors in pilot flow
    }
    setTimeout(async () => {
      ch.status = 'succeeded'; ch.updatedAt = new Date().toISOString()
      try {
        const prisma = (app as unknown as { prisma?: { pilotPixCharge: { update: (args: unknown)=>Promise<unknown> } } }).prisma
        await prisma?.pilotPixCharge.update({ where: { id }, data: { status: ch.status } })
      } catch {
        // ignore db persistence errors in pilot flow
      }
      await sendInboundWebhook(app, 'stripe', 'AURUM_INTEGRATIONS_STRIPE_WEBHOOK_SECRET', 'payment_intent.succeeded', { id, amount: ch.amount, currency: ch.currency })
    }, 300)
    return reply.code(202).send({ id, status: ch.status })
  })

  app.get('/pilot/payments/charge/:id', { schema: { tags: ['pilot','payments'], security: [], response: { 200: { type: 'object', additionalProperties: true }, 404: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } } } }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const ch = charges.get(request.params.id)
    if (!ch) return reply.code(404).send({ error: 'not_found' })
    return ch
  })

  // Open Finance: consentimento e simulação de evento de transação
  app.post('/pilot/open-finance/belvo/consent', { schema: { tags: ['pilot','open-finance'], security: [], body: { type: 'object', properties: { userId: { type: 'string' } }, required: ['userId'] }, response: { 202: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' } }, required: ['id','status'] } } } }, async (request: FastifyRequest<{ Body: { userId: string } }>, reply: FastifyReply) => {
    const id = `cns-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const c: ConsentFlow = { id, userId: request.body.userId, status: 'started', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    consents.set(id, c)
    try {
      const prisma = (app as unknown as { prisma?: { pilotConsentFlow: { upsert: (args: unknown)=>Promise<unknown> } } }).prisma
      await prisma?.pilotConsentFlow.upsert({ where: { id }, update: { user_id: c.userId, status: c.status }, create: { id, user_id: c.userId, status: c.status } })
    } catch {
      // ignore db persistence errors in pilot flow
    }
    setTimeout(async () => {
      c.status = 'succeeded'; c.updatedAt = new Date().toISOString()
      try {
        const prisma = (app as unknown as { prisma?: { pilotConsentFlow: { update: (args: unknown)=>Promise<unknown> } } }).prisma
        await prisma?.pilotConsentFlow.update({ where: { id }, data: { status: c.status } })
      } catch {
        // ignore db persistence errors in pilot flow
      }
      await sendInboundWebhook(app, 'belvo', 'AURUM_INTEGRATIONS_BELVO_WEBHOOK_SECRET', 'transaction.created', { id, userId: c.userId, amount: 123.45, currency: 'BRL' })
    }, 300)
    return reply.code(202).send({ id, status: c.status })
  })

  app.get('/pilot/open-finance/consent/:id', { schema: { tags: ['pilot','open-finance'], security: [], response: { 200: { type: 'object', additionalProperties: true }, 404: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } } } }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const c = consents.get(request.params.id)
    if (!c) return reply.code(404).send({ error: 'not_found' })
    return c
  })
}
