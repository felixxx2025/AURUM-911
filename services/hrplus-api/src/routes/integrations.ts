import { FastifyInstance } from 'fastify'

import { KenobyService } from '../integrations/kenoby'
import { OpenAIService } from '../integrations/openai'
import { SerproService } from '../integrations/serpro'
import { traceAsync } from '../tracing'

export async function integrationsRoutes(app: FastifyInstance) {
  const isTest = process.env.NODE_ENV === 'test'
  const errorSchema = isTest
    ? { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] }
    : { $ref: '#/components/schemas/ErrorResponse' }

  // Schemas de sucesso (inline em teste, $ref no restante)
  const CPFValidationResponse = isTest ? {
    type: 'object',
    properties: {
      cpf: { type: 'string' },
      valid: { type: 'boolean' },
      name: { type: 'string', nullable: true },
      birthDate: { type: 'string', nullable: true },
      situation: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          description: { type: 'string' }
        },
        nullable: true
      }
    },
    required: ['cpf','valid']
  } : { $ref: '#/components/schemas/CPFValidationResponse' }

  const KenobyJobPosition = {
    type: 'object',
    properties: {
      id: { type: 'string', nullable: true },
      title: { type: 'string' },
      description: { type: 'string' },
      department: { type: 'string' },
      location: { type: 'string' },
      employmentType: { type: 'string', enum: ['CLT','PJ','Estagio','Terceirizado'] },
      salaryRange: {
        type: 'object',
        properties: { min: { type: 'number' }, max: { type: 'number' } },
        required: ['min','max'],
        nullable: true
      },
      requirements: { type: 'array', items: { type: 'string' } },
      benefits: { type: 'array', items: { type: 'string' } },
      status: { type: 'string', enum: ['active','paused','closed'] }
    },
    required: ['title','description','department','location','employmentType','requirements','benefits','status']
  }

  const KenobyJobsResponse = isTest ? {
    type: 'object',
    properties: { jobs: { type: 'array', items: KenobyJobPosition } },
    required: ['jobs']
  } : { $ref: '#/components/schemas/KenobyJobsResponse' }

  const ResumeAnalysis = isTest ? {
    type: 'object',
    properties: {
      score: { type: 'number' },
      skills: { type: 'array', items: { type: 'string' } },
      experience: {
        type: 'object',
        properties: {
          years: { type: 'number' },
          positions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                company: { type: 'string' },
                duration: { type: 'string' }
              },
              required: ['title','company','duration']
            }
          }
        },
        required: ['years','positions']
      },
      education: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            degree: { type: 'string' },
            institution: { type: 'string' },
            year: { type: 'number', nullable: true }
          },
          required: ['degree','institution']
        }
      },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      recommendation: { type: 'string' },
      fitScore: { type: 'number' }
    },
    required: ['score','skills','experience','education','strengths','weaknesses','recommendation','fitScore']
  } : { $ref: '#/components/schemas/ResumeAnalysis' }

  const HRAssistantResponse = isTest ? {
    type: 'object', properties: { response: { type: 'string' } }, required: ['response']
  } : { $ref: '#/components/schemas/HRAssistantResponse' }
  const serpro = new SerproService({
    clientId: process.env.SERPRO_CLIENT_ID || '',
    clientSecret: process.env.SERPRO_CLIENT_SECRET || '',
    baseUrl: process.env.SERPRO_BASE_URL || 'https://gateway.apiserpro.serpro.gov.br'
  })

  const kenoby = new KenobyService({
    apiKey: process.env.KENOBY_API_KEY || '',
    baseUrl: process.env.KENOBY_BASE_URL || 'https://api.kenoby.com',
    companyId: process.env.KENOBY_COMPANY_ID || ''
  })

  const openai = new OpenAIService({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1'
  })

  app.post('/api/v1/integrations/serpro/validate-cpf', {
    schema: {
      tags: ['integrations'],
      body: {
        type: 'object',
        properties: { cpf: { type: 'string' } },
        required: ['cpf']
      },
      response: {
        200: CPFValidationResponse,
        400: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('integrations.serpro.validateCPF', async () => {
      const { cpf } = request.body
      try {
        const result = await serpro.validateCPF(cpf)
        return result
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    }, { cpf: (request.body && request.body.cpf) || undefined })
  })

  app.get('/api/v1/integrations/kenoby/jobs', {
    schema: {
      tags: ['integrations'],
      response: {
        200: KenobyJobsResponse,
        400: errorSchema
      }
    }
  }, async (_request: any, reply) => {
    return traceAsync('integrations.kenoby.jobs', async () => {
      try {
        const jobs = await kenoby.listarVagas('active')
        return { jobs }
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    })
  })

  app.post('/api/v1/integrations/openai/analyze-resume', {
    schema: {
      tags: ['integrations'],
      body: {
        type: 'object',
        properties: {
          resumeText: { type: 'string' },
          jobDescription: { type: 'string' }
        },
        required: ['resumeText', 'jobDescription']
      },
      response: {
        200: ResumeAnalysis,
        400: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('integrations.openai.analyzeResume', async () => {
      const { resumeText, jobDescription } = request.body
      try {
        const analysis = await openai.analisarCurriculo(resumeText, jobDescription)
        return analysis
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    })
  })

  app.post('/api/v1/integrations/openai/hr-assistant', {
    schema: {
      tags: ['integrations'],
      body: {
        type: 'object',
        properties: { question: { type: 'string' }, context: { type: 'object', nullable: true } },
        required: ['question']
      },
      response: {
        200: HRAssistantResponse,
        400: errorSchema
      }
    }
  }, async (request: any, reply) => {
    return traceAsync('integrations.openai.hrAssistant', async () => {
      const { question, context } = request.body
      try {
        const response = await openai.assistenteRH(question, context)
        return { response }
      } catch (error: any) {
        reply.code(400).send({ error: error.message })
      }
    })
  })
}