'use client'

import { useEffect, useState } from 'react'

import ClientLogs from '@/components/ClientLogs'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api'

export default function AdminPage() {
  type Health = {
    status?: string
    services?: {
      database?: { status?: string; responseTime?: string | number }
      redis?: { status?: string; responseTime?: string | number }
      queues?: { status?: string; activeWorkers?: number }
    }
    metrics?: { uptime?: number; memory?: { heapUsed?: number } }
  }
  const [health, setHealth] = useState<Health | null>(null)
  const [_queues, setQueues] = useState<unknown>(null)
  const [_integrations, setIntegrations] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [healthData, queueData, integrationData] = await Promise.all([
        apiClient.request<Health>('/api/v1/admin/health'),
        apiClient.request('/api/v1/admin/queues/status'),
        apiClient.request('/api/v1/admin/integrations/status')
      ])
      
      setHealth(healthData)
      setQueues(queueData)
      setIntegrations(integrationData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      await apiClient.request('/api/v1/admin/cache/clear', { method: 'DELETE' })
      alert('Cache limpo com sucesso!')
    } catch (_) {
      alert('Erro ao limpar cache')
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Administração</h1>
        <p className="mt-2 text-gray-600">Monitoramento e gestão do sistema</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Sistema</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{health?.status}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${health?.services?.database?.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Database</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{health?.services?.database?.responseTime}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${health?.services?.redis?.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Redis</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{health?.services?.redis?.responseTime}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${health?.services?.queues?.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Filas</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{health?.services?.queues?.activeWorkers} workers</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Administrativas</h2>
        <div className="flex space-x-4">
          <Button onClick={clearCache} variant="secondary">
            Limpar Cache
          </Button>
          <Button variant="secondary">
            Exportar Logs
          </Button>
          <Button variant="secondary">
            Relatório de Compliance
          </Button>
          <Button variant="danger">
            Modo Manutenção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Uptime</h3>
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor((health?.metrics?.uptime || 0) / 3600)}h {Math.floor(((health?.metrics?.uptime || 0) % 3600) / 60)}m
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Memória</h3>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((health?.metrics?.memory?.heapUsed || 0) / 1024 / 1024)}MB
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Requests/min</h3>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
        </div>
        <ClientLogs />
      </div>
    </div>
  )
}