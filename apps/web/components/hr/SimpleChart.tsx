// @ts-nocheck
'use client'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  title?: string
  type?: 'bar' | 'line'
  maxValue?: number
}

export function SimpleChart({
  data,
  title,
  type = 'bar',
  maxValue,
}: SimpleChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value))

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      {type === 'bar' && (
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100
            const colorClass = item.color || colors[index % colors.length]

            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${colorClass} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {type === 'line' && (
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100
            const colorClass = item.color || colors[index % colors.length]

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <span className="text-xs font-semibold text-gray-900 mb-1">
                    {item.value}
                  </span>
                  <div
                    className={`w-full ${colorClass} rounded-t transition-all duration-500`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2 text-center">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
