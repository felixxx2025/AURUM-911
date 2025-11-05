import { FastifyInstance } from 'fastify'
import { finSphereService } from '../modules/finsphere'
import { trustIDService } from '../modules/trustid'
import { visionXService } from '../modules/visionx'
import { brandingService } from '../lib/branding'

export async function modulesRoutes(app: FastifyInstance) {
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  }

  // FinSphere Routes
  app.get('/api/v1/finsphere/accounts', { preHandler: authenticate }, async (request: any, reply) => {
    const summary = await finSphereService.getFinancialSummary(request.user.tenantId)
    return summary
  })

  app.post('/api/v1/finsphere/accounts', { preHandler: authenticate }, async (request: any, reply) => {
    const { employeeId, accountType } = request.body
    
    const account = await finSphereService.createAccount({
      tenantId: request.user.tenantId,
      employeeId,
      accountNumber: '',
      status: 'active'
    })
    
    return reply.code(201).send(account)
  })

  app.post('/api/v1/finsphere/transactions', { preHandler: authenticate }, async (request: any, reply) => {
    const transaction = await finSphereService.createTransaction({
      tenantId: request.user.tenantId,
      ...request.body
    })
    
    return reply.code(201).send(transaction)
  })

  // TrustID Routes
  app.post('/api/v1/trustid/kyc', { preHandler: authenticate }, async (request: any, reply) => {
    const kycResult = await trustIDService.performKYC({
      tenantId: request.user.tenantId,
      ...request.body
    })
    
    return kycResult
  })

  app.post('/api/v1/trustid/liveness', { preHandler: authenticate }, async (request: any, reply) => {
    const { employeeId, biometric } = request.body
    
    const result = await trustIDService.performLivenessCheck(employeeId, biometric)
    return result
  })

  app.get('/api/v1/trustid/identity/:employeeId', { preHandler: authenticate }, async (request: any, reply) => {
    const { employeeId } = request.params
    
    const status = await trustIDService.getIdentityStatus(employeeId)
    return status
  })

  // VisionX Routes
  app.get('/api/v1/visionx/dashboards', { preHandler: authenticate }, async (request: any, reply) => {
    const dashboards = await visionXService.listDashboards(request.user.tenantId)
    return { dashboards }
  })

  app.get('/api/v1/visionx/dashboards/:id', { preHandler: authenticate }, async (request: any, reply) => {
    const { id } = request.params
    
    const dashboard = await visionXService.getDashboard(request.user.tenantId, id)
    if (!dashboard) {
      return reply.code(404).send({ error: 'Dashboard not found' })
    }
    
    return dashboard
  })

  app.post('/api/v1/visionx/dashboards', { preHandler: authenticate }, async (request: any, reply) => {
    const dashboard = await visionXService.createDashboard(request.user.tenantId, {
      ...request.body,
      createdBy: request.user.userId
    })
    
    return reply.code(201).send(dashboard)
  })

  app.get('/api/v1/visionx/metrics/hr', { preHandler: authenticate }, async (request: any, reply) => {
    const metrics = await visionXService.getHRMetrics(request.user.tenantId)
    return metrics
  })

  app.get('/api/v1/visionx/metrics/financial', { preHandler: authenticate }, async (request: any, reply) => {
    const metrics = await visionXService.getFinancialMetrics(request.user.tenantId)
    return metrics
  })

  app.get('/api/v1/visionx/metrics/compliance', { preHandler: authenticate }, async (request: any, reply) => {
    const metrics = await visionXService.getComplianceMetrics(request.user.tenantId)
    return metrics
  })

  // Branding Routes
  app.get('/api/v1/branding/config', { preHandler: authenticate }, async (request: any, reply) => {
    const config = await brandingService.getBrandingConfig(request.user.tenantId)
    return config
  })

  app.put('/api/v1/branding/config', { preHandler: authenticate }, async (request: any, reply) => {
    const config = await brandingService.updateBrandingConfig(request.user.tenantId, request.body)
    return config
  })

  app.get('/api/v1/branding/themes', { preHandler: authenticate }, async (request: any, reply) => {
    const themes = await brandingService.getAvailableThemes()
    return { themes }
  })

  app.get('/api/v1/branding/css', async (request: any, reply) => {
    const { tenantId, theme } = request.query
    
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenantId required' })
    }
    
    const config = await brandingService.getBrandingConfig(tenantId)
    if (!config) {
      return reply.code(404).send({ error: 'Tenant not found' })
    }
    
    const css = brandingService.generateCSS(config, theme)
    
    reply.header('Content-Type', 'text/css')
    return css
  })
}