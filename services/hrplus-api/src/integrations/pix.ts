// Integração PIX - Baseado no padrão BACEN e OpenPIX
import axios from 'axios'
import { randomUUID } from 'crypto'

interface PixConfig {
  clientId: string
  clientSecret: string
  certificado?: string
  sandbox: boolean
  baseUrl: string
}

interface PixPayment {
  valor: number
  chave: string
  descricao: string
  solicitacaoPagador?: string
  infoAdicionais?: Array<{
    nome: string
    valor: string
  }>
}

interface PixResponse {
  txid: string
  status: 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP'
  revisao: number
  devedor?: {
    cpf?: string
    cnpj?: string
    nome: string
  }
  valor: {
    original: string
  }
  chave: string
  solicitacaoPagador?: string
  infoAdicionais?: Array<{
    nome: string
    valor: string
  }>
  pixCopiaECola?: string
  qrCode?: string
}

export class PixService {
  private config: PixConfig
  private accessToken?: string
  private tokenExpiry?: Date

  constructor(config: PixConfig) {
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    const response = await axios.post(`${this.config.baseUrl}/oauth/token`, {
      grant_type: 'client_credentials'
    }, {
      auth: {
        username: this.config.clientId,
        password: this.config.clientSecret
      }
    })

    this.accessToken = response.data.access_token
    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000))
    
    return this.accessToken
  }

  async criarCobrancaImediata(pagamento: PixPayment): Promise<PixResponse> {
    const token = await this.getAccessToken()
    const txid = randomUUID().replace(/-/g, '')

    const payload = {
      calendario: {
        expiracao: 3600 // 1 hora
      },
      devedor: {
        nome: 'Colaborador'
      },
      valor: {
        original: pagamento.valor.toFixed(2)
      },
      chave: pagamento.chave,
      solicitacaoPagador: pagamento.descricao,
      infoAdicionais: pagamento.infoAdicionais || []
    }

    const response = await axios.put(`${this.config.baseUrl}/v2/cob/${txid}`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      txid,
      ...response.data
    }
  }

  async consultarCobranca(txid: string): Promise<PixResponse> {
    const token = await this.getAccessToken()

    const response = await axios.get(`${this.config.baseUrl}/v2/cob/${txid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.data
  }

  async listarPixRecebidos(inicio: string, fim: string): Promise<any> {
    const token = await this.getAccessToken()

    const response = await axios.get(`${this.config.baseUrl}/v2/pix`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        inicio,
        fim
      }
    })

    return response.data
  }

  // Método para pagamentos de folha via PIX
  async pagarFolha(pagamentos: Array<{
    cpf: string
    nome: string
    valor: number
    chave: string
    descricao: string
  }>): Promise<Array<PixResponse>> {
    const resultados = []

    for (const pagamento of pagamentos) {
      try {
        const resultado = await this.criarCobrancaImediata({
          valor: pagamento.valor,
          chave: pagamento.chave,
          descricao: `Salário - ${pagamento.descricao}`,
          infoAdicionais: [
            { nome: 'CPF', valor: pagamento.cpf },
            { nome: 'Funcionario', valor: pagamento.nome }
          ]
        })
        
        resultados.push(resultado)
      } catch (error) {
        console.error(`Erro ao processar pagamento para ${pagamento.nome}:`, error)
        resultados.push({
          txid: '',
          status: 'ERRO' as any,
          erro: error
        })
      }
    }

    return resultados
  }
}