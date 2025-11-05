/// <reference types="jest" />
import {
  inboundValidators,
} from '../contracts/integrations-schemas'

describe('inboundValidators (novos conectores)', () => {
  const ok = (provider: string, type: string, body: Record<string, unknown>) =>
    inboundValidators[provider]?.[type]?.safeParse(body).success === true

  const bad = (provider: string, type: string, body: Record<string, unknown>) =>
    inboundValidators[provider]?.[type]?.safeParse(body).success === false

  test('pagarme transaction.paid válido e inválido', () => {
    expect(ok('pagarme', 'transaction.paid', { type: 'transaction.paid', id: 'evt-1', amount: 100 })).toBe(true)
    expect(bad('pagarme', 'transaction.paid', { type: 'transaction.paid' } as any)).toBe(true)
  })

  test('docusign envelope.completed válido e inválido', () => {
    expect(ok('docusign', 'envelope.completed', { type: 'envelope.completed', id: 'env-1', envelopeId: 'abc' })).toBe(true)
    expect(bad('docusign', 'envelope.completed', { type: 'envelope.completed' } as any)).toBe(true)
  })

  test('zenvia message.received válido e inválido', () => {
    expect(ok('zenvia', 'message.received', { type: 'message.received', id: 'msg-1', from: 'a', to: 'b' })).toBe(true)
    expect(bad('zenvia', 'message.received', { type: 'message.received' } as any)).toBe(true)
  })

  test('sendgrid email.processed válido e inválido', () => {
    expect(ok('sendgrid', 'email.processed', { type: 'email.processed', id: 'em-1', email: 'a@b.com' })).toBe(true)
    expect(bad('sendgrid', 'email.processed', { type: 'email.processed' } as any)).toBe(true)
  })

  test('celcoin pix.received válido e inválido', () => {
    expect(ok('celcoin', 'pix.received', { type: 'pix.received', id: 'pix-1', amount: 12.3 })).toBe(true)
    expect(bad('celcoin', 'pix.received', { type: 'pix.received' } as any)).toBe(true)
  })
})
