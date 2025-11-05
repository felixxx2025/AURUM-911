import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

app.post('/api/v1/auth/login', async (request, reply) => {
  const { email, password } = request.body as any
  if (email === 'test@aurum.cool' && password === 'test123') {
    return { access_token: 'mock-token', token_type: 'Bearer', user: { email } }
  }
  return reply.code(401).send({ error: 'invalid_credentials' })
})

app.get('/api/v1/hr/people', async () => ({ data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }))

const port = Number(process.env.PORT || 3000)
app.listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`🚀 AURUM API running on :${port}`))
  .catch(console.error)