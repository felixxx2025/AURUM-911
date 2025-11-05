import { FastifyInstance } from 'fastify'
import { appStoreService } from '../marketplace/app-store'
import { setupPublicAPI } from '../sdk/public-api'

export async function marketplaceRoutes(app: FastifyInstance) {
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  }

  // App Store Routes
  app.get('/api/v1/marketplace/apps', async (request: any, reply) => {
    const { category, search } = request.query
    const apps = await appStoreService.listApps(category)
    return { apps }
  })

  app.get('/api/v1/marketplace/apps/:appId', async (request: any, reply) => {
    const { appId } = request.params
    const apps = await appStoreService.listApps()
    const app = apps.find(a => a.id === appId)
    
    if (!app) {
      return reply.code(404).send({ error: 'App not found' })
    }
    
    return app
  })

  app.post('/api/v1/marketplace/apps/:appId/install', { preHandler: authenticate }, async (request: any, reply) => {
    const { appId } = request.params
    
    try {
      await appStoreService.installApp(request.user.tenantId, appId)
      return { message: 'App installed successfully' }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })

  app.get('/api/v1/marketplace/installed', { preHandler: authenticate }, async (request: any, reply) => {
    const installedApps = await appStoreService.getInstalledApps(request.user.tenantId)
    return { apps: installedApps }
  })

  app.get('/api/v1/marketplace/stats', async (request, reply) => {
    const stats = await appStoreService.getMarketplaceStats()
    return stats
  })

  // Developer Routes
  app.post('/api/v1/developer/apps/submit', { preHandler: authenticate }, async (request: any, reply) => {
    const appData = request.body
    
    // Mock app submission
    const appId = `app_${Date.now()}`
    console.log('App submitted:', appData)
    
    return reply.code(201).send({
      appId,
      status: 'pending_review',
      message: 'App submitted for review'
    })
  })

  // Setup Public API routes
  setupPublicAPI(app)
}