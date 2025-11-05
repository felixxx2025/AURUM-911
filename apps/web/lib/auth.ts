// @ts-nocheck
import { apiClient } from './api'

interface User {
  id: string
  email: string
  name?: string
  role?: string
  mfaEnabled?: boolean
  lastLogin?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  tenantId: string | null
  isAuthenticated: boolean
  mfaRequired: boolean
  sessionExpiry: number | null
}

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    tenantId: null,
    isAuthenticated: false,
    mfaRequired: false,
    sessionExpiry: null,
  }

  private refreshTimer: NodeJS.Timeout | null = null

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

    try {
      const token = localStorage.getItem('auth_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const user = localStorage.getItem('auth_user')
      const tenantId = localStorage.getItem('tenant_id')
      const sessionExpiry = localStorage.getItem('session_expiry')

      if (token && user && sessionExpiry) {
        const expiry = parseInt(sessionExpiry)
        if (Date.now() < expiry && !isNaN(expiry)) {
          const parsedUser = JSON.parse(user)
          if (this.isValidUser(parsedUser)) {
            this.state = {
              token: this.sanitizeString(token),
              refreshToken: refreshToken ? this.sanitizeString(refreshToken) : null,
              user: parsedUser,
              tenantId: tenantId ? this.sanitizeString(tenantId) : null,
              isAuthenticated: true,
              mfaRequired: false,
              sessionExpiry: expiry,
            }
        
            apiClient.setToken(this.state.token)
            if (this.state.tenantId) apiClient.setTenant(this.state.tenantId)
            this.scheduleTokenRefresh()
          } else {
            this.clearStorage()
          }
        } else {
          this.clearStorage()
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
      this.clearStorage()
    }
  }

  private sanitizeString(str: string): string {
    return str.replace(/[<>"'&]/g, '')
  }

  private isValidUser(user: any): user is User {
    return user && typeof user.id === 'string' && typeof user.email === 'string'
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    if (this.state.token && this.state.user) {
      localStorage.setItem('auth_token', this.state.token)
      if (this.state.refreshToken) localStorage.setItem('refresh_token', this.state.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(this.state.user))
      if (this.state.tenantId) localStorage.setItem('tenant_id', this.state.tenantId)
      if (this.state.sessionExpiry) localStorage.setItem('session_expiry', this.state.sessionExpiry.toString())
    } else {
      this.clearStorage()
    }
  }

  private clearStorage() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('tenant_id')
    localStorage.removeItem('session_expiry')
  }

  async login(email: string, password: string, mfaCode?: string) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const response = await apiClient.login({ email, password, mfaCode })
      
      if (!response) {
        throw new Error('Invalid response from server')
      }
      
      if (response.mfaRequired) {
        this.state = {
          ...this.state,
          mfaRequired: true,
          user: response.user,
        }
        this.notify()
        return response
      }
      
      if (!response.access_token || !response.user) {
        throw new Error('Invalid authentication response')
      }
      
      const expiry = Date.now() + (response.expires_in * 1000)
      
      this.state = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        tenantId: response.tenant_id,
        isAuthenticated: true,
        mfaRequired: false,
        sessionExpiry: expiry,
      }

      apiClient.setToken(response.access_token)
      if (response.tenant_id) apiClient.setTenant(response.tenant_id)
      
      this.saveToStorage()
      this.scheduleTokenRefresh()
      this.notify()
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      this.state = {
        ...this.state,
        mfaRequired: false,
        isAuthenticated: false,
      }
      this.notify()
      throw error instanceof Error ? error : new Error('Login failed')
    }
  }

  async logout() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    
    if (this.state.refreshToken) {
      try {
        await apiClient.logout(this.state.refreshToken)
      } catch (error) {
        console.warn('Logout error:', error)
      }
    }
    
    this.state = {
      user: null,
      token: null,
      refreshToken: null,
      tenantId: null,
      isAuthenticated: false,
      mfaRequired: false,
      sessionExpiry: null,
    }
    
    this.saveToStorage()
    this.notify()
  }

  private scheduleTokenRefresh() {
    if (!this.state.sessionExpiry) return
    
    const timeUntilRefresh = this.state.sessionExpiry - Date.now() - 300000 // 5 min before expiry
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken()
      }, timeUntilRefresh)
    }
  }

  private async refreshToken() {
    if (!this.state.refreshToken) return
    
    try {
      const response = await apiClient.refreshToken(this.state.refreshToken)
      
      const expiry = Date.now() + (response.expires_in * 1000)
      
      this.state = {
        ...this.state,
        token: response.access_token,
        refreshToken: response.refresh_token || this.state.refreshToken,
        sessionExpiry: expiry,
      }
      
      apiClient.setToken(response.access_token)
      this.saveToStorage()
      this.scheduleTokenRefresh()
      this.notify()
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
    }
  }

  async enableMFA() {
    const response = await apiClient.enableMFA()
    return response
  }

  async verifyMFA(code: string) {
    const response = await apiClient.verifyMFA(code)
    if (response.success && this.state.user) {
      this.state.user.mfaEnabled = true
      this.saveToStorage()
      this.notify()
    }
    return response
  }

  async disableMFA(password: string) {
    const response = await apiClient.disableMFA(password)
    if (response.success && this.state.user) {
      this.state.user.mfaEnabled = false
      this.saveToStorage()
      this.notify()
    }
    return response
  }

  getState() {
    return this.state
  }
}

export const authManager = new AuthManager()