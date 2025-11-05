import { FastifyRequest } from 'fastify'

import { prisma } from '../plugins/prisma'

interface AuditEvent {
  action: string
  resource: string
  resourceId?: string
  userId: string
  tenantId: string
  ipAddress?: string
  userAgent?: string
  changes?: Record<string, { old: any; new: any }>
  metadata?: Record<string, any>
}

export class AdvancedAudit {
  async logEvent(event: AuditEvent) {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        userId: event.userId,
        tenantId: event.tenantId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        changes: event.changes,
        metadata: {
          ...event.metadata,
          timestamp: new Date().toISOString(),
          severity: this.calculateSeverity(event.action)
        }
      }
    })
  }

  createMiddleware() {
    return async (request: FastifyRequest, reply: any, done: any) => {
      const originalSend = reply.send
      
      reply.send = function(payload: any) {
        if (request.user && request.method !== 'GET') {
          const event: AuditEvent = {
            action: `${request.method}_${request.routerPath}`,
            resource: request.routerPath?.split('/')[3] || 'unknown',
            userId: request.user.userId,
            tenantId: request.user.tenantId,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            metadata: {
              statusCode: reply.statusCode,
              responseTime: Date.now() - request.startTime
            }
          }
          
          // Fire and forget
          new AdvancedAudit().logEvent(event).catch(console.error)
        }
        
        return originalSend.call(this, payload)
      }
      
      done()
    }
  }

  private calculateSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (action.includes('delete') || action.includes('DROP')) return 'critical'
    if (action.includes('create') || action.includes('update')) return 'medium'
    if (action.includes('login') || action.includes('auth')) return 'high'
    return 'low'
  }

  async getAuditReport(tenantId: string, startDate: Date, endDate: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      totalEvents: logs.length,
      criticalEvents: logs.filter(l => l.metadata?.severity === 'critical').length,
      topUsers: this.getTopUsers(logs),
      topActions: this.getTopActions(logs),
      timeline: this.getTimeline(logs)
    }
  }

  private getTopUsers(logs: any[]) {
    const userCounts = logs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
  }

  private getTopActions(logs: any[]) {
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
  }

  private getTimeline(logs: any[]) {
    const timeline = logs.reduce((acc, log) => {
      const hour = new Date(log.createdAt).toISOString().substring(0, 13)
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(timeline).map(([hour, count]) => ({ hour, count }))
  }
}