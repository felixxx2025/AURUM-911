// Marketplace de Apps
import { PrismaClient } from '@prisma/client'

interface App {
  id: string
  name: string
  description: string
  developer: string
  category: 'hr' | 'finance' | 'integration' | 'analytics'
  version: string
  price: number
  status: 'active' | 'pending'
  permissions: string[]
  installCount: number
  rating: number
}

export class AppStoreService {
  constructor(private prisma: PrismaClient) {}

  async listApps(category?: string): Promise<App[]> {
    const apps: App[] = [
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        description: 'Notificações automáticas no Slack',
        developer: 'AURUM Team',
        category: 'integration',
        version: '1.2.0',
        price: 29.90,
        status: 'active',
        permissions: ['notifications:send'],
        installCount: 1247,
        rating: 4.8
      },
      {
        id: 'power-bi-connector',
        name: 'Power BI Connector',
        description: 'Conecte dados ao Power BI',
        developer: 'Microsoft Partner',
        category: 'analytics',
        version: '2.1.0',
        price: 0,
        status: 'active',
        permissions: ['data:export'],
        installCount: 892,
        rating: 4.6
      }
    ]

    return category ? apps.filter(app => app.category === category) : apps
  }

  async installApp(tenantId: string, appId: string): Promise<void> {
    console.log(`Installing app ${appId} for tenant ${tenantId}`)
  }

  async getInstalledApps(tenantId: string): Promise<string[]> {
    return ['slack-integration']
  }

  async getMarketplaceStats(): Promise<any> {
    return {
      totalApps: 156,
      activeApps: 142,
      totalInstalls: 45678,
      categories: {
        integration: 45,
        hr: 38,
        analytics: 28,
        finance: 25
      }
    }
  }
}

export const appStoreService = new AppStoreService(new PrismaClient())