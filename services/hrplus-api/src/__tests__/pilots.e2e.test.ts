/// <reference types="jest" />
import { createApp } from '../app'

jest.setTimeout(10000)

describe('Pilotos end-to-end', () => {
  test('Clicksign: inicia, dispara webhook e chega como succeeded', async () => {
    const app = await createApp()
    await app.ready()
    const start = await app.inject({ method: 'POST', url: '/pilot/e-sign/clicksign/start', payload: { documentId: 'doc-123' } })
    expect(start.statusCode).toBe(202)
    const { id } = start.json() as any
    expect(id).toBeTruthy()
    await new Promise((r)=>setTimeout(r, 500))
    const status = await app.inject({ method: 'GET', url: `/pilot/e-sign/clicksign/${id}/status` })
    expect(status.statusCode).toBe(200)
    const body = status.json() as any
    expect(body.status).toBe('succeeded')
    const logs = await app.inject({ method: 'GET', url: '/integrations/webhooks/logs?provider=clicksign&limit=5' })
    expect(logs.statusCode).toBe(200)
    const ljson = logs.json() as any
    expect(Array.isArray(ljson.items)).toBe(true)
    await app.close()
  })
})
