/// <reference types="jest" />
import { AnyInboundEvent, belvoTransactionCreated, clicksignSigningCompleted, stripePaymentSucceeded } from '../contracts/integrations-schemas'

describe('Integration contracts (Zod)', () => {
  test('Clicksign signing.completed valid', () => {
    const evt = { type: 'signing.completed', id: 'sig-1', documentId: 'doc-1' }
    const r = clicksignSigningCompleted.safeParse(evt)
    expect(r.success).toBe(true)
  })

  test('Stripe payment_intent.succeeded valid', () => {
    const evt = { type: 'payment_intent.succeeded', id: 'pi_123', amount: 100, currency: 'BRL' }
    const r = stripePaymentSucceeded.safeParse(evt)
    expect(r.success).toBe(true)
  })

  test('Belvo transaction.created valid', () => {
    const evt = { type: 'transaction.created', id: 'tx_1', userId: 'user-1', amount: 10.5, currency: 'BRL' }
    const r = belvoTransactionCreated.safeParse(evt)
    expect(r.success).toBe(true)
  })

  test('AnyInboundEvent union routes correctly', () => {
    const events = [
      { type: 'signing.completed', id: 'a', documentId: 'd' },
      { type: 'payment_intent.succeeded', id: 'b', amount: 1 },
      { type: 'transaction.created', id: 'c', userId: 'u', amount: 2 },
    ]
    for (const evt of events) {
      const r = AnyInboundEvent.safeParse(evt)
      expect(r.success).toBe(true)
    }
  })

  test('Invalid payloads are rejected', () => {
    const invalids = [
      { type: 'signing.completed', id: 'a' }, // missing documentId
      { type: 'payment_intent.succeeded', id: 'b', currency: 'BRL' }, // missing amount
      { type: 'transaction.created', id: 'c', amount: 2 }, // missing userId
    ]
    for (const evt of invalids) {
      const r = AnyInboundEvent.safeParse(evt)
      expect(r.success).toBe(false)
    }
  })
})
