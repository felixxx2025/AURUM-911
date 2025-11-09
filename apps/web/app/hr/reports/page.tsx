// @ts-nocheck
'use client'

import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Report {
  id: string
  name: string
  category: 'hr' | 'payroll' | 'benefits' | 'time' | 'recruitment'
  description: string
  lastGenerated?: string
  format: 'pdf' | 'excel' | 'csv'
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand'
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Relatório de Headcount',
    category: 'hr',
    description: 'Número de colaboradores por departamento, cargo e localização',
    lastGenerated: '2025-11-05T08:00:00Z',
    format: 'excel',
    frequency: 'monthly',
  },
  {
    id: '2',
    name: 'Relatório de Folha de Pagamento',
    category: 'payroll',
    description: 'Detalhamento completo da folha de pagamento mensal',
    lastGenerated: '2025-11-01T10:00:00Z',
    format: 'pdf',
    frequency: 'monthly',
  },
  {
    id: '3',
    name: 'Relatório de Frequência',
    category: 'time',
    description: 'Controle de ponto, horas trabalhadas e ausências',
    lastGenerated: '2025-11-05T06:00:00Z',
    format: 'excel',
    frequency: 'daily',
  },
  {
    id: '4',
    name: 'Relatório de Turnover',
    category: 'hr',
    description: 'Taxa de rotatividade e análise de desligamentos',
    lastGenerated: '2025-11-01T09:00:00Z',
    format: 'pdf',
    frequency: 'monthly',
  },
  {
    id: '5',
    name: 'Relatório de Benefícios',
    category: 'benefits',
    description: 'Adesão e custos dos benefícios corporativos',
    lastGenerated: '2025-11-01T11:00:00Z',
    format: 'excel',
    frequency: 'monthly',
  },
  {
    id: '6',
    name: 'Relatório de Recrutamento',
    category: 'recruitment',
    description: 'Vagas abertas, candidatos e tempo de contratação',
    lastGenerated: '2025-11-04T14:00:00Z',
    format: 'pdf',
    frequency: 'weekly',
  },
]

const categoryLabels = {
  hr: { label: 'RH', color: 'bg-blue-100 text-blue-800' },
  payroll: { label: 'Folha', color: 'bg-green-100 text-green-800' },
  benefits: { label: 'Benefícios', color: 'bg-purple-100 text-purple-800' },
  time: { label: 'Ponto', color: 'bg-yellow-100 text-yellow-800' },
  recruitment: { label: 'Recrutamento', color: 'bg-pink-100 text-pink-800' },
}

const frequencyLabels = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  'on-demand': 'Sob Demanda',
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>(mockReports)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredReports =
    selectedCategory === 'all'
      ? reports
      : reports.filter((report) => report.category === selectedCategory)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Relatórios
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gere e visualize relatórios personalizados de RH
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Criar Relatório Personalizado
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Relatórios Disponíveis
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {reports.length}
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
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gerados Este Mês
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">42</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Downloads
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">156</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FunnelIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Personalizados
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mt-6 flex items-center space-x-4">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Categoria:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">Todos</option>
          <option value="hr">RH</option>
          <option value="payroll">Folha de Pagamento</option>
          <option value="benefits">Benefícios</option>
          <option value="time">Ponto</option>
          <option value="recruitment">Recrutamento</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      categoryLabels[report.category].color
                    }`}
                  >
                    {categoryLabels[report.category].label}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500">{report.description}</p>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Frequência: <strong>{frequencyLabels[report.frequency]}</strong>
                </span>
                <span className="uppercase text-xs">{report.format}</span>
              </div>

              {report.lastGenerated && (
                <p className="mt-2 text-xs text-gray-400">
                  Última geração:{' '}
                  {new Date(report.lastGenerated).toLocaleString('pt-BR')}
                </p>
              )}

              <div className="mt-4 flex space-x-2">
                <Button size="sm" className="flex-1">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Gerar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Agendar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
