import axios from 'axios'

interface SlackMessage {
  channel: string
  text: string
  attachments?: any[]
}

export class SlackIntegration {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async sendMessage(message: SlackMessage) {
    try {
      await axios.post(this.webhookUrl, {
        channel: message.channel,
        text: message.text,
        attachments: message.attachments,
        username: 'AURUM-911',
        icon_emoji: ':robot_face:'
      })
    } catch (error) {
      console.error('Slack integration error:', error)
      throw error
    }
  }

  async notifyNewEmployee(employee: any) {
    await this.sendMessage({
      channel: '#hr-notifications',
      text: `🎉 Novo funcionário cadastrado: ${employee.firstName} ${employee.lastName}`,
      attachments: [{
        color: 'good',
        fields: [
          { title: 'Email', value: employee.email, short: true },
          { title: 'Departamento', value: employee.department, short: true }
        ]
      }]
    })
  }

  async notifyTurnoverRisk(employees: any[]) {
    await this.sendMessage({
      channel: '#hr-alerts',
      text: `⚠️ Alerta de Turnover: ${employees.length} funcionários em risco`,
      attachments: [{
        color: 'warning',
        text: employees.map(emp => `• ${emp.name} (${emp.riskScore}%)`).join('\n')
      }]
    })
  }
}