import { createApp } from '../app'

describe('e2e RBAC + validações', () => {
  let app: any
  const sign = (payload: any) => (app as any).jwt.sign(payload)

  beforeAll(async () => {
    app = await createApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('nega acesso sem JWT', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/hr/payroll/run', payload: {} })
    expect(res.statusCode).toBe(401)
  })

  it('forbid sem escopo correto', async () => {
    const token = sign({ userId: 'u1', tenantId: 't1', role: 'hr_manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/fin/payments/transfer',
      headers: { authorization: `Bearer ${token}` },
      payload: { from_account: 'A', to_account: 'B', amount: 100 },
    })
    expect(res.statusCode).toBe(403)
  })

  it('validação Zod falha com 400', async () => {
    const token = sign({ userId: 'u1', tenantId: 't1', role: 'partner_ops' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/partners/zetra-consig/eligibility',
      headers: { authorization: `Bearer ${token}` },
      payload: { employee_id: 'not-an-uuid' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('aceita com escopo correto e payload válido', async () => {
    const token = sign({ userId: 'u1', tenantId: 't1', role: 'finance' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/fin/payments/transfer',
      headers: { authorization: `Bearer ${token}` },
      payload: { from_account: 'A', to_account: 'B', amount: 100, currency: 'BRL' },
    })
    expect(res.statusCode).toBe(202)
  })
})
