'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/lib/api'

export function MFASetup() {
  const [step, setStep] = useState<'password' | 'qr' | 'verify'>('password')
  const [password, setPassword] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response: any = await apiClient.enableMFA()
      setQrCode(response?.qrCode || '')
      setSecret(response?.secret || '')
      setStep('qr')
    } catch (error) {
      console.error('MFA setup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.verifyMFA(verifyCode)
      setStep('verify')
      // Refresh user state
    } catch (error) {
      console.error('MFA verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Configurar Autenticação de Dois Fatores</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirme sua senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Configurando...' : 'Continuar'}
            </Button>
          </form>
        )}

        {step === 'qr' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code com seu app autenticador
              </p>
              <img src={qrCode} alt="QR Code" className="mx-auto" />
              <p className="text-xs text-gray-500 mt-2">
                Chave manual: {secret}
              </p>
            </div>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Código de verificação
                </label>
                <Input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verificando...' : 'Verificar e Ativar'}
              </Button>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              ✓ MFA configurado com sucesso!
            </div>
            <p className="text-sm text-gray-600">
              Sua conta agora está protegida com autenticação de dois fatores.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}