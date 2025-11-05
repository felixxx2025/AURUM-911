import { FastifyInstance } from 'fastify'
import { prisma } from '../plugins/prisma'

interface RevenueShare {
  appId: string
  developerId: string
  tenantId: string
  amount: number
  currency: string
  transactionType: 'subscription' | 'usage' | 'commission'
  metadata?: Record<string, any>
}

export class RevenueSharingModule {
  constructor(private fastify: FastifyInstance) {}

  async calculateRevenue(appId: string, period: string = '30d') {
    const startDate = this.getStartDate(period)
    
    const transactions = await prisma.marketplaceTransaction.findMany({
      where: {
        appId,
        createdAt: { gte: startDate },
      },
      include: {
        app: {
          include: { developer: true }
        }
      }
    })

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const platformFee = totalRevenue * 0.3 // 30% platform fee
    const developerShare = totalRevenue - platformFee

    return {
      totalRevenue,
      platformFee,
      developerShare,
      transactionCount: transactions.length,
      period,
    }
  }

  async processRevenueSplit(transaction: RevenueShare) {
    const app = await prisma.marketplaceApp.findUnique({
      where: { id: transaction.appId },
      include: { developer: true }
    })

    if (!app) throw new Error('App not found')

    const platformFee = transaction.amount * 0.3
    const developerShare = transaction.amount - platformFee

    await prisma.$transaction([
      // Record platform revenue
      prisma.revenueRecord.create({
        data: {
          appId: transaction.appId,
          tenantId: transaction.tenantId,
          amount: platformFee,
          type: 'platform_fee',
          currency: transaction.currency,
          metadata: transaction.metadata,
        }
      }),
      // Record developer revenue
      prisma.revenueRecord.create({
        data: {
          appId: transaction.appId,
          developerId: transaction.developerId,
          tenantId: transaction.tenantId,
          amount: developerShare,
          type: 'developer_share',
          currency: transaction.currency,
          metadata: transaction.metadata,
        }
      }),
      // Update developer balance
      prisma.developer.update({
        where: { id: transaction.developerId },
        data: {
          balance: { increment: developerShare }
        }
      })
    ])

    return { platformFee, developerShare }
  }

  async getDeveloperEarnings(developerId: string, period: string = '30d') {
    const startDate = this.getStartDate(period)
    
    const earnings = await prisma.revenueRecord.groupBy({
      by: ['appId'],
      where: {
        developerId,
        type: 'developer_share',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    })

    const totalEarnings = earnings.reduce((sum, e) => sum + (e._sum.amount || 0), 0)

    return {
      totalEarnings,
      appBreakdown: earnings,
      period,
    }
  }

  private getStartDate(period: string): Date {
    const now = new Date()
    switch (period) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
  }
}