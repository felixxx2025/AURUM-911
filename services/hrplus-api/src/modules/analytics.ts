import { FastifyInstance } from 'fastify'
import { prisma } from '../plugins/prisma'
import { promClient } from '../metrics'

const analyticsEvents = new promClient.Counter({
  name: 'analytics_events_total',
  help: 'Total analytics events',
  labelNames: ['event_type', 'tenant_id', 'module'],
})

interface AnalyticsEvent {
  tenantId: string
  userId: string
  eventType: string
  module: string
  metadata?: Record<string, any>
}

export class AnalyticsModule {
  constructor(private fastify: FastifyInstance) {}

  async trackEvent(event: AnalyticsEvent) {
    analyticsEvents.inc({
      event_type: event.eventType,
      tenant_id: event.tenantId,
      module: event.module,
    })

    await prisma.auditLog.create({
      data: {
        tenantId: event.tenantId,
        userId: event.userId,
        action: event.eventType,
        resource: event.module,
        metadata: event.metadata,
      },
    })
  }

  async getDashboardMetrics(tenantId: string, period: string = '7d') {
    const startDate = this.getStartDate(period)
    
    const [userActivity, moduleUsage, errorRates] = await Promise.all([
      this.getUserActivity(tenantId, startDate),
      this.getModuleUsage(tenantId, startDate),
      this.getErrorRates(tenantId, startDate),
    ])

    return {
      userActivity,
      moduleUsage,
      errorRates,
      period,
      generatedAt: new Date().toISOString(),
    }
  }

  private async getUserActivity(tenantId: string, startDate: Date) {
    return await prisma.auditLog.groupBy({
      by: ['createdAt'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: { userId: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  private async getModuleUsage(tenantId: string, startDate: Date) {
    return await prisma.auditLog.groupBy({
      by: ['resource'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })
  }

  private async getErrorRates(tenantId: string, startDate: Date) {
    return await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
        action: { contains: 'error' },
      },
      _count: { id: true },
    })
  }

  private getStartDate(period: string): Date {
    const now = new Date()
    switch (period) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }
}