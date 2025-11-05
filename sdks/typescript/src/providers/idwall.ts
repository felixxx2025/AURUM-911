export interface IdwallConfig { baseUrl: string; apiKey?: string; webhookSecret?: string }

export class IdwallClient {
  constructor(private cfg: IdwallConfig) {}

  async createKycVerification(subject: { name: string; cpf: string }) {
    const res = await fetch(new URL('/fake/idwall/kyc', this.cfg.baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(subject) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}
