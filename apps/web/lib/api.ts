const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private baseURL: string
  private tenantId: string | null = null
  private token: string | null = null
  private lastCorrelationId: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getSubdomain(): string | null {
    if (typeof window === 'undefined') return null
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    return parts.length > 2 ? parts[0] : null
  }

  setTenant(tenantId: string | null) {
    this.tenantId = tenantId || null
  }

  setToken(token: string | null) {
    this.token = token || null
  }

  private uuid(): string {
    try {
      // Browser crypto via globalThis to avoid type issues where crypto may not exist
      const g: any = globalThis as any
      if (g?.crypto?.randomUUID) return g.crypto.randomUUID()
    } catch (e) { void e }
    // Fallback
    return 'id-' + Math.random().toString(16).slice(2) + Date.now().toString(16)
  }

  private getHeaders(idempotencyKey?: string): HeadersInit {
    const cid = this.uuid()
    this.lastCorrelationId = cid
    const headers: HeadersInit = {
      'X-Correlation-Id': cid,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const subdomain = this.getSubdomain()
    if (subdomain) {
      headers['x-subdomain'] = subdomain
    }

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    return headers
  }

  private isAbsoluteUrl(endpoint: string): boolean {
    return /^https?:\/\//i.test(endpoint)
  }

  private buildUrl(endpoint: string): string {
    return this.isAbsoluteUrl(endpoint) ? endpoint : `${this.baseURL}${endpoint}`
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async doFetch(url: string, options: RequestInit, opts?: { timeoutMs?: number; idempotencyKey?: string; retries?: number; retryOnStatuses?: number[] }): Promise<Response> {
    const { pushLog } = await import('@/lib/log')
    const timeoutMs = opts?.timeoutMs ?? 10_000
    const retries = Math.max(0, opts?.retries ?? 1) // number of retries on failure
    const retryOn = opts?.retryOnStatuses ?? [429, 502, 503, 504]

    // Merge headers with runtime defaults
    const mergedHeaders: HeadersInit = {
      ...this.getHeaders(opts?.idempotencyKey),
      ...options.headers,
    }

    // Set Content-Type when sending JSON bodies (avoid for FormData/streams)
    const body = (options as any).body
    const hasBody = body !== undefined && body !== null
    const isStringBody = typeof body === 'string'
    if (hasBody && isStringBody && !(mergedHeaders as any)['Content-Type']) {
      (mergedHeaders as any)['Content-Type'] = 'application/json'
    }

    let lastError: any
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      const startedAt = Date.now()
      try {
        const response = await fetch(url, { ...options, headers: mergedHeaders, signal: controller.signal })
        clearTimeout(timeout)
        const ms = Date.now() - startedAt
        pushLog('info', 'HTTP ' + (options.method || 'GET') + ' ' + url, {
          status: response.status,
          ms,
          correlationId: this.lastCorrelationId,
        })
        if (!response.ok) {
          // Retry on selected statuses with backoff and optional Retry-After
          if (attempt < retries && retryOn.includes(response.status)) {
            const ra = response.headers.get('retry-after')
            let delay = Math.min(300 * 2 ** attempt, 2000)
            if (ra) {
              const secs = Number(ra)
              if (!isNaN(secs)) delay = Math.min(secs * 1000, 5000)
            }
            await this.sleep(delay + Math.floor(Math.random() * 200))
            continue
          }
          // Construct error message
          let errorMessage = `API Error: ${response.status} ${response.statusText}`
          try {
            const errorData = await response.json()
            if ((errorData as any)?.message) errorMessage = (errorData as any).message
          } catch (e) { void e }
          pushLog('warn', errorMessage, { status: response.status, url, ms, correlationId: this.lastCorrelationId })
          throw new Error(errorMessage)
        }
        return response
      } catch (err: any) {
        clearTimeout(timeout)
        const ms = Date.now() - startedAt
        pushLog('error', 'HTTP error ' + (options.method || 'GET') + ' ' + url, {
          error: String(err?.message || err),
          ms,
          correlationId: this.lastCorrelationId,
        })
        lastError = err
        // Retry on network/abort errors
        const isAbort = err?.name === 'AbortError'
        const isNetwork = err instanceof TypeError || /Network error/i.test(String(err?.message || ''))
        if (attempt < retries && (isAbort || isNetwork)) {
          await this.sleep(Math.min(300 * 2 ** attempt, 1500))
          continue
        }
        throw err
      }
    }
    // If we exit loop without returning, throw last error
    throw lastError ?? new Error('Unknown network error')
  }

  async request<T>(endpoint: string, options: RequestInit = {}, opts?: { idempotencyKey?: string; timeoutMs?: number; retries?: number; retryOnStatuses?: number[] }): Promise<T> {
    try {
      const url = this.buildUrl(endpoint)
      const response = await this.doFetch(url, options, opts)

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      }
      return response.text() as unknown as T
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async requestRaw<T>(endpoint: string, options: RequestInit = {}, opts?: { idempotencyKey?: string; timeoutMs?: number; retries?: number; retryOnStatuses?: number[] }): Promise<{ data: T; response: Response }> {
    const url = this.buildUrl(endpoint)
    const response = await this.doFetch(url, options, opts)
    const contentType = response.headers.get('content-type')
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : (await response.text() as unknown as T)
    return { data: data as T, response }
  }

  // Generic helpers
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const idemKey = 'idem-' + Math.random().toString(36).slice(2)
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }, { idempotencyKey: idemKey })
  }

  // Auth
  async login(credentials: { email: string; password: string; mfaCode?: string }) {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required')
    }
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      credentials: 'include'
    })
  }

  async logout(refreshToken: string) {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async enableMFA() {
    return this.request('/api/v1/auth/mfa/enable', {
      method: 'POST',
    })
  }

  async verifyMFA(code: string) {
    return this.request('/api/v1/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async disableMFA(password: string) {
    return this.request('/api/v1/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  async getTenantInfo() {
    return this.request('/api/v1/tenant/lookup')
  }

  // People
  async getPeople(params?: { page?: number; pageSize?: number; filter?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    if (params?.filter) searchParams.set('filter', params.filter)

    return this.request(`/api/v1/hr/people?${searchParams}`)
  }

  async getPerson(id: string) {
    return this.request(`/api/v1/hr/people/${id}`)
  }

  async createPerson(data: any) {
    return this.request('/api/v1/hr/people', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePerson(id: string, data: any) {
    return this.request(`/api/v1/hr/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Payroll
  async runPayroll(data: { simulate?: boolean }) {
    return this.request('/api/v1/hr/payroll/run', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Time
  async punchTime(data: any) {
    return this.request('/api/v1/hr/time/punch', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Partners
  async listPartners(): Promise<Array<{ id: string; name: string; scopes: string[]; webhooks: number }>> {
    return this.get('/api/v1/partners')
  }

  async createPartner(body: { name: string; scopes?: string[] }) {
    return this.request('/api/v1/partners', { method: 'POST', body: JSON.stringify(body) })
  }

  async rotatePartnerCredentials(id: string) {
    return this.request(`/api/v1/partners/${id}/rotate-credentials`, { method: 'POST' })
  }

  async listWebhooks(partnerId: string): Promise<Array<{ id: string; url: string; eventTypes: string[] }>> {
    return this.get(`/api/v1/partners/${partnerId}/webhooks`)
  }

  async createWebhook(partnerId: string, body: { url: string; eventTypes: string[] }) {
    return this.request(`/api/v1/partners/${partnerId}/webhooks`, { method: 'POST', body: JSON.stringify(body) })
  }

  async listPartnerLogs(partnerId: string): Promise<Array<{ id: string; event: string; status: string; attempt: number; responseStatus?: number; lastError?: string; timestamp: number }>> {
    return this.get(`/api/v1/partners/${partnerId}/logs`)
  }

  async replayDelivery(partnerId: string, deliveryId: string) {
    return this.request(`/api/v1/partners/${partnerId}/webhooks/${deliveryId}/replay`, { method: 'POST' })
  }

  async listPartnerLogsPaged(
    partnerId: string,
    params: { status?: 'all'|'queued'|'delivered'|'failed'; q?: string; from?: string; to?: string; limit?: number; offset?: number; sort?: 'asc'|'desc' } = {}
  ): Promise<{ items: Array<{ id: string; event: string; status: string; attempt: number; responseStatus?: number; lastError?: string; timestamp: number; responseBody?: string; payload?: unknown }>; total: number; limit: number; offset: number }>
  {
    const sp = new URLSearchParams()
    if (params.status) sp.set('status', params.status)
    if (params.q) sp.set('q', params.q)
    if (params.from) sp.set('from', params.from)
    if (params.to) sp.set('to', params.to)
    if (params.limit != null) sp.set('limit', String(params.limit))
    if (params.offset != null) sp.set('offset', String(params.offset))
    if (params.sort) sp.set('sort', params.sort)
    const { data, response } = await this.requestRaw<Array<any>>(`/api/v1/partners/${partnerId}/logs?${sp.toString()}`)
    const total = parseInt(response.headers.get('X-Total-Count') || '0', 10)
    const limit = parseInt(response.headers.get('X-Result-Limit') || String(params.limit || 0), 10) || (params.limit || 0)
    const offset = parseInt(response.headers.get('X-Result-Offset') || String(params.offset || 0), 10) || (params.offset || 0)
    return { items: data as any[], total, limit, offset }
  }

  // Sandbox
  async sandboxDatasets(): Promise<Array<{ name: string; size?: number }>> {
    return this.get('/sandbox/datasets')
  }

  async sandboxEmitEvent(type: string, payload?: unknown) {
    return this.request(`/sandbox/events/${encodeURIComponent(type)}`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    })
  }

  // Webhooks catalog
  async getWebhookCatalog(): Promise<{ items: Array<{ type: string; description: string }> }> {
    return this.get('/webhooks/catalog')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)