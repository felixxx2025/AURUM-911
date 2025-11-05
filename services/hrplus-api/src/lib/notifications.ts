// Sistema de Notificações - Baseado em SendGrid, Twilio, Firebase
import axios from 'axios'

interface NotificationConfig {
  email: {
    apiKey: string
    fromEmail: string
    fromName: string
  }
  sms: {
    accountSid: string
    authToken: string
    fromNumber: string
  }
  push: {
    serverKey: string
  }
}

interface EmailNotification {
  to: string[]
  subject: string
  html: string
  text?: string
  templateId?: string
  templateData?: any
}

interface SMSNotification {
  to: string
  message: string
}

interface PushNotification {
  tokens: string[]
  title: string
  body: string
  data?: any
}

export class NotificationService {
  constructor(private config: NotificationConfig) {}

  async sendEmail(notification: EmailNotification): Promise<any> {
    try {
      const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{
          to: notification.to.map(email => ({ email })),
          dynamic_template_data: notification.templateData
        }],
        from: {
          email: this.config.email.fromEmail,
          name: this.config.email.fromName
        },
        subject: notification.subject,
        content: notification.templateId ? undefined : [{
          type: 'text/html',
          value: notification.html
        }],
        template_id: notification.templateId
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.email.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return { success: true, messageId: response.data }
    } catch (error: any) {
      console.error('Email send error:', error.response?.data || error.message)
      throw error
    }
  }

  async sendSMS(notification: SMSNotification): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.sms.accountSid}/Messages.json`,
        new URLSearchParams({
          To: notification.to,
          From: this.config.sms.fromNumber,
          Body: notification.message
        }),
        {
          auth: {
            username: this.config.sms.accountSid,
            password: this.config.sms.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      return { success: true, messageId: response.data.sid }
    } catch (error: any) {
      console.error('SMS send error:', error.response?.data || error.message)
      throw error
    }
  }

  async sendPush(notification: PushNotification): Promise<any> {
    try {
      const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
        registration_ids: notification.tokens,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      }, {
        headers: {
          'Authorization': `key=${this.config.push.serverKey}`,
          'Content-Type': 'application/json'
        }
      })

      return { success: true, results: response.data.results }
    } catch (error: any) {
      console.error('Push send error:', error.response?.data || error.message)
      throw error
    }
  }

  // Templates específicos para RH
  async sendWelcomeEmail(employeeEmail: string, employeeName: string, companyName: string): Promise<any> {
    return this.sendEmail({
      to: [employeeEmail],
      subject: `Bem-vindo(a) à ${companyName}!`,
      html: `
        <h2>Olá, ${employeeName}!</h2>
        <p>Seja bem-vindo(a) à equipe da ${companyName}!</p>
        <p>Estamos muito felizes em tê-lo(a) conosco. Em breve você receberá mais informações sobre seu primeiro dia.</p>
        <p>Atenciosamente,<br>Equipe de RH</p>
      `
    })
  }

  async sendPayrollNotification(employeeEmail: string, employeeName: string, amount: number): Promise<any> {
    return this.sendEmail({
      to: [employeeEmail],
      subject: 'Folha de Pagamento Processada',
      html: `
        <h2>Olá, ${employeeName}!</h2>
        <p>Sua folha de pagamento foi processada com sucesso.</p>
        <p><strong>Valor líquido:</strong> R$ ${amount.toFixed(2)}</p>
        <p>O pagamento será creditado em sua conta nos próximos dias úteis.</p>
        <p>Atenciosamente,<br>Equipe de RH</p>
      `
    })
  }

  async sendBirthdayWish(employeeEmail: string, employeeName: string): Promise<any> {
    return this.sendEmail({
      to: [employeeEmail],
      subject: 'Feliz Aniversário! 🎉',
      html: `
        <h2>Parabéns, ${employeeName}! 🎂</h2>
        <p>Toda a equipe deseja um feliz aniversário!</p>
        <p>Que este novo ano seja repleto de conquistas e alegrias.</p>
        <p>Com carinho,<br>Toda a equipe</p>
      `
    })
  }

  async sendDocumentReminder(employeeEmail: string, employeeName: string, documentName: string): Promise<any> {
    return this.sendEmail({
      to: [employeeEmail],
      subject: 'Lembrete: Documento Pendente',
      html: `
        <h2>Olá, ${employeeName}!</h2>
        <p>Você possui um documento pendente de assinatura:</p>
        <p><strong>${documentName}</strong></p>
        <p>Por favor, acesse o sistema para revisar e assinar o documento.</p>
        <p>Atenciosamente,<br>Equipe de RH</p>
      `
    })
  }

  async sendVacationApproval(employeeEmail: string, employeeName: string, startDate: string, endDate: string): Promise<any> {
    return this.sendEmail({
      to: [employeeEmail],
      subject: 'Férias Aprovadas ✅',
      html: `
        <h2>Olá, ${employeeName}!</h2>
        <p>Suas férias foram aprovadas!</p>
        <p><strong>Período:</strong> ${startDate} a ${endDate}</p>
        <p>Aproveite seu descanso merecido!</p>
        <p>Atenciosamente,<br>Equipe de RH</p>
      `
    })
  }

  async sendComplianceAlert(hrEmails: string[], alertType: string, details: string): Promise<any> {
    return this.sendEmail({
      to: hrEmails,
      subject: `🚨 Alerta de Compliance: ${alertType}`,
      html: `
        <h2>Alerta de Compliance</h2>
        <p><strong>Tipo:</strong> ${alertType}</p>
        <p><strong>Detalhes:</strong> ${details}</p>
        <p>Ação imediata pode ser necessária.</p>
        <p>Sistema AURUM</p>
      `
    })
  }

  // Notificações em lote
  async sendBulkNotifications(notifications: Array<{
    type: 'email' | 'sms' | 'push'
    data: any
  }>): Promise<any[]> {
    const results = []
    
  for (const notification of notifications) {
      try {
        let result
        switch (notification.type) {
          case 'email':
            result = await this.sendEmail(notification.data)
            break
          case 'sms':
            result = await this.sendSMS(notification.data)
            break
          case 'push':
            result = await this.sendPush(notification.data)
            break
        }
        results.push({ success: true, result })
      } catch (error: any) {
        results.push({ success: false, error: error?.message })
      }
    }
    
    return results
  }
}

export const notificationService = new NotificationService({
  email: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@aurum.cool',
    fromName: process.env.FROM_NAME || 'AURUM'
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || ''
  },
  push: {
    serverKey: process.env.FCM_SERVER_KEY || ''
  }
})