export interface StripeConfig { baseUrl: string; apiKey?: string; webhookSecret?: string }

export class StripeClient {
  constructor(private cfg: StripeConfig) {}

  async createPixCharge(amount: number, currency = 'BRL') {
    const res = await fetch(new URL('/fake/stripe/pix', this.cfg.baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ amount, currency }) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}
