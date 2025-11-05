import { z } from 'zod'

// Clicksign: signing.completed
export const clicksignSigningCompleted = z.object({
  type: z.literal('signing.completed'),
  id: z.string(),
  documentId: z.string(),
})

// Stripe: payment_intent.succeeded (PIX)
export const stripePaymentSucceeded = z.object({
  type: z.literal('payment_intent.succeeded'),
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('BRL'),
})

// Belvo: transaction.created
export const belvoTransactionCreated = z.object({
  type: z.literal('transaction.created'),
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string().default('BRL'),
})

export type ClicksignSigningCompleted = z.infer<typeof clicksignSigningCompleted>
export type StripePaymentSucceeded = z.infer<typeof stripePaymentSucceeded>
export type BelvoTransactionCreated = z.infer<typeof belvoTransactionCreated>

export const AnyInboundEvent = z.union([
  clicksignSigningCompleted,
  stripePaymentSucceeded,
  belvoTransactionCreated,
])

// Registro central de validadores opcionais por provider + event type
// Adicione aqui novos contratos conforme os conectores forem detalhados.
export const inboundValidators: Record<string, Record<string, ReturnType<typeof z.object>>> = {
  clicksign: {
    'signing.completed': clicksignSigningCompleted,
  },
  stripe: {
    'payment_intent.succeeded': stripePaymentSucceeded,
  },
  belvo: {
    'transaction.created': belvoTransactionCreated,
  },
  // TODO: Adicionar demais 17 conectores com contratos específicos quando os payloads forem definidos
}

// ====== Novos conectores (schemas mínimos, validação opcional) ======
export const adyenNotification = z.object({
  type: z.literal('adyen.notification'),
  id: z.string(),
  merchantReference: z.string().optional(),
})

export const pagarmeTransactionPaid = z.object({
  type: z.literal('transaction.paid'),
  id: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional(),
})

export const idwallReportFinished = z.object({
  type: z.literal('report.finished'),
  id: z.string(),
  document: z.string().optional(),
})

export const gupyCandidateCreated = z.object({
  type: z.literal('candidate.created'),
  id: z.string(),
  candidateId: z.string().optional(),
})

export const zenviaMessageReceived = z.object({
  type: z.literal('message.received'),
  id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const sendgridEmailProcessed = z.object({
  type: z.literal('email.processed'),
  id: z.string(),
  email: z.string().email().optional(),
})

export const docusignEnvelopeCompleted = z.object({
  type: z.literal('envelope.completed'),
  id: z.string(),
  envelopeId: z.string().optional(),
})

export const dockTransactionSettled = z.object({
  type: z.literal('transaction.settled'),
  id: z.string(),
})

export const celcoinPixReceived = z.object({
  type: z.literal('pix.received'),
  id: z.string(),
  amount: z.number().optional(),
})

export const gerencianetPixReceived = z.object({
  type: z.literal('pix.received'),
  id: z.string(),
  amount: z.number().optional(),
})

export const fitbankTransactionCompleted = z.object({
  type: z.literal('transaction.completed'),
  id: z.string(),
})

export const iuguInvoicePaid = z.object({
  type: z.literal('invoice.paid'),
  id: z.string(),
})

export const pluggyTransactionCreated = z.object({
  type: z.literal('transaction.created'),
  id: z.string(),
})

export const qitechProposalApproved = z.object({
  type: z.literal('proposal.approved'),
  id: z.string(),
})

export const quantoConnectionUpdated = z.object({
  type: z.literal('connection.updated'),
  id: z.string(),
})

export const serproQueryCompleted = z.object({
  type: z.literal('query.completed'),
  id: z.string(),
})

export const clearsaleAnalysisCompleted = z.object({
  type: z.literal('analysis.completed'),
  id: z.string(),
})

// Atualiza o registro de validadores com novos conectores
inboundValidators['adyen'] = { 'adyen.notification': adyenNotification }
inboundValidators['pagarme'] = { 'transaction.paid': pagarmeTransactionPaid }
inboundValidators['idwall'] = { 'report.finished': idwallReportFinished }
inboundValidators['gupy'] = { 'candidate.created': gupyCandidateCreated }
inboundValidators['zenvia'] = { 'message.received': zenviaMessageReceived }
inboundValidators['sendgrid'] = { 'email.processed': sendgridEmailProcessed }
inboundValidators['docusign'] = { 'envelope.completed': docusignEnvelopeCompleted }
inboundValidators['dock'] = { 'transaction.settled': dockTransactionSettled }
inboundValidators['celcoin'] = { 'pix.received': celcoinPixReceived }
inboundValidators['gerencianet'] = { 'pix.received': gerencianetPixReceived }
inboundValidators['fitbank'] = { 'transaction.completed': fitbankTransactionCompleted }
inboundValidators['iugu'] = { 'invoice.paid': iuguInvoicePaid }
inboundValidators['pluggy'] = { 'transaction.created': pluggyTransactionCreated }
inboundValidators['qitech'] = { 'proposal.approved': qitechProposalApproved }
inboundValidators['quanto'] = { 'connection.updated': quantoConnectionUpdated }
inboundValidators['serpro'] = { 'query.completed': serproQueryCompleted }
inboundValidators['clearsale'] = { 'analysis.completed': clearsaleAnalysisCompleted }
