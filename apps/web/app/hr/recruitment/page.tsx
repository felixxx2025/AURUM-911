// @ts-nocheck
'use client'

import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  status: 'open' | 'in-progress' | 'closed'
  candidates: number
  hiredCount: number
  createdAt: string
}

const mockJobOpenings: JobOpening[] = [
  {
    id: '1',
    title: 'Desenvolvedor Full Stack Sênior',
    department: 'Tecnologia',
    location: 'São Paulo - SP',
    type: 'full-time',
    status: 'open',
    candidates: 45,
    hiredCount: 0,
    createdAt: '2025-10-15',
  },
  {
    id: '2',
    title: 'Gerente de Produto',
    department: 'Produto',
    location: 'Remoto',
    type: 'full-time',
    status: 'in-progress',
    candidates: 32,
    hiredCount: 0,
    createdAt: '2025-10-10',
  },
  {
    id: '3',
    title: 'Analista de Marketing Digital',
    department: 'Marketing',
    location: 'Rio de Janeiro - RJ',
    type: 'full-time',
    status: 'open',
    candidates: 28,
    hiredCount: 0,
    createdAt: '2025-10-20',
  },
  {
    id: '4',
    title: 'Designer UX/UI',
    department: 'Design',
    location: 'São Paulo - SP',
    type: 'full-time',
    status: 'closed',
    candidates: 56,
    hiredCount: 2,
    createdAt: '2025-09-05',
  },
]

const statusLabels = {
  open: { label: 'Aberta', color: 'bg-green-100 text-green-800' },
  'in-progress': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Fechada', color: 'bg-gray-100 text-gray-800' },
}

const typeLabels = {
  'full-time': 'Tempo Integral',
  'part-time': 'Meio Período',
  contract: 'Contrato',
}

export default function RecruitmentPage() {
  const [jobOpenings] = useState<JobOpening[]>(mockJobOpenings)

  const openPositions = jobOpenings.filter((job) => job.status === 'open').length
  const totalCandidates = jobOpenings.reduce((sum, job) => sum + job.candidates, 0)
  const avgTimeToHire = 18 // dias

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Recrutamento e Seleção
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie vagas e acompanhe o processo seletivo
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button>
            <BriefcaseIcon className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vagas Abertas
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {openPositions}
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
                    Candidatos Ativos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalCandidates}
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
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Time-to-Hire
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {avgTimeToHire} dias
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
                    Contratações (Mês)
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Openings Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Candidatos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Contratados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Data de Abertura
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jobOpenings.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {job.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {job.department}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {typeLabels[job.type]}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[job.status].color
                          }`}
                        >
                          {statusLabels[job.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {job.candidates}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {job.hiredCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button variant="ghost" size="sm">
                          Ver Candidatos
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
