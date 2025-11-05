'use client'

import { ChartBarIcon, DocumentArrowDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Report {
  id: string
  name: string
  category: 'hr' | 'payroll' | 'time' | 'benefits' | 'compliance'
  description: string
  lastGenerated?: string
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const reports: Report[] = [
    {
      id: '1',
      name: 'Relatório de Headcount',
      category: 'hr',
      description: 'Análise detalhada do quadro de colaboradores por departamento',
      lastGenerated: '2024-11-01',
    },
    {
      id: '2',
      name: 'Análise de Turnover',
      category: 'hr',
      description: 'Taxa de rotatividade e análise de desligamentos',
      lastGenerated: '2024-10-28',
    },
    {
      id: '3',
      name: 'Folha de Pagamento Consolidada',
      category: 'payroll',
      description: 'Resumo executivo dos custos com folha de pagamento',
      lastGenerated: '2024-10-25',
    },
    {
      id: '4',
      name: 'Relatório de Ponto',
      category: 'time',
      description: 'Horas trabalhadas, atrasos e ausências',
      lastGenerated: '2024-11-04',
    },
    {
      id: '5',
      name: 'Adesão a Benefícios',
      category: 'benefits',
      description: 'Taxa de adesão e custos com benefícios',
      lastGenerated: '2024-11-01',
    },
    {
      id: '6',
      name: 'Compliance eSocial',
      category: 'compliance',
      description: 'Status de envios e pendências no eSocial',
      lastGenerated: '2024-11-04',
    },
    {
      id: '7',
      name: 'Análise Salarial',
      category: 'payroll',
      description: 'Comparativo de salários por cargo e mercado',
      lastGenerated: '2024-10-20',
    },
    {
      id: '8',
      name: 'Banco de Horas',
      category: 'time',
      description: 'Saldo de horas extras e compensações',
      lastGenerated: '2024-11-03',
    },
  ]

  const categories = [
    { id: 'all', name: 'Todos', icon: ChartBarIcon, color: 'gray' },
    { id: 'hr', name: 'Recursos Humanos', icon: ChartBarIcon, color: 'blue' },
    { id: 'payroll', name: 'Folha de Pagamento', icon: ChartBarIcon, color: 'green' },
    { id: 'time', name: 'Ponto', icon: ChartBarIcon, color: 'purple' },
    { id: 'benefits', name: 'Benefícios', icon: ChartBarIcon, color: 'pink' },
    { id: 'compliance', name: 'Compliance', icon: ChartBarIcon, color: 'orange' },
  ]

  const filteredReports = selectedCategory === 'all'
    ? reports
    : reports.filter(r => r.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    const colors = {
      hr: 'text-blue-600 bg-blue-50',
      payroll: 'text-green-600 bg-green-50',
      time: 'text-purple-600 bg-purple-50',
      benefits: 'text-pink-600 bg-pink-50',
      compliance: 'text-orange-600 bg-orange-50',
    }
    return colors[category] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Relatórios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gere e agende relatórios personalizados
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
          <Button variant="secondary">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Agendar Relatório
          </Button>
          <Button>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
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
                <DocumentArrowDownIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gerados Este Mês
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    24
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
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Agendamentos Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    8
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
                <ChartBarIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Última Atualização
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    Hoje
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(report.category)}`}>
                  <ChartBarIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {report.description}
              </p>
              {report.lastGenerated && (
                <p className="text-xs text-gray-400 mb-4">
                  Última geração: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                </p>
              )}
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  Gerar Agora
                </Button>
                <Button size="sm" variant="secondary">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum relatório encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecione outra categoria ou crie um novo relatório.
          </p>
        </div>
      )}
    </div>
  )
}
