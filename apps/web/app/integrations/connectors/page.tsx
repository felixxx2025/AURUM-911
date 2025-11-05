// @ts-nocheck
'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

async function hmacSHA256(key: string, data: string) {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ConnectorsPage() {
  const [provider, setProvider] = useState('clicksign')
  const [secret, setSecret] = useState('changeme')
  const [logs, setLogs] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'webhooks'|'esign'|'pix'|'openfinance'>('webhooks')
  const [stats, setStats] = useState<any | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [esignId, setEsignId] = useState<string>('')
  const [esignStatus, setEsignStatus] = useState<any | null>(null)
  const [pixStatus, setPixStatus] = useState<any | null>(null)
  const [consentId, setConsentId] = useState<string>('')
  const [consentStatus, setConsentStatus] = useState<any | null>(null)

  const payload = useMemo(() => ({
    type: 'test.event',
    id: 'evt-' + Math.random().toString(36).slice(2,8),
    data: { hello: 'world' }
  }), [])

  const sendTest = async () => {
    setSending(true)
    try {
      const ts = Math.floor(Date.now()/1000).toString()
      const base = `${ts}.${JSON.stringify(payload)}`
      const v1 = await hmacSHA256(secret, base)
      const sig = `t=${ts},v1=${v1}`
      const res = await fetch(`/integrations/webhooks/${provider}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-aurum-signature': sig },
        body: JSON.stringify(payload)
      })
      await res.json()
      await fetchLogs()
    } finally {
      setSending(false)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/integrations/webhooks/logs?provider=${provider}&limit=50`)
      const data = await res.json()
      setLogs(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/integrations/webhooks/stats')
      const data = await res.json()
      setStats(data || null)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [provider])
  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Conectores</h1>
        <p className="text-gray-600">Aba de testes com Webhooks, E‑signature (Clicksign), PIX (Stripe) e Open Finance (Belvo).</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {[
          { id: 'webhooks', label: 'Webhooks' },
          { id: 'esign', label: 'Piloto E‑sign (Clicksign)' },
          { id: 'pix', label: 'Piloto PIX (Stripe)' },
          { id: 'openfinance', label: 'Open Finance (Belvo)' },
        ].map(t => (
          <button key={t.id} className={`px-3 py-2 text-sm border-b-2 ${activeTab===t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600'}`} onClick={()=>setActiveTab(t.id as any)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const providers = stats?.providers || {}
              const totals = Object.values(providers).reduce((acc: any, p: any) => ({
                total: acc.total + (p.total || 0),
                verified: acc.verified + (p.verified || 0),
                unverified: acc.unverified + (p.unverified || 0),
              }), { total: 0, verified: 0, unverified: 0 })
              const cards = [
                { label: 'Eventos totais', value: totals.total },
                { label: 'Verificados', value: totals.verified },
                { label: 'Não verificados', value: totals.unverified },
                { label: 'Providers ativos', value: Object.keys(providers).length },
              ]
              return cards.map((c) => (
                <div key={c.label} className="bg-white shadow rounded-lg p-4">
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{statsLoading ? '...' : c.value}</div>
                </div>
              ))
            })()}
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Provider" value={provider} onChange={(e)=>setProvider(e.target.value)} placeholder="ex: clicksign, stripe, belvo, idwall" />
              <Input label="Webhook Secret (local)" value={secret} onChange={(e)=>setSecret(e.target.value)} placeholder="segredo para assinar payload" />
            </div>
            <div className="flex gap-2">
              <Button onClick={sendTest} loading={sending}>Enviar teste</Button>
              <Button variant="secondary" onClick={fetchLogs} loading={loading}>Atualizar logs</Button>
              <Button variant="secondary" onClick={fetchStats} loading={statsLoading}>Atualizar KPIs</Button>
            </div>
          </div>

          {/* Stats by provider table */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">KPIs por provider</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Verificados</th>
                    <th className="py-2 pr-4">Não verificados</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats?.providers || {}).map(([prov, p]: any) => (
                    <tr key={prov} className="border-t">
                      <td className="py-2 pr-4 font-mono">{prov}</td>
                      <td className="py-2 pr-4">{p.total}</td>
                      <td className="py-2 pr-4">{p.verified}</td>
                      <td className="py-2 pr-4">{p.unverified}</td>
                    </tr>
                  ))}
                  {Object.keys(stats?.providers || {}).length === 0 && (
                    <tr className="border-t"><td className="py-3 text-gray-500" colSpan={4}>Sem dados ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logs recebidos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Quando</th>
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Verificado</th>
                    <th className="py-2 pr-4">Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="py-2 pr-4 font-mono">{l.id}</td>
                      <td className="py-2 pr-4">{new Date(l.receivedAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{l.provider}</td>
                      <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${l.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{String(l.verified)}</span></td>
                      <td className="py-2 pr-4 truncate max-w-[240px] font-mono">{l.signature || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'esign' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Piloto E‑sign (Clicksign)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Document ID" value={esignId} onChange={(e)=>setEsignId(e.target.value)} placeholder="doc-123" />
          </div>
          <div className="flex gap-2">
            <Button onClick={async ()=>{
              const res = await fetch('/pilot/e-sign/clicksign/start', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ documentId: esignId || 'doc-sample' }) })
              const d = await res.json(); setEsignStatus(d)
            }}>Iniciar assinatura</Button>
            <Button variant="secondary" onClick={async ()=>{
              if (!esignStatus?.id) return
              const res = await fetch(`/pilot/e-sign/clicksign/${esignStatus.id}/status`)
              const d = await res.json(); setEsignStatus(d)
            }}>Atualizar status</Button>
          </div>
          {esignStatus && (
            <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto">{JSON.stringify(esignStatus, null, 2)}</pre>
          )}
        </div>
      )}

      {activeTab === 'pix' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Piloto PIX (Stripe)</h3>
          <div className="flex gap-2">
            <Button onClick={async ()=>{
              const res = await fetch('/pilot/payments/stripe/pix-charge', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ amount: 101, currency: 'BRL' }) })
              const d = await res.json(); setPixStatus(d)
            }}>Criar cobrança PIX</Button>
            <Button variant="secondary" onClick={async ()=>{
              if (!pixStatus?.id) return
              const res = await fetch(`/pilot/payments/charge/${pixStatus.id}`)
              const d = await res.json(); setPixStatus(d)
            }}>Atualizar status</Button>
          </div>
          {pixStatus && (
            <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto">{JSON.stringify(pixStatus, null, 2)}</pre>
          )}
        </div>
      )}

      {activeTab === 'openfinance' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Open Finance (Belvo)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="User ID" value={consentId} onChange={(e)=>setConsentId(e.target.value)} placeholder="user-123" />
          </div>
          <div className="flex gap-2">
            <Button onClick={async ()=>{
              const res = await fetch('/pilot/open-finance/belvo/consent', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ userId: consentId || 'user-sample' }) })
              const d = await res.json(); setConsentStatus(d)
            }}>Criar consentimento</Button>
            <Button variant="secondary" onClick={async ()=>{
              if (!consentStatus?.id) return
              const res = await fetch(`/pilot/open-finance/consent/${consentStatus.id}`)
              const d = await res.json(); setConsentStatus(d)
            }}>Atualizar status</Button>
          </div>
          {consentStatus && (
            <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto">{JSON.stringify(consentStatus, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}
