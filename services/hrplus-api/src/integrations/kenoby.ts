// Integração Kenoby ATS - Baseado na documentação oficial da API
import axios from 'axios'

interface KenobyConfig {
  apiKey: string
  baseUrl: string
  companyId: string
}

interface JobPosition {
  id?: string
  title: string
  description: string
  department: string
  location: string
  employmentType: 'CLT' | 'PJ' | 'Estagio' | 'Terceirizado'
  salaryRange?: {
    min: number
    max: number
  }
  requirements: string[]
  benefits: string[]
  status: 'active' | 'paused' | 'closed'
}

interface Candidate {
  id?: string
  name: string
  email: string
  phone?: string
  cpf?: string
  resume?: string
  linkedinUrl?: string
  source: string
  jobPositionId: string
  stage: string
  score?: number
  notes?: string
}

export class KenobyService {
  private config: KenobyConfig

  constructor(config: KenobyConfig) {
    this.config = config
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Gestão de Vagas
  async criarVaga(vaga: JobPosition): Promise<JobPosition> {
    const response = await axios.post(`${this.config.baseUrl}/v1/jobs`, {
      company_id: this.config.companyId,
      title: vaga.title,
      description: vaga.description,
      department: vaga.department,
      location: vaga.location,
      employment_type: vaga.employmentType,
      salary_min: vaga.salaryRange?.min,
      salary_max: vaga.salaryRange?.max,
      requirements: vaga.requirements.join('\n'),
      benefits: vaga.benefits.join('\n'),
      status: vaga.status
    }, {
      headers: this.getHeaders()
    })

    return {
      id: response.data.id,
      ...vaga
    }
  }

  async listarVagas(status?: string): Promise<JobPosition[]> {
    const params = status ? { status } : {}
    
    const response = await axios.get(`${this.config.baseUrl}/v1/jobs`, {
      headers: this.getHeaders(),
      params: {
        company_id: this.config.companyId,
        ...params
      }
    })

    return response.data.jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      employmentType: job.employment_type,
      salaryRange: job.salary_min ? {
        min: job.salary_min,
        max: job.salary_max
      } : undefined,
      requirements: job.requirements?.split('\n') || [],
      benefits: job.benefits?.split('\n') || [],
      status: job.status
    }))
  }

  // Gestão de Candidatos
  async adicionarCandidato(candidato: Candidate): Promise<Candidate> {
    const response = await axios.post(`${this.config.baseUrl}/v1/candidates`, {
      name: candidato.name,
      email: candidato.email,
      phone: candidato.phone,
      cpf: candidato.cpf,
      resume: candidato.resume,
      linkedin_url: candidato.linkedinUrl,
      source: candidato.source,
      job_id: candidato.jobPositionId,
      stage: candidato.stage,
      notes: candidato.notes
    }, {
      headers: this.getHeaders()
    })

    return {
      id: response.data.id,
      ...candidato
    }
  }

  async listarCandidatos(jobId?: string, stage?: string): Promise<Candidate[]> {
    const params: any = {}
    if (jobId) params.job_id = jobId
    if (stage) params.stage = stage

    const response = await axios.get(`${this.config.baseUrl}/v1/candidates`, {
      headers: this.getHeaders(),
      params
    })

    return response.data.candidates.map((candidate: any) => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      cpf: candidate.cpf,
      resume: candidate.resume,
      linkedinUrl: candidate.linkedin_url,
      source: candidate.source,
      jobPositionId: candidate.job_id,
      stage: candidate.stage,
      score: candidate.score,
      notes: candidate.notes
    }))
  }

  async moverCandidato(candidateId: string, novoStage: string, observacoes?: string): Promise<void> {
    await axios.put(`${this.config.baseUrl}/v1/candidates/${candidateId}/stage`, {
      stage: novoStage,
      notes: observacoes
    }, {
      headers: this.getHeaders()
    })
  }

  // Pipeline de Recrutamento
  async obterPipeline(jobId: string): Promise<any> {
    const response = await axios.get(`${this.config.baseUrl}/v1/jobs/${jobId}/pipeline`, {
      headers: this.getHeaders()
    })

    return response.data
  }

  // Relatórios
  async relatorioRecrutamento(dataInicio: string, dataFim: string): Promise<any> {
    const response = await axios.get(`${this.config.baseUrl}/v1/reports/recruitment`, {
      headers: this.getHeaders(),
      params: {
        start_date: dataInicio,
        end_date: dataFim,
        company_id: this.config.companyId
      }
    })

    return {
      totalVagas: response.data.total_jobs,
      totalCandidatos: response.data.total_candidates,
      taxaConversao: response.data.conversion_rate,
      tempoMedioContratacao: response.data.avg_hiring_time,
      fontesRecrutamento: response.data.sources,
      vagasPorDepartamento: response.data.jobs_by_department
    }
  }

  // Integração com AURUM - Sincronizar contratados
  async sincronizarContratados(): Promise<Array<{
    candidateId: string
    jobId: string
    name: string
    email: string
    cpf?: string
    startDate: string
  }>> {
    const candidatosContratados = await this.listarCandidatos(undefined, 'hired')
    
    return candidatosContratados.map(candidate => ({
      candidateId: candidate.id!,
      jobId: candidate.jobPositionId,
      name: candidate.name,
      email: candidate.email,
      cpf: candidate.cpf,
      startDate: new Date().toISOString().split('T')[0] // Data atual como padrão
    }))
  }
}