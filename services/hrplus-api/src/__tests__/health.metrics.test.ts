import { createApp } from '../app'

describe('health and metrics', () => {
  let app: any

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    app = await createApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /health returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.status).toBe('ok')
  })

  it('GET /health/ready returns checks', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/ready' })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(Array.isArray(body.checks)).toBe(true)
  })

  it('GET /metrics responds text with http_requests_total', async () => {
    const res = await app.inject({ method: 'GET', url: '/metrics' })
    expect(res.statusCode).toBe(200)
    const text = res.body as string
    expect(text).toContain('http_requests_total')
  })
})
