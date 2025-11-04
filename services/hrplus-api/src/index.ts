import Fastify from 'fastify'
import { z } from 'zod'

import { requireAuth, requireRole, signToken } from './auth'
import { setupMetrics } from './metrics'
import { InMemoryPeopleRepo, PrismaPeopleRepo, type PeopleRepo } from './repo/people'

function getTenantId(req: any): string | null {
  const h = req.headers?.['x-tenant-id'] as string | undefined
  if (h && typeof h === 'string' && h.trim()) return h
  return null
}

const app = Fastify({ logger: true })

// Repositories (DB if available, else in-memory)
let peopleRepo: PeopleRepo
if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    peopleRepo = new PrismaPeopleRepo(prisma)
    app.log.info('Using PrismaPeopleRepo (DATABASE_URL detected)')
  } catch (e) {
    app.log.warn({ err: e }, 'Failed to init Prisma, falling back to InMemoryPeopleRepo')
    peopleRepo = new InMemoryPeopleRepo()
  }
} else {
  peopleRepo = new InMemoryPeopleRepo()
}

// Auth - emite JWT com tenant e roles
app.post('/api/v1/auth/login', async (req: any, reply) => {
  const body = z
    .object({
      user: z.string().min(1).default('u1'),
      tenant_id: z.string().uuid().default('00000000-0000-0000-0000-000000000000'),
      roles: z.array(z.string()).default(['hr:read','hr:write']),
    })
    .parse(req.body || {})
  const token = signToken({ sub: body.user, tenant_id: body.tenant_id, roles: body.roles })
  return reply.send({ access_token: token, token_type: 'Bearer', tenant_id: body.tenant_id, user: { id: body.user }, roles: body.roles })
})

// People
app.get('/api/v1/hr/people', async (req: any, reply) => {
  const tenantId = getTenantId(req) || '00000000-0000-0000-0000-000000000000'
  const page = Number(req.query?.page ?? 1)
  const pageSize = Number(req.query?.pageSize ?? 20)
  const data = await peopleRepo.list(tenantId, page, pageSize)
  return reply.send(data)
})

app.get('/api/v1/hr/people/:employeeId', async (req: any, reply) => {
  const tenantId = getTenantId(req) || '00000000-0000-0000-0000-000000000000'
  const { employeeId } = req.params
  const p = await peopleRepo.get(tenantId, employeeId)
  if (!p) return reply.code(404).send({ message: 'Not found' })
  return reply.send(p)
})

app.post('/api/v1/hr/people', async (req: any, reply) => {
  const tenantId = getTenantId(req) || '00000000-0000-0000-0000-000000000000'
  const body = z
    .object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      email: z.string().email().optional(),
    })
    .safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'invalid_body', issues: body.error.issues })
  const created = await peopleRepo.create(tenantId, {
    first_name: body.data.first_name,
    last_name: body.data.last_name,
    email: body.data.email,
  })
  return reply.code(201).send(created)
})

app.put('/api/v1/hr/people/:employeeId', async (req: any, reply) => {
  const tenantId = getTenantId(req) || '00000000-0000-0000-0000-000000000000'
  const { employeeId } = req.params
  const body = z
    .object({
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    })
    .safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'invalid_body', issues: body.error.issues })
  const updated = await peopleRepo.update(tenantId, employeeId, {
    first_name: body.data.first_name,
    last_name: body.data.last_name,
    email: body.data.email,
  })
  if (!updated) return reply.code(404).send({ message: 'Not found' })
  return reply.send(updated)
})

// Payroll
app.post('/api/v1/hr/payroll/run', { preHandler: [requireAuth, requireRole('payroll:run')] }, async (req: any, reply) => {
  const { simulate } = req.body || {}
  return reply.code(202).send({ runId: 'run-1', status: simulate ? 'simulated' : 'draft' })
})

// Time punch
app.post('/api/v1/hr/time/punch', async (req: any, reply) => {
  return reply.code(201).send({ id: 'punch-1' })
})

// Partners - Zetra Consig eligibility
app.post('/api/v1/partners/zetra-consig/eligibility', async (req, reply) => {
  return reply.send({ eligible: true, maxAmount: 1200.0, fee: 25.0, margin_after: 5.2 })
})

// FinSphere transfer
app.post('/api/v1/fin/payments/transfer', async (req, reply) => {
  return reply.code(202).send({ status: 'accepted', batch_id: 'batch-1' })
})

const port = Number(process.env.PORT || 3000)
setupMetrics(app)
app.listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`hrplus-api up on :${port}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
