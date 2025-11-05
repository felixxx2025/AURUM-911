// Gerenciador de Webhooks - Baseado em padrões de mercado (Stripe, GitHub, etc.)
import crypto from 'crypto'
import axios from 'axios'

interface WebhookConfig {
  url: string
  secret: string
  events: string[]
  active: boolean
  retryAttempts: number
  retryDelay: number
}

interface WebhookEvent {
  id: string
  type: string
  data: any
  timestamp: string
  tenantId: string
}

interface WebhookDelivery {
  id: string
  webhookId: string
  eventId: string
  url: string
  status: 'pending' | 'success' | 'failed'
  attempts: number
  lastAttempt?: string
  response?: {
    status: number
    body: string
    headers: Record<string, string>
  }
}

export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map()
  private deliveries: Map<string, WebhookDelivery> = new Map()

  constructor() {
    // Configurar webhooks padrão para integrações
    this.setupDefaultWebhooks()
  }

  private setupDefaultWebhooks() {
    // Webhook para eSocial
    this.registerWebhook('esocial', {
      url: process.env.ESOCIAL_WEBHOOK_URL || '',
      secret: process.env.ESOCIAL_WEBHOOK_SECRET || '',
      events: ['employee.created', 'employee.updated', 'employee.terminated'],
      active: true,
      retryAttempts: 3,
      retryDelay: 5000
    })

    // Webhook para Kenoby
    this.registerWebhook('kenoby', {
      url: process.env.KENOBY_WEBHOOK_URL || '',
      secret: process.env.KENOBY_WEBHOOK_SECRET || '',
      events: ['candidate.hired', 'job.created'],
      active: true,
      retryAttempts: 3,
      retryDelay: 5000
    })

    // Webhook para sistema de pagamentos
    this.registerWebhook('payments', {
      url: process.env.PAYMENTS_WEBHOOK_URL || '',
      secret: process.env.PAYMENTS_WEBHOOK_SECRET || '',
      events: ['payroll.processed', 'payment.completed', 'payment.failed'],
      active: true,
      retryAttempts: 5,
      retryDelay: 10000
    })
  }

  registerWebhook(id: string, config: WebhookConfig) {
    this.webhooks.set(id, config)
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  private verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    )
  }

  async sendWebhook(webhookId: string, event: WebhookEvent): Promise<WebhookDelivery> {
    const webhook = this.webhooks.get(webhookId)
    
    if (!webhook || !webhook.active || !webhook.events.includes(event.type)) {
      throw new Error(`Webhook ${webhookId} não encontrado ou inativo`)
    }

    const deliveryId = crypto.randomUUID()
    const payload = JSON.stringify(event)
    const signature = this.generateSignature(payload, webhook.secret)

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId,
      eventId: event.id,
      url: webhook.url,
      status: 'pending',
      attempts: 0
    }

    this.deliveries.set(deliveryId, delivery)

    try {
      await this.attemptDelivery(delivery, payload, signature, webhook)
    } catch (error) {
      // Agendar retry se configurado
      if (delivery.attempts < webhook.retryAttempts) {
        setTimeout(() => {
          this.retryDelivery(deliveryId, payload, signature, webhook)
        }, webhook.retryDelay)
      }
    }

    return delivery
  }

  private async attemptDelivery(
    delivery: WebhookDelivery, 
    payload: string, 
    signature: string, 
    webhook: WebhookConfig
  ) {
    delivery.attempts++
    delivery.lastAttempt = new Date().toISOString()

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': JSON.parse(payload).type,
          'X-Webhook-Delivery': delivery.id,
          'User-Agent': 'AURUM-Webhook/1.0'
        },
        timeout: 30000
      })

      delivery.status = 'success'
      delivery.response = {
        status: response.status,
        body: response.data,
        headers: response.headers as Record<string, string>
      }

      console.log(`Webhook ${delivery.webhookId} entregue com sucesso: ${delivery.id}`)
    } catch (error: any) {
      delivery.status = 'failed'
      delivery.response = {
        status: error.response?.status || 0,
        body: error.response?.data || error.message,
        headers: error.response?.headers || {}
      }

      console.error(`Falha na entrega do webhook ${delivery.webhookId}: ${error.message}`)
      throw error
    }
  }

  private async retryDelivery(
    deliveryId: string, 
    payload: string, 
    signature: string, 
    webhook: WebhookConfig
  ) {
    const delivery = this.deliveries.get(deliveryId)
    if (!delivery || delivery.attempts >= webhook.retryAttempts) {
      return
    }

    try {
      await this.attemptDelivery(delivery, payload, signature, webhook)
    } catch (error) {
      if (delivery.attempts < webhook.retryAttempts) {
        setTimeout(() => {
          this.retryDelivery(deliveryId, payload, signature, webhook)
        }, webhook.retryDelay * delivery.attempts) // Backoff exponencial
      }
    }
  }

  // Método para receber webhooks de parceiros
  async receiveWebhook(
    webhookId: string, 
    payload: string, 
    signature: string
  ): Promise<{ success: boolean; message: string }> {
    const webhook = this.webhooks.get(webhookId)
    
    if (!webhook) {
      return { success: false, message: 'Webhook não encontrado' }
    }

    if (!this.verifySignature(payload, signature, webhook.secret)) {
      return { success: false, message: 'Assinatura inválida' }
    }

    try {
      const event = JSON.parse(payload)
      
      // Processar evento baseado no tipo
      await this.processIncomingEvent(webhookId, event)
      
      return { success: true, message: 'Webhook processado com sucesso' }
    } catch (error: any) {
      return { success: false, message: `Erro ao processar webhook: ${error.message}` }
    }
  }

  private async processIncomingEvent(webhookId: string, event: any) {
    switch (webhookId) {
      case 'kenoby':
        await this.processKenobyEvent(event)
        break
      case 'payments':
        await this.processPaymentEvent(event)
        break
      case 'esocial':
        await this.processESocialEvent(event)
        break
      default:
        console.log(`Evento recebido de ${webhookId}:`, event)
    }
  }

  private async processKenobyEvent(event: any) {
    if (event.type === 'candidate.hired') {
      // Criar colaborador automaticamente no AURUM
      console.log('Candidato contratado no Kenoby:', event.data)
      // Implementar lógica de criação automática
    }
  }

  private async processPaymentEvent(event: any) {
    if (event.type === 'payment.completed') {
      // Atualizar status do pagamento
      console.log('Pagamento confirmado:', event.data)
    }
  }

  private async processESocialEvent(event: any) {
    if (event.type === 'event.processed') {
      // Atualizar status do envio eSocial
      console.log('Evento eSocial processado:', event.data)
    }
  }

  getDeliveryStatus(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveries.get(deliveryId)
  }

  listDeliveries(webhookId?: string): WebhookDelivery[] {
    const deliveries = Array.from(this.deliveries.values())
    return webhookId 
      ? deliveries.filter(d => d.webhookId === webhookId)
      : deliveries
  }
}

export const webhookManager = new WebhookManager()