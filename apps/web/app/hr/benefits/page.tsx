// @ts-nocheck
'use client'

import { HeartIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Benefit {
  id: string
  name: string
  category: 'health' | 'food' | 'transport' | 'education' | 'other'
  provider: string
  enrolledEmployees: number
  monthlyCost: number
  status: 'active' | 'inactive'
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulate loading benefits
    setTimeout(() => {
      setBenefits([
        {
          id: '1',
          name: 'Plano de Saúde',
          category: 'health',
          provider: 'Unimed',
          enrolledEmployees: 987,
          monthlyCost: 450000,
          status: 'active',
        },
        {
          id: '2',
          name: 'Vale Refeição',
          category: 'food',
          provider: 'Alelo',
          enrolledEmployees: 1247,
          monthlyCost: 280000,
          status: 'active',
        },
        {
          id: '3',
          name: 'Vale Transporte',
          category: 'transport',
          provider: 'VR',
          enrolledEmployees: 832,
          monthlyCost: 125000,
          status: 'active',
        },
        {
          id: '4',
          name: 'Auxílio Educação',
          category: 'education',
          provider: 'Interno',
          enrolledEmployees: 234,
          monthlyCost: 75000,
          status: 'active',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getCategoryBadge = (category: string) => {
    const styles = {
      health: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      education: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    }
    const labels = {
      health: 'Saúde',
      food: 'Alimentação',
      transport: 'Transporte',
      education: 'Educação',
      other: 'Outros',
    }
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[category]}`}>
        {labels[category]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    }
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
    }
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredBenefits = benefits.filter(benefit =>
    benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    benefit.provider.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCost = benefits.reduce((sum, b) => sum + b.monthlyCost, 0)
  const totalEnrolled = benefits.reduce((sum, b) => sum + b.enrolledEmployees, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Benefícios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os benefícios oferecidos aos colaboradores
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Benefício
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-6 w-6 text-pink-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Benefícios Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {benefits.filter(b => b.status === 'active').length}
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
                <HeartIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Colaboradores Inscritos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalEnrolled.toLocaleString('pt-BR')}
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
                <HeartIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Custo Mensal Total
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                    }).format(totalCost)}
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
                <HeartIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Custo por Colaborador
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(totalCost / 1247)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar benefícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Fornecedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Inscritos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Custo Mensal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBenefits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        Nenhum benefício encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredBenefits.map((benefit) => (
                      <tr key={benefit.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {benefit.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {getCategoryBadge(benefit.category)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {benefit.provider}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {benefit.enrolledEmployees.toLocaleString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(benefit.monthlyCost)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {getStatusBadge(benefit.status)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Button variant="ghost" size="sm">
                            Gerenciar
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
