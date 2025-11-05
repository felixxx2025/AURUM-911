/// <reference types="jest" />
import { createApp } from '../app'

describe('Webhook Validation and KPIs', () => {
  let app: Awaited<ReturnType<typeof createApp>>

  beforeAll(async () => {
    app = await createApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Validation with detailed errors', () => {
    test('should reject invalid Clicksign payload with details', async () => {
      const invalidPayload = {
        type: 'signing.completed',
        id: 'sig-1'
        // missing documentId
      }

      const response = await app.inject({
        method: 'POST',
        url: '/integrations/webhooks/clicksign',
        payload: invalidPayload,
        headers: {
          'content-type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('invalid_payload')
      expect(body.details).toBeDefined()
      expect(Array.isArray(body.details)).toBe(true)
      expect(body.details.length).toBeGreaterThan(0)
    })

    test('should reject invalid Stripe payload with details', async () => {
      const invalidPayload = {
        type: 'payment_intent.succeeded',
        id: 'pi_123'
        // missing amount
      }

      const response = await app.inject({
        method: 'POST',
        url: '/integrations/webhooks/stripe',
        payload: invalidPayload,
        headers: {
          'content-type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('invalid_payload')
      expect(body.details).toBeDefined()
      expect(Array.isArray(body.details)).toBe(true)
    })

    test('should accept valid Clicksign payload', async () => {
      const validPayload = {
        type: 'signing.completed',
        id: 'sig-123',
        documentId: 'doc-456'
      }

      const response = await app.inject({
        method: 'POST',
        url: '/integrations/webhooks/clicksign',
        payload: validPayload,
        headers: {
          'content-type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(202)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('accepted')
      expect(body.id).toBeDefined()
      expect(body.verified).toBe(false) // No secret configured in test
    })

    test('should accept valid Stripe payload', async () => {
      const validPayload = {
        type: 'payment_intent.succeeded',
        id: 'pi_123',
        amount: 1000,
        currency: 'BRL'
      }

      const response = await app.inject({
        method: 'POST',
        url: '/integrations/webhooks/stripe',
        payload: validPayload,
        headers: {
          'content-type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(202)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('accepted')
      expect(body.id).toBeDefined()
      expect(body.verified).toBe(false) // No secret configured in test
    })

    test('should accept valid Belvo payload', async () => {
      const validPayload = {
        type: 'transaction.created',
        id: 'tx_123',
        userId: 'user_456',
        amount: 50.5,
        currency: 'BRL'
      }

      const response = await app.inject({
        method: 'POST',
        url: '/integrations/webhooks/belvo',
        payload: validPayload,
        headers: {
          'content-type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(202)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('accepted')
      expect(body.id).toBeDefined()
    })
  })

  describe('KPI Stats endpoint', () => {
    beforeAll(async () => {
      // Seed some webhook data for stats
      const testPayloads = [
        { type: 'signing.completed', id: 'sig-1', documentId: 'doc-1' },
        { type: 'signing.completed', id: 'sig-2', documentId: 'doc-2' },
        { type: 'payment_intent.succeeded', id: 'pi-1', amount: 100 },
      ]

      for (const payload of testPayloads) {
        const provider = payload.type.includes('signing') ? 'clicksign' : 'stripe'
        await app.inject({
          method: 'POST',
          url: `/integrations/webhooks/${provider}`,
          payload,
          headers: { 'content-type': 'application/json' }
        })
      }
    })

    test('should return overall stats with all providers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.window).toBe('all')
      expect(body.provider).toBe('all')
      expect(body.overall).toBeDefined()
      expect(body.overall.total).toBeGreaterThan(0)
      expect(body.providers).toBeDefined()
      expect(typeof body.providers).toBe('object')
    })

    test('should return stats for specific provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats?provider=clicksign'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.provider).toBe('clicksign')
      expect(body.overall).toBeDefined()
      expect(body.providers.clicksign).toBeDefined()
    })

    test('should support time window filtering (5m)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats?window=5m'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.window).toBe('5m')
      expect(body.overall).toBeDefined()
    })

    test('should support time window filtering (1h)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats?window=1h'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.window).toBe('1h')
    })

    test('should support time window filtering (24h)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats?window=24h'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.window).toBe('24h')
    })

    test('should calculate verification rates', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/stats'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.overall.verificationRate).toBeDefined()
      expect(body.overall.successRate).toBeDefined()
      expect(typeof body.overall.verificationRate).toBe('number')
      expect(body.overall.verificationRate).toBeGreaterThanOrEqual(0)
      expect(body.overall.verificationRate).toBeLessThanOrEqual(1)
    })
  })

  describe('Detailed KPIs endpoint', () => {
    test('should return detailed KPIs for all providers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.provider).toBe('all')
      expect(body.timestamp).toBeDefined()
      expect(body.kpis).toBeDefined()
      expect(body.kpis.last5m).toBeDefined()
      expect(body.kpis.last1h).toBeDefined()
      expect(body.kpis.last24h).toBeDefined()
    })

    test('should include requests per minute metric', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.kpis.last5m.requestsPerMinute).toBeDefined()
      expect(typeof body.kpis.last5m.requestsPerMinute).toBe('number')
    })

    test('should include verification rates per time window', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.kpis.last5m.verificationRate).toBeDefined()
      expect(body.kpis.last1h.verificationRate).toBeDefined()
      expect(body.kpis.last24h.verificationRate).toBeDefined()
    })

    test('should include provider-specific metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.providers).toBeDefined()
      expect(typeof body.providers).toBe('object')
      
      // Check that provider metrics have expected structure
      for (const provider in body.providers) {
        const metric = body.providers[provider]
        expect(metric.total).toBeDefined()
        expect(metric.verified).toBeDefined()
        expect(metric.verificationRate).toBeDefined()
        expect(metric.last5mCount).toBeDefined()
      }
    })

    test('should filter KPIs by provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis?provider=clicksign'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.provider).toBe('clicksign')
      
      // Should only include clicksign metrics
      if (Object.keys(body.providers).length > 0) {
        expect(body.providers.clicksign).toBeDefined()
      }
    })

    test('should include summary statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/integrations/webhooks/kpis'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.summary).toBeDefined()
      expect(body.summary.totalProviders).toBeDefined()
      expect(body.summary.totalWebhooks).toBeDefined()
      expect(body.summary.totalVerified).toBeDefined()
    })
  })

  describe('Metrics endpoint integration', () => {
    test('should expose Prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/plain')
      
      const metrics = response.body
      // Check for webhook-specific metrics
      expect(metrics).toContain('integrations_inbound_webhooks_total')
      expect(metrics).toContain('integrations_inbound_webhook_duration_seconds')
      expect(metrics).toContain('integrations_inbound_webhooks_validation_errors_total')
      expect(metrics).toContain('integrations_inbound_webhooks_success_rate')
      expect(metrics).toContain('integrations_inbound_webhooks_verification_failures_total')
    })
  })
})
