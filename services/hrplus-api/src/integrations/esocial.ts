// Integração eSocial - Baseado no layout oficial v2.5
import axios from 'axios'
import { createHash } from 'crypto'

interface ESocialConfig {
  transmissorId: string
  certificado: string
  senha: string
  ambiente: 'producao' | 'producao-restrita'
}

interface AdmissaoEvent {
  cpfTrabalhador: string
  nisTrabalhador?: string
  nmTrabalhador: string
  sexo: 'M' | 'F'
  racaCor: number
  estCiv: number
  grauInstr: string
  nmMae?: string
  dtNascto: string
  codMunic?: string
  uf?: string
  paisNascto: string
  paisNac: string
  nmPai?: string
  dtAdmissao: string
  tpAdmissao: number
  indAdmissao: number
  codCargo?: string
  codFuncao?: string
  codCateg: string
  codCarreira?: string
  dtIngrCarr?: string
  remuneracao: {
    vrSalFx: number
    undSalFixo: number
    dscSalVar?: string
  }
}

export class ESocialService {
  private config: ESocialConfig
  private baseUrl: string

  constructor(config: ESocialConfig) {
    this.config = config
    this.baseUrl = config.ambiente === 'producao' 
      ? 'https://webservices.producao.esocial.gov.br'
      : 'https://webservices.producaorestrita.esocial.gov.br'
  }

  private generateEventId(): string {
    return `ID${this.config.transmissorId}${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  private createXMLEnvelope(eventXML: string): string {
    const eventId = this.generateEventId()
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdmissao/v_S_01_02_00">
  <evtAdmissao Id="${eventId}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${this.config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>AURUM-911-1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${this.config.transmissorId}</nrInsc>
    </ideEmpregador>
    ${eventXML}
  </evtAdmissao>
</eSocial>`
  }

  async enviarAdmissao(dados: AdmissaoEvent): Promise<any> {
    const eventXML = `
    <trabalhador>
      <cpfTrab>${dados.cpfTrabalhador}</cpfTrab>
      <nmTrab>${dados.nmTrabalhador}</nmTrab>
      <sexo>${dados.sexo}</sexo>
      <racaCor>${dados.racaCor}</racaCor>
      <estCiv>${dados.estCiv}</estCiv>
      <grauInstr>${dados.grauInstr}</grauInstr>
      <dtNascto>${dados.dtNascto}</dtNascto>
      <paisNascto>${dados.paisNascto}</paisNascto>
      <paisNac>${dados.paisNac}</paisNac>
    </trabalhador>
    <vinculo>
      <matricula>${dados.cpfTrabalhador}</matricula>
      <tpRegTrab>1</tpRegTrab>
      <tpRegPrev>1</tpRegPrev>
      <cadIni>S</cadIni>
      <infoRegimeTrab>
        <infoCeletista>
          <dtAdm>${dados.dtAdmissao}</dtAdm>
          <tpAdmissao>${dados.tpAdmissao}</tpAdmissao>
          <indAdmissao>${dados.indAdmissao}</indAdmissao>
          <codCateg>${dados.codCateg}</codCateg>
          <remuneracao>
            <vrSalFx>${dados.remuneracao.vrSalFx}</vrSalFx>
            <undSalFixo>${dados.remuneracao.undSalFixo}</undSalFixo>
          </remuneracao>
        </infoCeletista>
      </infoRegimeTrab>
    </vinculo>`

    const xmlCompleto = this.createXMLEnvelope(eventXML)
    
    try {
      const response = await axios.post(`${this.baseUrl}/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc`, xmlCompleto, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'SOAPAction': 'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/v1_1_0/ServicoEnviarLoteEventos/EnviarLoteEventos'
        }
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Erro eSocial: ${error.response?.data || error.message}`)
    }
  }

  async consultarLote(protocoloEnvio: string): Promise<any> {
    const xmlConsulta = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header />
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/consulta/retornoProcessamento/v1_1_0">
      <consulta>
        <protocoloEnvio>${protocoloEnvio}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`

    const response = await axios.post(`${this.baseUrl}/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc`, xmlConsulta, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8'
      }
    })

    return response.data
  }
}