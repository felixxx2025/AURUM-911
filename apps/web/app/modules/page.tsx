// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api'

export default function ModulesPage() {
  const [hrMetrics, setHrMetrics] = useState<any>(null)
  const [finMetrics, setFinMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const [hr, fin] = await Promise.all([
        apiClient.request('/api/v1/visionx/metrics/hr'),
        apiClient.request('/api/v1/visionx/metrics/financial')
      ])
      
      setHrMetrics(hr)
      setFinMetrics(fin)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Módulos AURUM</h1>
        <p className="mt-2 text-gray-600">Visão geral de todos os módulos da plataforma</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">📊 HR+ Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Colaboradores</h3>
            <p className="text-2xl font-bold text-gray-900">{hrMetrics?.headcount?.total}</p>
            <p className="text-sm text-green-600">{hrMetrics?.headcount?.change}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Turnover</h3>
            <p className="text-2xl font-bold text-gray-900">{hrMetrics?.turnover?.rate}%</p>
            <p className="text-sm text-green-600">{hrMetrics?.turnover?.change}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Time to Hire</h3>
            <p className="text-2xl font-bold text-gray-900">{hrMetrics?.recruitment?.timeToHire} dias</p>
            <p className="text-sm text-green-600">{hrMetrics?.recruitment?.change}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Custo Folha</h3>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(hrMetrics?.payroll?.totalCost / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-green-600">{hrMetrics?.payroll?.change}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">💰 FinSphere</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Contas Ativas</h3>
            <p className="text-2xl font-bold text-gray-900">{finMetrics?.accounts?.active}</p>
            <p className="text-sm text-gray-500">
              Saldo Total: R$ {(finMetrics?.accounts?.totalBalance / 1000000).toFixed(1)}M
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Transações/Mês</h3>
            <p className="text-2xl font-bold text-gray-900">{finMetrics?.transactions?.monthly}</p>
            <p className="text-sm text-gray-500">
              Volume: R$ {(finMetrics?.transactions?.volume / 1000).toFixed(0)}K
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Empréstimos Ativos</h3>
            <p className="text-2xl font-bold text-gray-900">{finMetrics?.loans?.active}</p>
            <p className="text-sm text-gray-500">
              Total: R$ {(finMetrics?.loans?.totalAmount / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔐 TrustID</h3>
          <div className="space-y-2">
            <Button className="w-full" variant="secondary">Iniciar KYC</Button>
            <Button className="w-full" variant="secondary">Teste de Vida</Button>
            <Button className="w-full" variant="secondary">Validar Documento</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📈 VisionX Analytics</h3>
          <div className="space-y-2">
            <Button className="w-full" variant="secondary">Criar Dashboard</Button>
            <Button className="w-full" variant="secondary">Relatórios Automáticos</Button>
            <Button className="w-full" variant="secondary">Exportar Dados</Button>
          </div>
        </div>
      </div>
    </div>
  )
}