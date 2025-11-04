const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private baseURL: string
  private tenantId: string | null = null
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setTenant(tenantId: string) {
    this.tenantId = tenantId
  }

  setToken(token: string) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.tenantId) {
      headers['x-tenant-id'] = this.tenantId
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
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
}

export const apiClient = new ApiClient(API_BASE_URL)