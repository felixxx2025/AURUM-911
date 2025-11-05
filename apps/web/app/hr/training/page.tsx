// @ts-nocheck
'use client'

import {
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Training {
  id: string
  title: string
  category: 'technical' | 'soft-skills' | 'compliance' | 'leadership'
  instructor: string
  duration: number // em horas
  enrolledCount: number
  capacity: number
  status: 'scheduled' | 'in-progress' | 'completed'
  startDate: string
  completionRate?: number
}

const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Desenvolvimento Web Avançado com React',
    category: 'technical',
    instructor: 'Carlos Mendes',
    duration: 40,
    enrolledCount: 28,
    capacity: 30,
    status: 'in-progress',
    startDate: '2025-11-01',
    completionRate: 65,
  },
  {
    id: '2',
    title: 'Liderança e Gestão de Equipes',
    category: 'leadership',
    instructor: 'Ana Paula Santos',
    duration: 16,
    enrolledCount: 45,
    capacity: 50,
    status: 'scheduled',
    startDate: '2025-11-15',
  },
  {
    id: '3',
    title: 'Comunicação Efetiva no Ambiente Corporativo',
    category: 'soft-skills',
    instructor: 'Roberto Lima',
    duration: 8,
    enrolledCount: 67,
    capacity: 80,
    status: 'scheduled',
    startDate: '2025-11-20',
  },
  {
    id: '4',
    title: 'LGPD e Proteção de Dados',
    category: 'compliance',
    instructor: 'Fernanda Costa',
    duration: 12,
    enrolledCount: 120,
    capacity: 120,
    status: 'completed',
    startDate: '2025-10-01',
    completionRate: 98,
  },
  {
    id: '5',
    title: 'Segurança da Informação',
    category: 'compliance',
    instructor: 'Paulo Silva',
    duration: 20,
    enrolledCount: 85,
    capacity: 100,
    status: 'in-progress',
    startDate: '2025-10-25',
    completionRate: 42,
  },
]

const statusLabels = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
}

const categoryLabels = {
  technical: { label: 'Técnico', color: 'bg-purple-100 text-purple-800' },
  'soft-skills': { label: 'Comportamental', color: 'bg-pink-100 text-pink-800' },
  compliance: { label: 'Compliance', color: 'bg-orange-100 text-orange-800' },
  leadership: { label: 'Liderança', color: 'bg-indigo-100 text-indigo-800' },
}

export default function TrainingPage() {
  const [trainings] = useState<Training[]>(mockTrainings)

  const activeTrainings = trainings.filter((t) => t.status === 'in-progress').length
  const totalEnrolled = trainings.reduce((sum, t) => sum + t.enrolledCount, 0)
  const avgCompletionRate = trainings
    .filter((t) => t.completionRate)
    .reduce((sum, t) => sum + (t.completionRate || 0), 0) / trainings.filter((t) => t.completionRate).length

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Treinamentos e Capacitação
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie treinamentos e acompanhe o desenvolvimento dos colaboradores
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <AcademicCapIcon className="h-4 w-4 mr-2" />
            Novo Treinamento
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Treinamentos Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {activeTrainings}
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
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Colaboradores Inscritos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalEnrolled}
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
                <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Conclusão Média
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {avgCompletionRate.toFixed(0)}%
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
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Horas
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trainings.reduce((sum, t) => sum + t.duration, 0)}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Treinamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Instrutor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Inscritos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Duração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Conclusão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Data de Início
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {trainings.map((training) => (
                    <tr key={training.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {training.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            categoryLabels[training.category].color
                          }`}
                        >
                          {categoryLabels[training.category].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {training.instructor}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[training.status].color
                          }`}
                        >
                          {statusLabels[training.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {training.enrolledCount} / {training.capacity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {training.duration}h
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {training.completionRate ? `${training.completionRate}%` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(training.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button variant="ghost" size="sm">
                          <PlayIcon className="h-4 w-4 mr-1" />
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
