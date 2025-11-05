// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/api'

export default function MarketplacePage() {
  const [apps, setApps] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMarketplaceData()
  }, [])

  const loadMarketplaceData = async () => {
    try {
      const [appsData, statsData] = await Promise.all([
        apiClient.request('/api/v1/marketplace/apps'),
        apiClient.request('/api/v1/marketplace/stats')
      ])
      
      setApps(appsData.apps)
      setStats(statsData)
    } catch (_) {
      console.error('Error loading marketplace')
    } finally {
      setLoading(false)
    }
  }

  const installApp = async (appId: string) => {
    try {
      await apiClient.request(`/api/v1/marketplace/apps/${appId}/install`, {
        method: 'POST'
      })
      alert('App instalado com sucesso!')
    } catch (_) {
      alert('Erro ao instalar app')
    }
  }

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Marketplace de Apps</h1>
        <p className="mt-2 text-gray-600">Descubra e instale apps para estender o AURUM</p>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total de Apps</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalApps}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Apps Ativos</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.activeApps}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Instalações</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalInstalls?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Desenvolvedores</h3>
          <p className="text-2xl font-bold text-gray-900">89</p>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar apps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg font-bold text-gray-600">
                      {app.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">por {app.developer}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  app.category === 'integration' ? 'bg-blue-100 text-blue-800' :
                  app.category === 'hr' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {app.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{app.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>⭐ {app.rating}</span>
                  <span>📥 {app.installCount.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  {app.price > 0 ? (
                    <span className="text-lg font-bold text-gray-900">
                      R$ {app.price.toFixed(2)}/mês
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-green-600">Gratuito</span>
                  )}
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={() => installApp(app.id)}
              >
                Instalar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Desenvolva para o AURUM</h2>
          <p className="text-blue-100 mb-6">
            Crie apps e integrações para milhares de empresas. Use nossa API pública e SDK.
          </p>
          <div className="flex space-x-4">
            <Button variant="secondary">Ver Documentação</Button>
            <Button variant="ghost" className="text-white border-white">Submeter App</Button>
          </div>
        </div>
      </div>
    </div>
  )
}