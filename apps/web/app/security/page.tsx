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
  const [authState, setAuthState] = useState(authManager.getState())
  const [showMFASetup, setShowMFASetup] = useState(false)

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user)
      setAuthState(state)
    })
    return unsubscribe
  }, [])

  const formatSessionExpiry = () => {
    if (!authState.sessionExpiry) return 'N/A'
    const expiryDate = new Date(authState.sessionExpiry)
    const now = new Date()
    const diffMs = expiryDate.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Expirado'
    
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''}`
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`
    return `${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  }

  const getBrowserInfo = () => {
    if (typeof window === 'undefined') return 'N/A'
    const ua = window.navigator.userAgent
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
    if (ua.includes('Edg')) return 'Edge'
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
    
    return 'Outro'
  }

  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'N/A'
    const ua = window.navigator.userAgent
    
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) return 'Mobile'
    if (/Tablet/i.test(ua)) return 'Tablet'
    return 'Desktop'
  }

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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">Sessão Atual</div>
                  <Badge variant="default">Ativa</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Último acesso:</span>
                    <div className="text-gray-900">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Agora'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 font-medium">Expira em:</span>
                    <div className="text-gray-900">{formatSessionExpiry()}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 font-medium">Navegador:</span>
                    <div className="text-gray-900">{getBrowserInfo()}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 font-medium">Dispositivo:</span>
                    <div className="text-gray-900">{getDeviceType()}</div>
                  </div>
                  
                  {authState.tenantId && (
                    <div>
                      <span className="text-gray-600 font-medium">Organização:</span>
                      <div className="text-gray-900 truncate">{authState.tenantId}</div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-600 font-medium">Status de segurança:</span>
                    <div className="text-gray-900">
                      {user?.mfaEnabled ? '🔒 MFA Ativado' : '⚠️ MFA Desativado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              💡 Dica: Ative a autenticação de dois fatores para maior segurança
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}