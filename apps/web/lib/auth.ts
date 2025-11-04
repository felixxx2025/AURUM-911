import { apiClient } from './api'

interface User {
  id: string
  email: string
  name?: string
  role?: string
}

interface AuthState {
  user: User | null
  token: string | null
  tenantId: string | null
  isAuthenticated: boolean
}

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    tenantId: null,
    isAuthenticated: false,
  }

  private listeners: Array<(state: AuthState) => void> = []

  constructor() {
    this.loadFromStorage()
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state))
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')
    const tenantId = localStorage.getItem('tenant_id')

    if (token && user) {
      this.state = {
        token,
        user: JSON.parse(user),
        tenantId,
        isAuthenticated: true,
      }
      
      apiClient.setToken(token)
      if (tenantId) apiClient.setTenant(tenantId)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    if (this.state.token && this.state.user) {
      localStorage.setItem('auth_token', this.state.token)
      localStorage.setItem('auth_user', JSON.stringify(this.state.user))
      if (this.state.tenantId) {
        localStorage.setItem('tenant_id', this.state.tenantId)
      }
    } else {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('tenant_id')
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await apiClient.login({ email, password })
      
      this.state = {
        user: response.user,
        token: response.access_token,
        tenantId: response.tenant_id,
        isAuthenticated: true,
      }

      apiClient.setToken(response.access_token)
      if (response.tenant_id) apiClient.setTenant(response.tenant_id)
      
      this.saveToStorage()
      this.notify()
      
      return response
    } catch (error) {
      throw error
    }
  }

  logout() {
    this.state = {
      user: null,
      token: null,
      tenantId: null,
      isAuthenticated: false,
    }
    
    this.saveToStorage()
    this.notify()
  }

  getState() {
    return this.state
  }
}

export const authManager = new AuthManager()