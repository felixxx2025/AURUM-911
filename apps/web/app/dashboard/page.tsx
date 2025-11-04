'use client'

import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

const stats = [
  { name: 'Colaboradores Ativos', value: '1,247', change: '+12%', changeType: 'positive', icon: UsersIcon },
  { name: 'Folha de Pagamento MTD', value: 'R$ 2.4M', change: '+4.2%', changeType: 'positive', icon: CurrencyDollarIcon },
  { name: 'Turnover (12m)', value: '8.2%', change: '-2.1%', changeType: 'negative', icon: ChartBarIcon },
  { name: 'Time-to-hire', value: '18 dias', change: '-3 dias', changeType: 'positive', icon: ClockIcon },
]

const recentActivities = [
  { id: 1, type: 'payroll', message: 'Folha de outubro processada', time: '2h atrás' },
  { id: 2, type: 'hire', message: 'João Silva contratado - Desenvolvedor', time: '4h atrás' },
  { id: 3, type: 'benefit', message: '15 adesões ao plano de saúde', time: '6h atrás' },
  { id: 4, type: 'compliance', message: 'eSocial enviado com sucesso', time: '1d atrás' },
]

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Visão geral da sua empresa</p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Evolução da Folha de Pagamento
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico será implementado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Atividades Recentes
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="ghost" className="bg-white p-6 h-auto flex-col items-start shadow hover:shadow-md">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-medium text-gray-900">Processar Folha</h4>
            <p className="text-sm text-gray-500 mt-1">Iniciar processamento mensal</p>
          </Button>
          
          <Button variant="ghost" className="bg-white p-6 h-auto flex-col items-start shadow hover:shadow-md">
            <UsersIcon className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-medium text-gray-900">Adicionar Colaborador</h4>
            <p className="text-sm text-gray-500 mt-1">Cadastrar novo funcionário</p>
          </Button>
          
          <Button variant="ghost" className="bg-white p-6 h-auto flex-col items-start shadow hover:shadow-md">
            <ClockIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h4 className="font-medium text-gray-900">Relatório de Ponto</h4>
            <p className="text-sm text-gray-500 mt-1">Visualizar frequência</p>
          </Button>
          
          <Button variant="ghost" className="bg-white p-6 h-auto flex-col items-start shadow hover:shadow-md">
            <ChartBarIcon className="h-8 w-8 text-orange-600 mb-3" />
            <h4 className="font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-500 mt-1">Dashboards personalizados</p>
          </Button>
        </div>
      </div>
    </div>
  )
}