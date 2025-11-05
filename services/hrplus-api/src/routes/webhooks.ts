/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'

type CatalogItem = {
  type: string
  description: string
  sample: any
}

export async function webhooksRoutes(app: FastifyInstance) {
  const catalog: CatalogItem[] = [
    {
      type: 'hr.person.created',
      description: 'Pessoa criada no módulo HR',
      sample: { event: 'hr.person.created', data: { id: 'per_123', first_name: 'Alice', last_name: 'Silva', email: 'alice.silva@example.com' }, id: 'deliv_abc', createdAt: new Date().toISOString() }
    },
    {
      type: 'hr.person.updated',
      description: 'Pessoa atualizada no módulo HR',
      sample: { event: 'hr.person.updated', data: { id: 'per_123', first_name: 'Alice', last_name: 'Silva', email: 'alice.silva@example.com' }, id: 'deliv_def', createdAt: new Date().toISOString() }
    },
    {
      type: 'fin.payment.created',
      description: 'Pagamento criado no módulo Financeiro',
      sample: { event: 'fin.payment.created', data: { id: 'pay_123', amount: 1200.5, currency: 'BRL', status: 'created' }, id: 'deliv_pay', createdAt: new Date().toISOString() }
    },
    {
      type: 'fin.payment.failed',
      description: 'Pagamento com falha no módulo Financeiro',
      sample: { event: 'fin.payment.failed', data: { id: 'pay_123', amount: 1200.5, currency: 'BRL', status: 'failed' }, id: 'deliv_pfl', createdAt: new Date().toISOString() }
    },
    {
      type: 'partner.eligibility.completed',
      description: 'Fluxo de elegibilidade de parceiro concluído',
      sample: { event: 'partner.eligibility.completed', data: { id: 'elig_123', eligible: true, maxAmount: 1500.0, margin_after: 4.2 }, id: 'deliv_elg', createdAt: new Date().toISOString() }
    },
  ]

  app.get('/webhooks/catalog', {
    schema: {
      tags: ['webhooks'],
      response: { 200: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', additionalProperties: true } } }, required: ['items'] } }
    } as any
  }, async () => {
    return { items: catalog }
  })
}

declare module 'fastify' {
  // Extend without additions for now; use `interface` with at least one field to avoid empty-object lint
  interface FastifyInstance {
    // placeholder to satisfy lint; add route typings here when needed
    __placeholder__?: never
  }
}
