// @ts-nocheck
'use client'

import {
  CreditCardIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface Benefit {
  id: string
  name: string
  type: 'health' | 'dental' | 'meal' | 'transportation' | 'gym' | 'life-insurance'
  provider: string
  enrolledCount: number
  totalEmployees: number
  monthlyCostPerEmployee: number
  status: 'active' | 'pending' | 'inactive'
}

const mockBenefits: Benefit[] = [
  {
    id: '1',
    name: 'Plano de Saúde',
    type: 'health',
    provider: 'Unimed',
    enrolledCount: 1089,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 45000,
    status: 'active',
  },
  {
    id: '2',
    name: 'Plano Odontológico',
    type: 'dental',
    provider: 'OdontoPrev',
    enrolledCount: 892,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 8500,
    status: 'active',
  },
  {
    id: '3',
    name: 'Vale Refeição',
    type: 'meal',
    provider: 'Alelo',
    enrolledCount: 1247,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 66000,
    status: 'active',
  },
  {
    id: '4',
    name: 'Vale Transporte',
    type: 'transportation',
    provider: 'VR',
    enrolledCount: 756,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 22000,
    status: 'active',
  },
  {
    id: '5',
    name: 'Academia',
    type: 'gym',
    provider: 'Gympass',
    enrolledCount: 423,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 7900,
    status: 'active',
  },
  {
    id: '6',
    name: 'Seguro de Vida',
    type: 'life-insurance',
    provider: 'MetLife',
    enrolledCount: 1247,
    totalEmployees: 1247,
    monthlyCostPerEmployee: 3500,
    status: 'active',
  },
]

const statusLabels = {
  active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
}

const typeIcons = {
  health: HeartIcon,
  dental: ShieldCheckIcon,
  meal: CreditCardIcon,
  transportation: CreditCardIcon,
  gym: UserGroupIcon,
  'life-insurance': ShieldCheckIcon,
}

export default function BenefitsPage() {
  const [benefits] = useState<Benefit[]>(mockBenefits)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const totalMonthlyCost = benefits.reduce(
    (sum, benefit) => sum + benefit.enrolledCount * benefit.monthlyCostPerEmployee,
    0
  )

  const avgEnrollmentRate =
    (benefits.reduce(
      (sum, benefit) => sum + (benefit.enrolledCount / benefit.totalEmployees) * 100,
      0
    ) /
      benefits.length)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Benefícios
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os benefícios oferecidos aos colaboradores
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <HeartIcon className="h-4 w-4 mr-2" />
            Adicionar Benefício
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Benefícios Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {benefits.filter((b) => b.status === 'active').length}
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
                <CreditCardIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Custo Mensal Total
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalMonthlyCost)}
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
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Adesão Média
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {avgEnrollmentRate.toFixed(1)}%
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
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Colaboradores
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">1,247</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Benefício
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Fornecedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Adesões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Taxa de Adesão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Custo Mensal/Pessoa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Custo Total
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {benefits.map((benefit) => {
                    const Icon = typeIcons[benefit.type] || HeartIcon
                    const enrollmentRate =
                      (benefit.enrolledCount / benefit.totalEmployees) * 100
                    const totalCost =
                      benefit.enrolledCount * benefit.monthlyCostPerEmployee

                    return (
                      <tr key={benefit.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">
                              {benefit.name}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {benefit.provider}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              statusLabels[benefit.status].color
                            }`}
                          >
                            {statusLabels[benefit.status].label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {benefit.enrolledCount} / {benefit.totalEmployees}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {enrollmentRate.toFixed(1)}%
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatCurrency(benefit.monthlyCostPerEmployee)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatCurrency(totalCost)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Button variant="ghost" size="sm">
                            Gerenciar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
