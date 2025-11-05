export interface BelvoConfig { baseUrl: string; secretId?: string; secretPassword?: string }

export class BelvoClient {
  constructor(private cfg: BelvoConfig) {}

  async createConsent(userId: string) {
    const res = await fetch(new URL('/fake/belvo/consent', this.cfg.baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId }) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}
