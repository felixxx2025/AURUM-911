/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

type Dataset = { key: string; name: string; description: string }

const datasets: Dataset[] = [
  { key: 'hr_people', name: 'Pessoas (HR)', description: 'Colaboradores fictícios com dados consistentes para CRUD e listagens.' },
  { key: 'fin_payments', name: 'Pagamentos (Financeiro)', description: 'Eventos de pagamentos/transferências sintéticos.' },
  { key: 'partners_events', name: 'Eventos de Parceiros', description: 'Eventos de elegibilidade/integração para testes de webhooks.' },
]

function synthEvent(type: string) {
  switch (type) {
    case 'hr.person.created':
      return { id: crypto.randomUUID(), first_name: 'Alice', last_name: 'Silva', email: 'alice.silva@example.com' }
    case 'fin.payment.created':
      return { id: crypto.randomUUID(), amount: 1200.5, currency: 'BRL', status: 'created' }
    case 'partner.eligibility.completed':
      return { id: crypto.randomUUID(), eligible: true, maxAmount: 1500.0, margin_after: 4.2 }
    default:
      return { id: crypto.randomUUID(), note: 'generic_event' }
  }
}

export async function sandboxRoutes(app: FastifyInstance) {
  // Listar datasets disponíveis
  app.get('/sandbox/datasets', { preHandler: [(app as any).authenticate, (app as any).requireScope('sandbox:manage')], schema: { tags: ['sandbox'] } as any }, async () => {
    return { datasets }
  })

  // Reset básico (limpa apenas logs de entregas, datasets são virtuais)
  app.post('/sandbox/reset', { preHandler: [(app as any).authenticate, (app as any).requireScope('sandbox:manage')], schema: { tags: ['sandbox'] } as any }, async () => {
    // Outros módulos podem expor resets específicos no futuro; aqui mantemos sem efeito colateral
    return { status: 'ok' }
  })

  // Disparar eventos de sandbox (gera payload sintético se não informado)
  app.post('/sandbox/events/:type', {
    preHandler: [(app as any).authenticate, (app as any).requireScope('sandbox:events')],
    schema: { tags: ['sandbox'], params: { type: 'object', properties: { type: { type: 'string' } }, required: ['type'] }, body: { type: 'object', nullable: true } } as any
  }, async (req: FastifyRequest<{ Params: { type: string }; Body?: unknown }>, reply: FastifyReply) => {
    const eventType = req.params.type
    const payload = (req.body && Object.keys(req.body as any).length) ? req.body : synthEvent(eventType)
    if (typeof (app as any).dispatchPartnerEvent !== 'function') {
      return reply.code(501).send({ error: 'dispatch_not_available' })
    }
    await (app as any).dispatchPartnerEvent(eventType, payload)
    return reply.code(202).send({ status: 'queued', event: eventType })
  })
}
