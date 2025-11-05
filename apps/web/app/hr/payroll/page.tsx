// @ts-nocheck
'use client'

import {
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface PayrollRun {
  id: string
  month: string
  year: number
  status: 'draft' | 'processing' | 'completed' | 'paid'
  totalAmount: number
  employeeCount: number
  processedAt?: string
}

const mockPayrollRuns: PayrollRun[] = [
  {
    id: '1',
    month: 'Novembro',
    year: 2025,
    status: 'processing',
    totalAmount: 2450000,
    employeeCount: 1247,
  },
  {
    id: '2',
    month: 'Outubro',
    year: 2025,
    status: 'paid',
    totalAmount: 2380000,
    employeeCount: 1242,
    processedAt: '2025-11-01T10:00:00Z',
  },
  {
    id: '3',
    month: 'Setembro',
    year: 2025,
    status: 'paid',
    totalAmount: 2350000,
    employeeCount: 1235,
    processedAt: '2025-10-01T10:00:00Z',
  },
]

const statusLabels = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completo', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
}

export default function PayrollPage() {
  const [payrollRuns] = useState<PayrollRun[]>(mockPayrollRuns)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Folha de Pagamento
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie e processe a folha de pagamento da empresa
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <PlayIcon className="h-4 w-4 mr-2" />
            Processar Nova Folha
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total do Mês Atual
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(2450000)}
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
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Colaboradores Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">1,247</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Status
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    Processando
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Runs Table */}
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
                      Data de Processamento
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {payrollRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {run.month} {run.year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[run.status].color
                          }`}
                        >
                          {statusLabels[run.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {run.employeeCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(run.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {run.processedAt
                          ? new Date(run.processedAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
