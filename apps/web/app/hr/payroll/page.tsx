// @ts-nocheck
'use client'

import { CurrencyDollarIcon, PlayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'

interface PayrollCycle {
  id: string
  month: string
  year: number
  status: 'draft' | 'processing' | 'completed' | 'paid'
  totalAmount: number
  employeeCount: number
  processedAt?: string
}

export default function PayrollPage() {
  const [cycles, setCycles] = useState<PayrollCycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading payroll cycles
    setTimeout(() => {
      setCycles([
        {
          id: '1',
          month: 'Novembro',
          year: 2024,
          status: 'draft',
          totalAmount: 2450000,
          employeeCount: 1247,
        },
        {
          id: '2',
          month: 'Outubro',
          year: 2024,
          status: 'paid',
          totalAmount: 2380000,
          employeeCount: 1235,
          processedAt: '2024-10-25T10:00:00Z',
        },
        {
          id: '3',
          month: 'Setembro',
          year: 2024,
          status: 'paid',
          totalAmount: 2340000,
          employeeCount: 1220,
          processedAt: '2024-09-25T10:00:00Z',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
    }
    const labels = {
      draft: 'Rascunho',
      processing: 'Processando',
      completed: 'Concluído',
      paid: 'Pago',
    }
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Folha de Pagamento</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie o processamento da folha de pagamento mensal
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <PlayIcon className="h-4 w-4 mr-2" />
            Processar Folha
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Mês Atual
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    R$ 2,45M
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Colaboradores
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    1,247
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Média Salarial
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    R$ 1.965
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Cycles Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Colaboradores
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Data Processamento
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : cycles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        Nenhum ciclo de pagamento encontrado
                      </td>
                    </tr>
                  ) : (
                    cycles.map((cycle) => (
                      <tr key={cycle.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {cycle.month}/{cycle.year}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {getStatusBadge(cycle.status)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {cycle.employeeCount.toLocaleString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(cycle.totalAmount)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {cycle.processedAt
                            ? new Date(cycle.processedAt).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Button variant="ghost" size="sm">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            Exportar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
