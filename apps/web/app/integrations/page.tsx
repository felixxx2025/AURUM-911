"use client"

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/api'

type SerproValidateCpfResult = {
  valid: boolean
  status?: string
  error?: string
  [key: string]: unknown
}

type HrAssistantResponse = {
  response: string
}

export default function IntegrationsPage() {
  const [cpfValidation, setCpfValidation] = useState('')
  const [cpfResult, setCpfResult] = useState<SerproValidateCpfResult | null>(null)
  const [hrQuestion, setHrQuestion] = useState('')
  const [hrResponse, setHrResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const validateCPF = async () => {
    const cpf = cpfValidation.trim()
    if (!cpf) return

    setLoading(true)
    try {
      const result = await apiClient.request<SerproValidateCpfResult>('/api/v1/integrations/serpro/validate-cpf', {
        method: 'POST',
        body: JSON.stringify({ cpf })
      })
      setCpfResult(result)
    } catch (error) {
      // Log resumido (inclui erro para facilitar diagnóstico, sem dados sensíveis)
      // eslint-disable-next-line no-console
      console.error('Erro ao validar CPF', error)
      setCpfResult({ valid: false, error: 'Erro na validação' })
    } finally {
      setLoading(false)
    }
  }

  const askHRAssistant = async () => {
    const question = hrQuestion.trim()
    if (!question) return

    setLoading(true)
    try {
      const result = await apiClient.request<HrAssistantResponse>('/api/v1/integrations/openai/hr-assistant', {
        method: 'POST',
        body: JSON.stringify({ question })
      })
      setHrResponse(result.response)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro no assistente', error)
      setHrResponse('Erro ao processar pergunta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
        <p className="mt-2 text-gray-600">Conecte-se com parceiros e serviços externos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏛️ SERPRO - Validação CPF</h3>
          <div className="space-y-4">
            <Input
              label="CPF para validação"
              value={cpfValidation}
              onChange={(e) => setCpfValidation(e.target.value)}
              placeholder="12345678901"
              maxLength={11}
            />
            <Button onClick={validateCPF} loading={loading} disabled={!cpfValidation.trim()}>
              Validar CPF
            </Button>

            {cpfResult && (
              <div
                className={`p-4 rounded-md ${
                  cpfResult.valid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <h4 className="font-medium">Resultado:</h4>
                <pre className="text-sm mt-2">{JSON.stringify(cpfResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 Assistente de RH (IA)</h3>
          <div className="space-y-4">
            <Input
              label="Pergunta sobre RH"
              value={hrQuestion}
              onChange={(e) => setHrQuestion(e.target.value)}
              placeholder="Como calcular férias proporcionais?"
            />
            <Button onClick={askHRAssistant} loading={loading} disabled={!hrQuestion.trim()}>
              Perguntar
            </Button>

            {hrResponse && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium mb-2">Resposta:</h4>
                <p className="text-sm whitespace-pre-wrap">{hrResponse}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Kenoby - Recrutamento</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Sincronize vagas e candidatos do Kenoby ATS</p>
            <div className="flex space-x-2">
              <Button variant="secondary">Sincronizar Vagas</Button>
              <Button variant="secondary">Importar Contratados</Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📋 eSocial - Governo</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Envio automático de eventos trabalhistas</p>
            <div className="flex space-x-2">
              <Button variant="secondary">Enviar Admissões</Button>
              <Button variant="secondary">Consultar Status</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Integrações</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium">SERPRO</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium">Kenoby</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Config</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium">eSocial</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inativo</span>
          </div>
        </div>
      </div>
    </div>
  )
}