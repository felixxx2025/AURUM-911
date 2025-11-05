export type LogStatus = 'queued'|'delivered'|'failed'|'all'

export interface OAuthClientCredentials {
  clientId: string
  clientSecret: string
}

export interface AURUMClientOptions {
  baseUrl?: string
  defaultScopes?: string
  timeoutMs?: number
}

export class AURUMClient {
  private baseUrl: string
  private timeoutMs: number
  private accessToken: string | null = null

  constructor(opts: AURUMClientOptions = {}) {
    this.baseUrl = opts.baseUrl || 'http://localhost:3000'
    this.timeoutMs = opts.timeoutMs ?? 10000
  }

  private async doFetch(path: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const to = setTimeout(()=>controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(new URL(path, this.baseUrl), { ...(init||{}), signal: controller.signal, headers: { ...(init?.headers||{}), ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}) } })
      clearTimeout(to)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } finally {
      clearTimeout(to)
    }
  }

  async getToken(creds: OAuthClientCredentials): Promise<string> {
    const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: creds.clientId, client_secret: creds.clientSecret })
    const res = await this.doFetch('/oauth2/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body })
    const data = await res.json() as { access_token: string }
    this.accessToken = data.access_token
    return this.accessToken
  }

  async listPartnerLogsPaged(partnerId: string, params: { status?: LogStatus; q?: string; from?: string; to?: string; limit?: number; offset?: number; sort?: 'asc'|'desc' } = {}): Promise<{ items: any[]; total: number; limit: number; offset: number }> {
    const sp = new URLSearchParams()
    if (params.status) sp.set('status', params.status)
    if (params.q) sp.set('q', params.q)
    if (params.from) sp.set('from', params.from)
    if (params.to) sp.set('to', params.to)
    if (params.limit != null) sp.set('limit', String(params.limit))
    if (params.offset != null) sp.set('offset', String(params.offset))
    if (params.sort) sp.set('sort', params.sort)
    const res = await this.doFetch(`/api/v1/partners/${partnerId}/logs?` + sp.toString())
    const items = await res.json()
    const total = parseInt(res.headers.get('X-Total-Count') || '0', 10)
    const limit = parseInt(res.headers.get('X-Result-Limit') || String(params.limit || 0), 10) || (params.limit || 0)
    const offset = parseInt(res.headers.get('X-Result-Offset') || String(params.offset || 0), 10) || (params.offset || 0)
    return { items, total, limit, offset }
  }
}

export * from './providers/belvo'
export * from './providers/clicksign'
export * from './providers/gupy'
export * from './providers/idwall'
export * from './providers/stripe'

