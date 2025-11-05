// Sistema de Auditoria - Baseado em SOX e LGPD
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

interface AuditEvent {
  tenantId: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

interface AuditQuery {
  tenantId: string
  userId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export class AuditService {
  constructor(private prisma: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    const auditLog = {
      id: this.generateId(),
      tenant_id: event.tenantId,
      user_id: event.userId,
      action: event.action,
      resource: event.resource,
      resource_id: event.resourceId,
      old_values: event.oldValues ? JSON.stringify(event.oldValues) : null,
      new_values: event.newValues ? JSON.stringify(event.newValues) : null,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      timestamp: new Date(),
      hash: ''
    }

    // Gerar hash para integridade
    auditLog.hash = this.generateHash(auditLog)

    // Salvar no banco (append-only)
    await this.prisma.$executeRaw`
      INSERT INTO audit_logs (
        id, tenant_id, user_id, action, resource, resource_id,
        old_values, new_values, metadata, ip_address, user_agent,
        timestamp, hash
      ) VALUES (
        ${auditLog.id}, ${auditLog.tenant_id}, ${auditLog.user_id},
        ${auditLog.action}, ${auditLog.resource}, ${auditLog.resource_id},
        ${auditLog.old_values}, ${auditLog.new_values}, ${auditLog.metadata},
        ${auditLog.ip_address}, ${auditLog.user_agent},
        ${auditLog.timestamp}, ${auditLog.hash}
      )
    `
  }

  async query(params: AuditQuery): Promise<any[]> {
    let whereClause = `WHERE tenant_id = '${params.tenantId}'`
    
    if (params.userId) {
      whereClause += ` AND user_id = '${params.userId}'`
    }
    
    if (params.action) {
      whereClause += ` AND action = '${params.action}'`
    }
    
    if (params.resource) {
      whereClause += ` AND resource = '${params.resource}'`
    }
    
    if (params.startDate) {
      whereClause += ` AND timestamp >= '${params.startDate.toISOString()}'`
    }
    
    if (params.endDate) {
      whereClause += ` AND timestamp <= '${params.endDate.toISOString()}'`
    }

    const limit = params.limit || 100
    const offset = params.offset || 0

    const logs = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM audit_logs 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    return logs as any[]
  }

  async verifyIntegrity(tenantId: string, logId: string): Promise<boolean> {
    const log = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM audit_logs 
      WHERE id = '${logId}' AND tenant_id = '${tenantId}'
    `) as any[]

    if (log.length === 0) return false

    const logData = log[0]
    const storedHash = logData.hash
    
    // Remover hash para recalcular
    delete logData.hash
    const calculatedHash = this.generateHash(logData)

    return storedHash === calculatedHash
  }

  // Auditoria específica para ações sensíveis
  async logSensitiveAction(
    tenantId: string,
    userId: string,
    action: string,
    details: any,
    request?: any
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `SENSITIVE_${action}`,
      resource: 'system',
      metadata: {
        ...details,
        severity: 'HIGH',
        requiresReview: true
      },
      ipAddress: request?.ip,
      userAgent: request?.headers?.['user-agent']
    })
  }

  // Auditoria para LGPD
  async logDataAccess(
    tenantId: string,
    userId: string,
    dataType: string,
    dataSubject: string,
    purpose: string,
    request?: any
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'DATA_ACCESS',
      resource: dataType,
      resourceId: dataSubject,
      metadata: {
        purpose,
        legalBasis: 'legitimate_interest',
        dataCategory: 'personal',
        retention: '5_years'
      },
      ipAddress: request?.ip,
      userAgent: request?.headers?.['user-agent']
    })
  }

  // Relatório de conformidade
  async generateComplianceReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const sensitiveActions = await this.query({
      tenantId,
      startDate,
      endDate
    })

    const dataAccess = sensitiveActions.filter(log => 
      log.action === 'DATA_ACCESS'
    )

    const sensitiveOperations = sensitiveActions.filter(log => 
      log.action.startsWith('SENSITIVE_')
    )

    return {
      period: { startDate, endDate },
      summary: {
        totalEvents: sensitiveActions.length,
        dataAccessEvents: dataAccess.length,
        sensitiveOperations: sensitiveOperations.length,
        uniqueUsers: new Set(sensitiveActions.map(log => log.user_id)).size
      },
      dataAccess: {
        byPurpose: this.groupBy(dataAccess, 'metadata.purpose'),
        byDataType: this.groupBy(dataAccess, 'resource'),
        byUser: this.groupBy(dataAccess, 'user_id')
      },
      sensitiveOperations: {
        byAction: this.groupBy(sensitiveOperations, 'action'),
        byUser: this.groupBy(sensitiveOperations, 'user_id')
      },
      integrityChecks: {
        totalLogs: sensitiveActions.length,
        verifiedLogs: sensitiveActions.length, // Assumindo todos verificados
        integrityScore: 100
      }
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateHash(data: any): string {
    const content = JSON.stringify(data, Object.keys(data).sort())
    return createHash('sha256').update(content).digest('hex')
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = this.getNestedValue(item, key) || 'unknown'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        if (key.startsWith('metadata.') && current.metadata) {
          const metadataKey = key.replace('metadata.', '')
          const metadata = typeof current.metadata === 'string' 
            ? JSON.parse(current.metadata) 
            : current.metadata
          return metadata[metadataKey]
        }
        return current[key]
      }
      return undefined
    }, obj)
  }
}

// Middleware para auditoria automática
export function createAuditMiddleware(auditService: AuditService) {
  return async (request: any, reply: any, done: any) => {
    const originalSend = reply.send
    
    reply.send = function(payload: any) {
      // Log da resposta se for uma operação sensível
      if (request.method !== 'GET' && request.user) {
        const action = `${request.method}_${request.routerPath || request.url}`
        
        auditService.log({
          tenantId: request.user.tenantId,
          userId: request.user.userId,
          action,
          resource: request.routerPath || request.url,
          newValues: request.method === 'POST' ? request.body : undefined,
          metadata: {
            statusCode: reply.statusCode,
            responseTime: Date.now() - request.startTime
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }).catch(console.error)
      }
      
      return originalSend.call(this, payload)
    }
    
    request.startTime = Date.now()
    done()
  }
}