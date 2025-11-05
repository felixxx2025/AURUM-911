// @ts-nocheck
'use client'

import {
  ChartBarIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface PerformanceReview {
  id: string
  employeeName: string
  department: string
  position: string
  reviewPeriod: string
  reviewDate: string
  overallScore: number
  status: 'pending' | 'in-progress' | 'completed' | 'approved'
  reviewer: string
  categories: {
    technical: number
    communication: number
    leadership: number
    productivity: number
  }
}

const mockReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeName: 'Ana Silva',
    department: 'Tecnologia',
    position: 'Desenvolvedora Sênior',
    reviewPeriod: '2º Semestre 2025',
    reviewDate: '2025-11-01',
    overallScore: 4.5,
    status: 'completed',
    reviewer: 'Carlos Mendes',
    categories: {
      technical: 4.8,
      communication: 4.2,
      leadership: 4.5,
      productivity: 4.6,
    },
  },
  {
    id: '2',
    employeeName: 'Roberto Lima',
    department: 'Vendas',
    position: 'Gerente de Vendas',
    reviewPeriod: '2º Semestre 2025',
    reviewDate: '2025-11-05',
    overallScore: 4.2,
    status: 'in-progress',
    reviewer: 'Fernanda Costa',
    categories: {
      technical: 3.8,
      communication: 4.7,
      leadership: 4.5,
      productivity: 3.9,
    },
  },
  {
    id: '3',
    employeeName: 'Maria Oliveira',
    department: 'Marketing',
    position: 'Analista de Marketing',
    reviewPeriod: '2º Semestre 2025',
    reviewDate: '2025-11-10',
    overallScore: 0,
    status: 'pending',
    reviewer: 'Paulo Silva',
    categories: {
      technical: 0,
      communication: 0,
      leadership: 0,
      productivity: 0,
    },
  },
  {
    id: '4',
    employeeName: 'João Santos',
    department: 'Produto',
    position: 'Product Manager',
    reviewPeriod: '2º Semestre 2025',
    reviewDate: '2025-10-28',
    overallScore: 4.7,
    status: 'approved',
    reviewer: 'Ana Paula Santos',
    categories: {
      technical: 4.5,
      communication: 4.9,
      leadership: 4.8,
      productivity: 4.6,
    },
  },
]

const statusLabels = {
  pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-800' },
  'in-progress': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
  approved: { label: 'Aprovada', color: 'bg-purple-100 text-purple-800' },
}

export default function PerformancePage() {
  const [reviews] = useState<PerformanceReview[]>(mockReviews)

  const completedReviews = reviews.filter((r) => r.status === 'completed' || r.status === 'approved').length
  const avgScore = reviews
    .filter((r) => r.overallScore > 0)
    .reduce((sum, r) => sum + r.overallScore, 0) / reviews.filter((r) => r.overallScore > 0).length
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Avaliações de Desempenho
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie avaliações e acompanhe o desempenho dos colaboradores
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <StarIcon className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avaliações Concluídas
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedReviews}
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
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Nota Média
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {avgScore.toFixed(1)}
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
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendentes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {pendingReviews}
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
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Avaliações
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {reviews.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Avaliador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Nota Geral
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Data
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {review.employeeName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {review.position}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {review.department}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {review.reviewPeriod}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {review.reviewer}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`font-semibold ${getScoreColor(review.overallScore)}`}>
                          {review.overallScore > 0 ? review.overallScore.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[review.status].color
                          }`}
                        >
                          {statusLabels[review.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
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
