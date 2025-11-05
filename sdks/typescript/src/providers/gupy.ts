export interface GupyConfig { baseUrl: string; apiKey?: string }

export class GupyClient {
  constructor(private cfg: GupyConfig) {}

  async listCandidates() {
    const res = await fetch(new URL('/fake/gupy/candidates', this.cfg.baseUrl))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}
