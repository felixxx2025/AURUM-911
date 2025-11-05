export interface ClicksignConfig {
  baseUrl: string
  apiKey?: string
  webhookSecret?: string
}

export class ClicksignClient {
  constructor(private cfg: ClicksignConfig) {}

  async startSignature(documentId: string, payload: Record<string, unknown>) {
    const res = await fetch(new URL('/fake/clicksign/start', this.cfg.baseUrl), {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ documentId, ...payload })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}
