// Integração SERPRO - Baseado na documentação oficial
import axios from 'axios'

interface SerproConfig {
  clientId: string
  clientSecret: string
  baseUrl: string
}

interface CPFValidationResponse {
  cpf: string
  valid: boolean
  name?: string
  birthDate?: string
  situation?: {
    code: string
    description: string
  }
}

export class SerproService {
  private config: SerproConfig
  private accessToken?: string
  private tokenExpiry?: Date

  constructor(config: SerproConfig) {
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken as string
    }

    const response = await axios.post(`${this.config.baseUrl}/token`, {
      grant_type: 'client_credentials'
    }, {
      auth: {
        username: this.config.clientId,
        password: this.config.clientSecret
      }
    })

    this.accessToken = response.data.access_token
    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000))
    
  return this.accessToken as string
  }

  async validateCPF(cpf: string): Promise<CPFValidationResponse> {
    const token = await this.getAccessToken()
    
    try {
      const response = await axios.get(`${this.config.baseUrl}/consulta-cpf/v1/cpf/${cpf}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      return {
        cpf,
        valid: true,
        name: response.data.nome,
        birthDate: response.data.nascimento,
        situation: response.data.situacao
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { cpf, valid: false }
      }
      throw error
    }
  }
}