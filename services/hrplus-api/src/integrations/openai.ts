// Integração OpenAI - Para análise de currículos e assistente de RH
import axios from 'axios'

interface OpenAIConfig {
  apiKey: string
  model: string
  baseUrl: string
}

interface ResumeAnalysis {
  score: number
  skills: string[]
  experience: {
    years: number
    positions: Array<{
      title: string
      company: string
      duration: string
    }>
  }
  education: Array<{
    degree: string
    institution: string
    year?: number
  }>
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  fitScore: number
}

export class OpenAIService {
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>) {
    const response = await axios.post(`${this.config.baseUrl}/chat/completions`, {
      model: this.config.model,
      messages,
      temperature: 0.3,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data.choices[0].message.content
  }

  async analisarCurriculo(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
    const prompt = `
Analise o currículo abaixo em relação à vaga descrita e retorne um JSON com a seguinte estrutura:

{
  "score": number (0-100),
  "skills": ["skill1", "skill2"],
  "experience": {
    "years": number,
    "positions": [{"title": "string", "company": "string", "duration": "string"}]
  },
  "education": [{"degree": "string", "institution": "string", "year": number}],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendation": "string",
  "fitScore": number (0-100)
}

VAGA:
${jobDescription}

CURRÍCULO:
${resumeText}

Responda APENAS com o JSON, sem texto adicional.`

    const messages = [
      { role: 'system', content: 'Você é um especialista em análise de currículos e recrutamento. Analise currículos de forma objetiva e profissional.' },
      { role: 'user', content: prompt }
    ]

    const response = await this.makeRequest(messages)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('Erro ao processar análise do currículo')
    }
  }

  async gerarDescricaoVaga(titulo: string, departamento: string, requisitos: string[]): Promise<string> {
    const prompt = `
Crie uma descrição de vaga profissional e atrativa para:

Título: ${titulo}
Departamento: ${departamento}
Requisitos principais: ${requisitos.join(', ')}

A descrição deve incluir:
- Resumo da posição
- Principais responsabilidades
- Requisitos obrigatórios e desejáveis
- Benefícios
- Perfil do candidato ideal

Mantenha um tom profissional mas acolhedor.`

    const messages = [
      { role: 'system', content: 'Você é um especialista em recrutamento e seleção, criando descrições de vagas atrativas e precisas.' },
      { role: 'user', content: prompt }
    ]

    return await this.makeRequest(messages)
  }

  async sugerirPerguntasEntrevista(jobTitle: string, candidateProfile: string): Promise<string[]> {
    const prompt = `
Com base no cargo "${jobTitle}" e no perfil do candidato abaixo, sugira 10 perguntas relevantes para uma entrevista:

Perfil do candidato:
${candidateProfile}

Retorne apenas as perguntas, uma por linha, numeradas de 1 a 10.`

    const messages = [
      { role: 'system', content: 'Você é um especialista em entrevistas de emprego, criando perguntas relevantes e eficazes.' },
      { role: 'user', content: prompt }
    ]

    const response = await this.makeRequest(messages)
    return response
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^\d+\.\s*/, ''))
  }

  async analisarFeedbackEntrevista(perguntas: string[], respostas: string[]): Promise<{
    pontuacao: number
    pontosFortesIdentificados: string[]
    areasDeAtencao: string[]
    recomendacao: string
  }> {
    const entrevista = perguntas.map((pergunta, index) => 
      `P: ${pergunta}\nR: ${respostas[index] || 'Não respondida'}`
    ).join('\n\n')

    const prompt = `
Analise esta entrevista e retorne um JSON com:

{
  "pontuacao": number (0-100),
  "pontosFortesIdentificados": ["ponto1", "ponto2"],
  "areasDeAtencao": ["area1", "area2"],
  "recomendacao": "string com recomendação final"
}

ENTREVISTA:
${entrevista}

Responda APENAS com o JSON.`

    const messages = [
      { role: 'system', content: 'Você é um especialista em avaliação de entrevistas, analisando respostas de forma objetiva e construtiva.' },
      { role: 'user', content: prompt }
    ]

    const response = await this.makeRequest(messages)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('Erro ao processar análise da entrevista')
    }
  }

  async assistenteRH(pergunta: string, contexto?: string): Promise<string> {
    const prompt = contexto 
      ? `Contexto: ${contexto}\n\nPergunta: ${pergunta}`
      : pergunta

    const messages = [
      { 
        role: 'system', 
        content: 'Você é um assistente especializado em Recursos Humanos, com conhecimento em legislação trabalhista brasileira, melhores práticas de RH, recrutamento, gestão de pessoas e compliance. Responda de forma clara, prática e sempre considerando a legislação brasileira.' 
      },
      { role: 'user', content: prompt }
    ]

    return await this.makeRequest(messages)
  }
}