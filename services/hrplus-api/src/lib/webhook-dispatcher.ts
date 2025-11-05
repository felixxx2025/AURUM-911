import { FastifyInstance } from 'fastify'
import { prisma } from '../plugins/prisma'

interface WebhookEvent {
  type: string
  data: any
  tenantId: string
  timestamp: Date
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  active: boolean
}

export class WebhookDispatcher {
  private queue: WebhookEvent[] = []
  private processing = false

  constructor(private fastify: FastifyInstance) {
    this.startProcessor()
  }

  async dispatch(event: WebhookEvent) {
    this.queue.push(event)
    
    await prisma.webhookEvent.create({
      data: {
        type: event.type,
        data: event.data,
        tenantId: event.tenantId,
        status: 'pending',
      },
    })

    if (!this.processing) {
      this.processQueue()
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true

    while (this.queue.length > 0) {
      const event = this.queue.shift()!
      await this.processEvent(event)
    }

    this.processing = false
  }

  private async processEvent(event: WebhookEvent) {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        tenantId: event.tenantId,
        active: true,
        events: { has: event.type },
      },
    })

    for (const endpoint of endpoints) {
      await this.sendWebhook(endpoint, event)
    }
  }

  private async sendWebhook(endpoint: WebhookEndpoint, event: WebhookEvent) {
    const payload = {
      id: crypto.randomUUID(),
      type: event.type,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
    }

    const signature = this.generateSignature(JSON.stringify(payload), endpoint.secret)

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'AURUM-911-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
      })

      await prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: endpoint.id,
          eventType: event.type,
          payload: payload,
          responseStatus: response.status,
          responseBody: await response.text(),
          success: response.ok,
        },
      })

    } catch (error) {
      await prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: endpoint.id,
          eventType: event.type,
          payload: payload,
          responseStatus: 0,
          responseBody: error.message,
          success: false,
        },
      })
    }
  }

  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto')
    return `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`
  }

  private startProcessor() {
    setInterval(() => {
      if (!this.processing && this.queue.length > 0) {
        this.processQueue()
      }
    }, 1000)
  }
}