import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = 'https://api.aurum.cool'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token')
      // Redirect to login
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password })
    return response.data
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token')
  }
}

export const hrAPI = {
  getEmployees: async () => {
    const response = await api.get('/api/v1/hr/people')
    return response.data
  },
  
  getDashboard: async () => {
    const response = await api.get('/api/v1/analytics/dashboard')
    return response.data
  }
}

export default api