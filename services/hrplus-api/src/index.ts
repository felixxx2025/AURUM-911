import Fastify from 'fastify'

const app = Fastify({ logger: true })

// Simple auth placeholder
app.post('/api/v1/auth/login', async (req, reply) => {
  return reply.send({ access_token: 'demo', refresh_token: 'demo', tenant_id: '00000000-0000-0000-0000-000000000000', user: { id: 'u1' } })
})

// People
app.get('/api/v1/hr/people', async (req, reply) => {
  return reply.send({ items: [], page: 1, pageSize: 0, total: 0 })
})

app.get('/api/v1/hr/people/:employeeId', async (req: any, reply) => {
  const { employeeId } = req.params
  return reply.send({ id: employeeId, first_name: 'Fulano', last_name: 'Da Silva' })
})

app.post('/api/v1/hr/people', async (req, reply) => {
  return reply.code(201).send({ id: 'emp-1' })
})

app.put('/api/v1/hr/people/:employeeId', async (req: any, reply) => {
  const { employeeId } = req.params
  return reply.send({ id: employeeId, updated: true })
})

// Payroll
app.post('/api/v1/hr/payroll/run', async (req: any, reply) => {
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
app.listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`hrplus-api up on :${port}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
