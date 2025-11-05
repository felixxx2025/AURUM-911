// SDK Público para Desenvolvedores
import { FastifyInstance } from 'fastify'

interface APIKey {
  id: string
  tenantId: string
  name: string
  key: string
  permissions: string[]
  status: 'active' | 'revoked'
}

export class PublicAPIService {
  private apiKeys: Map<string, APIKey> = new Map()

  async createAPIKey(tenantId: string, name: string, permissions: string[]): Promise<APIKey> {
    const apiKey: APIKey = {
      id: `key_${Date.now()}`,
      tenantId,
      name,
      key: `aurum_${Math.random().toString(36).substr(2, 32)}`,
      permissions,
      status: 'active'
    }

    this.apiKeys.set(apiKey.key, apiKey)
    return apiKey
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    return this.apiKeys.get(key) || null
  }

  hasPermission(apiKey: APIKey, permission: string): boolean {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*')
  }
}

export function setupPublicAPI(app: FastifyInstance) {
  const publicAPI = new PublicAPIService()

  const authenticateAPI = async (request: any, reply: any) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'API key required' })
    }

    const apiKey = authHeader.substring(7)
    const keyData = await publicAPI.validateAPIKey(apiKey)
    
    if (!keyData || keyData.status !== 'active') {
      return reply.code(401).send({ error: 'Invalid API key' })
    }

    request.apiKey = keyData
  }

  // Public API Routes
  app.get('/api/public/v1/employees', { preHandler: authenticateAPI }, async (request: any, reply) => {
    if (!publicAPI.hasPermission(request.apiKey, 'employees:read')) {
      return reply.code(403).send({ error: 'Permission denied' })
    }

    return {
      data: [
        {
          id: 'emp_1',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@empresa.com',
          department: 'Tech'
        }
      ]
    }
  })

  app.post('/api/public/v1/employees', { preHandler: authenticateAPI }, async (request: any, reply) => {
    if (!publicAPI.hasPermission(request.apiKey, 'employees:write')) {
      return reply.code(403).send({ error: 'Permission denied' })
    }

    return reply.code(201).send({
      id: `emp_${Date.now()}`,
      ...request.body
    })
  })

  app.get('/api/public/v1/docs', async (request, reply) => {
    return {
      version: '1.0.0',
      baseUrl: 'https://api.aurum.cool',
      authentication: 'Bearer token',
      endpoints: {
        employees: {
          list: 'GET /api/public/v1/employees',
          create: 'POST /api/public/v1/employees'
        }
      }
    }
  })

  // API Key Management
  app.post('/api/v1/api-keys', async (request: any, reply) => {
    const { name, permissions } = request.body
    const apiKey = await publicAPI.createAPIKey(request.user?.tenantId, name, permissions)
    
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      permissions: apiKey.permissions
    }
  })
}

export const publicAPIService = new PublicAPIService()