// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'

import { MFASetup } from '../../components/MFASetup'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { authManager } from '../../lib/auth'

export default function SecurityPage() {
  const [user, setUser] = useState(authManager.getState().user)
  const [showMFASetup, setShowMFASetup] = useState(false)

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleDisableMFA = async () => {
    const password = prompt('Digite sua senha para desativar MFA:')
    if (password) {
      try {
        await authManager.disableMFA(password)
        alert('MFA desativado com sucesso')
      } catch (_) {
        alert('Erro ao desativar MFA')
      }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Configurações de Segurança</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Autenticação de Dois Fatores (MFA)
            <Badge variant={user?.mfaEnabled ? 'default' : 'secondary'}>
              {user?.mfaEnabled ? 'Ativado' : 'Desativado'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Adicione uma camada extra de segurança à sua conta.
          </p>
          
          {!user?.mfaEnabled ? (
            <div>
              {!showMFASetup ? (
                <Button onClick={() => setShowMFASetup(true)}>
                  Configurar MFA
                </Button>
              ) : (
                <MFASetup />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>MFA está ativo em sua conta</span>
              </div>
              <Button variant="outline" onClick={handleDisableMFA}>
                Desativar MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">Sessão Atual</div>
              <div className="text-sm text-gray-500">
                Último acesso: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Agora'}
              </div>
            </div>
            <Badge variant="default">Ativa</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}