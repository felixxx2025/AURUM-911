import axios from 'axios'

interface TeamsMessage {
  title: string
  text: string
  themeColor?: string
  sections?: any[]
}

export class TeamsIntegration {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async sendMessage(message: TeamsMessage) {
    try {
      await axios.post(this.webhookUrl, {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: message.title,
        title: message.title,
        text: message.text,
        themeColor: message.themeColor || '0078D4',
        sections: message.sections
      })
    } catch (error) {
      console.error('Teams integration error:', error)
      throw error
    }
  }

  async notifyPerformanceReport(report: any) {
    await this.sendMessage({
      title: '📊 Relatório de Performance',
      text: 'Novo relatório de performance disponível',
      themeColor: '28A745',
      sections: [{
        facts: [
          { name: 'Período', value: report.period },
          { name: 'Funcionários', value: report.employeeCount },
          { name: 'Score Médio', value: `${report.averageScore}/5` }
        ]
      }]
    })
  }

  async notifySystemAlert(alert: any) {
    await this.sendMessage({
      title: '🚨 Alerta do Sistema',
      text: alert.message,
      themeColor: 'DC3545',
      sections: [{
        facts: [
          { name: 'Severidade', value: alert.severity },
          { name: 'Componente', value: alert.component },
          { name: 'Timestamp', value: new Date().toISOString() }
        ]
      }]
    })
  }
}