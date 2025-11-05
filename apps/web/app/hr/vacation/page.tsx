// @ts-nocheck
'use client'

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  SunIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Vacation {
  id: string
  employeeName: string
  department: string
  startDate: string
  endDate: string
  days: number
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed'
  requestDate: string
  approver?: string
  type: 'annual' | 'collective' | 'medical'
}

const mockVacations: Vacation[] = [
  {
    id: '1',
    employeeName: 'Ana Silva',
    department: 'Tecnologia',
    startDate: '2025-12-20',
    endDate: '2026-01-05',
    days: 15,
    status: 'approved',
    requestDate: '2025-10-15',
    approver: 'Carlos Mendes',
    type: 'annual',
  },
  {
    id: '2',
    employeeName: 'Roberto Lima',
    department: 'Vendas',
    startDate: '2025-11-15',
    endDate: '2025-11-30',
    days: 15,
    status: 'pending',
    requestDate: '2025-11-01',
    type: 'annual',
  },
  {
    id: '3',
    employeeName: 'Maria Oliveira',
    department: 'Marketing',
    startDate: '2025-11-10',
    endDate: '2025-11-24',
    days: 14,
    status: 'in-progress',
    requestDate: '2025-10-05',
    approver: 'Paulo Silva',
    type: 'annual',
  },
  {
    id: '4',
    employeeName: 'João Santos',
    department: 'Produto',
    startDate: '2025-12-23',
    endDate: '2025-12-30',
    days: 7,
    status: 'approved',
    requestDate: '2025-10-20',
    approver: 'Ana Paula Santos',
    type: 'collective',
  },
  {
    id: '5',
    employeeName: 'Fernanda Costa',
    department: 'RH',
    startDate: '2025-11-08',
    endDate: '2025-11-12',
    days: 5,
    status: 'rejected',
    requestDate: '2025-11-03',
    approver: 'Carlos Mendes',
    type: 'annual',
  },
]

const statusLabels = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  'in-progress': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
}

const typeLabels = {
  annual: { label: 'Anual', color: 'bg-purple-100 text-purple-800' },
  collective: { label: 'Coletivo', color: 'bg-indigo-100 text-indigo-800' },
  medical: { label: 'Médico', color: 'bg-pink-100 text-pink-800' },
}

export default function VacationPage() {
  const [vacations] = useState<Vacation[]>(mockVacations)

  const pendingRequests = vacations.filter((v) => v.status === 'pending').length
  const approvedVacations = vacations.filter((v) => v.status === 'approved').length
  const inProgressVacations = vacations.filter((v) => v.status === 'in-progress').length
  const totalDays = vacations
    .filter((v) => v.status === 'approved' || v.status === 'in-progress')
    .reduce((sum, v) => sum + v.days, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Gestão de Férias
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie solicitações de férias e acompanhe períodos de ausência
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Solicitar Férias
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Solicitações Pendentes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {pendingRequests}
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
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Férias Aprovadas
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {approvedVacations}
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
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Em Férias Agora
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {inProgressVacations}
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
                <SunIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Dias
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalDays}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacations Table */}
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
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Término
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Dias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Aprovador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Data da Solicitação
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vacations.map((vacation) => (
                    <tr key={vacation.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {vacation.employeeName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {vacation.department}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            typeLabels[vacation.type].color
                          }`}
                        >
                          {typeLabels[vacation.type].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(vacation.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(vacation.endDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {vacation.days}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[vacation.status].color
                          }`}
                        >
                          {statusLabels[vacation.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {vacation.approver || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(vacation.requestDate).toLocaleDateString('pt-BR')}
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
