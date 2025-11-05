// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'

import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { apiClient } from '../../lib/api'

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState('dashboard')

  useEffect(() => {
    loadInsights()
  }, [selectedInsight])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get(`/api/v1/ai/insights/${selectedInsight}`)
      setInsights(data)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando insights de IA...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insights de IA</h1>
        <div className="flex space-x-2">
          <Button 
            variant={selectedInsight === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setSelectedInsight('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant={selectedInsight === 'turnover' ? 'default' : 'outline'}
            onClick={() => setSelectedInsight('turnover')}
          >
            Turnover
          </Button>
          <Button 
            variant={selectedInsight === 'performance' ? 'default' : 'outline'}
            onClick={() => setSelectedInsight('performance')}
          >
            Performance
          </Button>
        </div>
      </div>

      {selectedInsight === 'dashboard' && insights?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risco de Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {insights.summary.turnoverRisk.toFixed(1)}%
              </div>
              <p className="text-gray-600">Funcionários em risco</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendência de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={insights.summary.performanceTrend === 'improving' ? 'default' : 'destructive'}>
                {insights.summary.performanceTrend === 'improving' ? 'Melhorando' : 'Declinando'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajustes Salariais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.summary.salaryAdjustments}
              </div>
              <p className="text-gray-600">Funcionários elegíveis</p>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedInsight !== 'dashboard' && insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {insights.type === 'turnover' && 'Previsão de Turnover'}
              {insights.type === 'performance' && 'Análise de Performance'}
              <Badge variant="outline">
                Confiança: {(insights.confidence * 100).toFixed(0)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Fatores Considerados</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.factors.map((factor, index) => (
                    <Badge key={index} variant="secondary">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recomendações</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}