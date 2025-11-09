// @ts-nocheck
'use client'

import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'

interface TimeEntry {
  id: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  lunchOut?: string
  lunchIn?: string
  totalHours: number
  location: string
  status: 'present' | 'late' | 'absent' | 'remote'
}

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeName: 'Ana Silva',
    date: '2025-11-05',
    checkIn: '08:00',
    checkOut: '18:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    totalHours: 9,
    location: 'Escritório',
    status: 'present',
  },
  {
    id: '2',
    employeeName: 'Carlos Santos',
    date: '2025-11-05',
    checkIn: '08:15',
    checkOut: '18:05',
    lunchOut: '12:10',
    lunchIn: '13:00',
    totalHours: 8.83,
    location: 'Escritório',
    status: 'late',
  },
  {
    id: '3',
    employeeName: 'Maria Oliveira',
    date: '2025-11-05',
    checkIn: '09:00',
    checkOut: '18:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    totalHours: 8,
    location: 'Remoto',
    status: 'remote',
  },
]

const statusLabels = {
  present: { label: 'Presente', color: 'bg-green-100 text-green-800' },
  late: { label: 'Atraso', color: 'bg-yellow-100 text-yellow-800' },
  absent: { label: 'Ausente', color: 'bg-red-100 text-red-800' },
  remote: { label: 'Remoto', color: 'bg-blue-100 text-blue-800' },
}

export default function TimePage() {
  const [timeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Controle de Ponto
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Acompanhe a frequência e horas trabalhadas dos colaboradores
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex space-x-3">
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <ClockIcon className="h-4 w-4 mr-2" />
            Registrar Ponto Manual
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Presentes Hoje
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">1,189</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Atrasos
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">23</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remoto
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">456</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ausentes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">35</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mt-6 flex items-center space-x-4">
        <label htmlFor="date" className="text-sm font-medium text-gray-700">
          Data:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Time Entries Table */}
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Saída Almoço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Retorno Almoço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Saída
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Total de Horas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Local
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {entry.employeeName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusLabels[entry.status].color
                          }`}
                        >
                          {statusLabels[entry.status].label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {entry.checkIn}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {entry.lunchOut || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {entry.lunchIn || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {entry.checkOut}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {entry.totalHours.toFixed(2)}h
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {entry.location}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button variant="ghost" size="sm">
                          Editar
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
