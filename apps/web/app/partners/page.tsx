"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Copy, Loader2, Plus, RefreshCw, Repeat, RotateCcw, Webhook } from 'lucide-react'
import { useMemo, useState } from 'react'
 
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/Input'
import { apiClient } from '../../lib/api'

function _number(n: unknown) {
  return typeof n === 'number' && !isNaN(n) ? n : 0
}

type LogItem = { id: string; event: string; status: 'queued'|'delivered'|'failed'|string; attempt: number; responseStatus?: number; lastError?: string; timestamp: number; responseBody?: string; payload?: unknown }

function Sparkline({ data }: { data: Array<{ ts: number; delivered: number; failed: number }> }) {
  const width = 800
  const height = 280
  const pad = 28
  const xs = data.map(d => d.ts)
  const ys = data.flatMap(d => [d.delivered, d.failed])
  const minX = xs.length ? Math.min(...xs) : 0
  const maxX = xs.length ? Math.max(...xs) : 1
  const minY = 0
  const maxY = Math.max(1, ys.length ? Math.max(...ys) : 0)
  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2)
  const scaleY = (y: number) => height - pad - ((y - minY) / (maxY - minY || 1)) * (height - pad * 2)
  const pathFor = (key: 'delivered' | 'failed') => data.map(d => `${scaleX(d.ts)},${scaleY(d[key])}`).join(' ')
  const ticks = 5
  const grid: JSX.Element[] = []
  for (let i=0;i<=ticks;i++) {
    const y = pad + ((height - pad*2) * i)/ticks
    grid.push(<line key={`g-${i}`} x1={pad} y1={y} x2={width-pad} y2={y} stroke="#eee" />)
  }
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}
         role="img" aria-label="Entregas por hora">
      <rect x={0} y={0} width={width} height={height} fill="#fff" />
      {grid}
      <polyline points={pathFor('delivered')} fill="none" stroke="#10b981" strokeWidth={2} />
      <polyline points={pathFor('failed')} fill="none" stroke="#ef4444" strokeWidth={2} />
    </svg>
  )
}

export default function PartnersDashboardPage() {
  const qc = useQueryClient()
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [newPartner, setNewPartner] = useState({ name: '', scopes: '*,hr:read,hr:write,partners:read,partners:webhooks,partners:replay,sandbox:manage,sandbox:events' })
  const [newWebhook, setNewWebhook] = useState({ url: '', eventTypes: 'hr.person.created,fin.payment.created' })
  const [lastCreds, setLastCreds] = useState<null | { id: string; clientId: string; clientSecret: string; webhookSecret: string }>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'queued' | 'delivered' | 'failed'>('all')
  const [filterQuery, setFilterQuery] = useState('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [quickRange, setQuickRange] = useState<string>('')

  function fmtLocal(dt: Date) {
    // YYYY-MM-DDTHH:mm em horário local
    const pad = (n:number)=> String(n).padStart(2,'0')
    const y = dt.getFullYear()
    const m = pad(dt.getMonth()+1)
    const d = pad(dt.getDate())
    const hh = pad(dt.getHours())
    const mm = pad(dt.getMinutes())
    return `${y}-${m}-${d}T${hh}:${mm}`
  }

  function applyQuickRange(v: string) {
    setQuickRange(v)
    const now = new Date()
    if (v === '30m') {
      const from = new Date(now.getTime() - 30*60*1000)
      setFromDate(fmtLocal(from)); setToDate(fmtLocal(now)); setPage(0)
    } else if (v === '24h') {
      const from = new Date(now.getTime() - 24*60*60*1000)
      setFromDate(fmtLocal(from)); setToDate(fmtLocal(now)); setPage(0)
    } else if (v === '7d') {
      const from = new Date(now.getTime() - 7*24*60*60*1000)
      setFromDate(fmtLocal(from)); setToDate(fmtLocal(now)); setPage(0)
    } else if (v === 'all') {
      setFromDate(''); setToDate(''); setPage(0)
    }
  }
  const flashCopied = (key: string) => { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1200) }
  const [sandboxType, setSandboxType] = useState('hr.person.created')
  const [sandboxPayload, setSandboxPayload] = useState('')

  const partnersQ = useQuery({
    queryKey: ['partners'],
    queryFn: () => apiClient.listPartners(),
  })

  const selected = useMemo(() => {
    return partnersQ.data?.find(p => p.id === selectedPartner) || null
  }, [partnersQ.data, selectedPartner])

  const [page, setPage] = useState(0)
  const pageSize = 50
  const logsQ = useQuery<{ items: LogItem[]; total: number; limit: number; offset: number }>({
    queryKey: ['partners', selected?.id, 'logs', filterStatus, filterQuery, fromDate, toDate, page],
    queryFn: () => selected ? apiClient.listPartnerLogsPaged(selected.id, {
      status: filterStatus,
      q: filterQuery || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      limit: pageSize,
      offset: page * pageSize,
      sort: 'desc'
    }) : Promise.resolve({ items: [], total: 0, limit: pageSize, offset: 0 }),
    enabled: !!selected?.id,
  })
  const [detailLog, setDetailLog] = useState<LogItem | null>(null)

  const webhooksQ = useQuery({
    queryKey: ['partners', selected?.id, 'webhooks'],
    queryFn: () => selected ? apiClient.listWebhooks(selected.id) : Promise.resolve([]),
    enabled: !!selected?.id,
  })

  const catalogQ = useQuery({
    queryKey: ['webhooks','catalog'],
    queryFn: () => apiClient.getWebhookCatalog(),
  })

  const createPartnerM = useMutation({
    mutationFn: () => apiClient.createPartner({ name: newPartner.name, scopes: newPartner.scopes.split(',').map(s => s.trim()).filter(Boolean) }),
    onSuccess: async (data: any) => {
      setNewPartner({ name: '', scopes: newPartner.scopes })
      setSelectedPartner(data.id)
      setLastCreds({ id: data.id, clientId: data.clientId, clientSecret: data.clientSecret, webhookSecret: data.webhookSecret })
      await qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })

  const rotateCredsM = useMutation({
    mutationFn: (id: string) => apiClient.rotatePartnerCredentials(id),
    onSuccess: async (data: any) => {
      setLastCreds({ id: data.id, clientId: data.clientId, clientSecret: data.clientSecret, webhookSecret: data.webhookSecret })
      await qc.invalidateQueries({ queryKey: ['partners'] })
    },
  })

  const createWebhookM = useMutation({
    mutationFn: () => selected ? apiClient.createWebhook(selected.id, { url: newWebhook.url, eventTypes: newWebhook.eventTypes.split(',').map(s => s.trim()).filter(Boolean) }) : Promise.resolve(null),
    onSuccess: async () => {
      setNewWebhook({ url: '', eventTypes: newWebhook.eventTypes })
      if (selected) await qc.invalidateQueries({ queryKey: ['partners', selected.id, 'webhooks'] })
    }
  })

  const replayM = useMutation({
    mutationFn: (deliveryId: string) => selected ? apiClient.replayDelivery(selected.id, deliveryId) : Promise.resolve(null),
    onSuccess: async () => {
      if (selected) await qc.invalidateQueries({ queryKey: ['partners', selected.id, 'logs'] })
    }
  })

  const deliveriesSummary = useMemo(() => {
    const logs = (logsQ.data?.items || []) as LogItem[]
    const delivered = logs.filter((l: LogItem) => l.status === 'delivered').length
    const failed = logs.filter((l: LogItem) => l.status === 'failed').length
    const queued = logs.filter((l: LogItem) => l.status === 'queued').length
    return { delivered, failed, queued, total: logsQ.data?.total || logs.length }
  }, [logsQ.data])

  const chartData = useMemo(() => {
  const logs = (logsQ.data?.items || []).slice().sort((a: LogItem, b: LogItem) => a.timestamp - b.timestamp)
    // Bucket simples por hora
    const buckets: Record<string, { ts: number; delivered: number; failed: number }>= {}
    for (const l of logs) {
      const d = new Date(l.timestamp)
      const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:00`
      if (!buckets[key]) buckets[key] = { ts: new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime(), delivered: 0, failed: 0 }
      if (l.status === 'delivered') buckets[key].delivered++
      if (l.status === 'failed') buckets[key].failed++
    }
    return Object.values(buckets).sort((a,b) => a.ts - b.ts)
  }, [logsQ.data])

  const filteredLogs = useMemo<LogItem[]>(() => (logsQ.data?.items || []), [logsQ.data])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portal de Parceiros</h1>
        <Button variant="secondary" onClick={() => qc.invalidateQueries({ queryKey: ['partners'] })}>
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Parceiros</div>
          <div className="text-2xl font-bold">{partnersQ.data?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Webhooks (parceiro atual)</div>
          <div className="text-2xl font-bold">{webhooksQ.data?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Entregues</div>
          <div className="text-2xl font-bold text-emerald-600">{deliveriesSummary.delivered}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Falhas</div>
          <div className="text-2xl font-bold text-red-600">{deliveriesSummary.failed}</div>
        </Card>
      </div>

      {/* Gráfico entregas por hora */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Entregas por hora</div>
            <div className="text-lg font-semibold">{selected ? selected.name : 'Selecione um parceiro'}</div>
          </div>
          <div className="flex items-center gap-2">
            <select className="border rounded-md px-3 py-2" value={selectedPartner || ''} onChange={(e: any) => setSelectedPartner(e.target.value || null)}>
              <option value="">— selecionar —</option>
              {partnersQ.data?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selected && (
              <Button variant="outline" onClick={() => rotateCredsM.mutate(selected.id)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Rotacionar Credenciais
              </Button>
            )}
          </div>
        </div>
        <div className="w-full">
          <Sparkline data={chartData} />
        </div>
      </Card>

      {/* Credenciais do parceiro (exibidas ao criar/rotacionar) */}
      {selected && (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-lg font-semibold">Credenciais do Parceiro — {selected.name}</div>
            <div className="text-xs text-muted-foreground">Por segurança, segredos completos só aparecem ao criar ou rotacionar.</div>
          </div>
          {lastCreds ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CopyField label="Client ID" value={lastCreds.clientId} onCopied={() => flashCopied('clientId')} copied={copiedKey==='clientId'} />
              <CopyField label="Client Secret" value={lastCreds.clientSecret} onCopied={() => flashCopied('clientSecret')} copied={copiedKey==='clientSecret'} secret />
              <CopyField label="Webhook Secret" value={lastCreds.webhookSecret} onCopied={() => flashCopied('webhookSecret')} copied={copiedKey==='webhookSecret'} secret />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Gere novas credenciais usando “Rotacionar Credenciais” para exibir os segredos.</div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lista de parceiros */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Parceiros</div>
            <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['partners'] })}>
              <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
            </Button>
          </div>
          <div className="space-y-2">
            {(partnersQ.data || []).map(p => (
              <div key={p.id} className={`border rounded p-3 flex items-center justify-between ${selected?.id === p.id ? 'border-emerald-500' : 'border-muted'}`}>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.scopes.join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setSelectedPartner(p.id)}>
                    Ver <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
            {partnersQ.isLoading && (
              <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando…</div>
            )}
          </div>
        </Card>

        {/* Criar parceiro */}
        <Card className="p-4">
          <div className="text-lg font-semibold mb-4">Criar Parceiro</div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Nome</div>
              <Input value={newPartner.name} onChange={(e: any) => setNewPartner({ ...newPartner, name: e.target.value })} placeholder="Ex.: Banco XYZ" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Escopos (vírgula)</div>
              <Input value={newPartner.scopes} onChange={(e: any) => setNewPartner({ ...newPartner, scopes: e.target.value })} />
            </div>
            <Button onClick={() => createPartnerM.mutate()} disabled={createPartnerM.isPending || !newPartner.name.trim()}>
              <Plus className="w-4 h-4 mr-2" /> Criar Parceiro
            </Button>
          </div>
        </Card>
      </div>

      {/* Webhooks */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Webhooks {selected ? `— ${selected.name}` : ''}</div>
          <div className="flex items-center gap-2">
            <Input style={{ minWidth: 320 }} placeholder="https://exemplo.com/webhook" value={newWebhook.url} onChange={(e: any) => setNewWebhook({ ...newWebhook, url: e.target.value })} />
            <Input style={{ minWidth: 280 }} placeholder="eventTypes (vírgula)" value={newWebhook.eventTypes} onChange={(e: any) => setNewWebhook({ ...newWebhook, eventTypes: e.target.value })} />
            <Button onClick={() => createWebhookM.mutate()} disabled={!selected || !newWebhook.url}>
              <Webhook className="w-4 h-4 mr-2" /> Adicionar Webhook
            </Button>
          </div>
        </div>
        {!selected && <div className="text-sm text-muted-foreground">Selecione um parceiro para visualizar e cadastrar webhooks.</div>}
        {selected && (
          <div className="space-y-2">
            {(webhooksQ.data || []).map(w => (
              <div key={w.id} className="border rounded p-3">
                <div className="font-medium">{w.url}</div>
                <div className="text-sm text-muted-foreground">{w.eventTypes.join(', ')}</div>
              </div>
            ))}
            {webhooksQ.isLoading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando…</div>}
          </div>
        )}
      </Card>

      {/* Sandbox: disparar evento de teste */}
      {selected && (
        <Card className="p-4">
          <div className="text-lg font-semibold mb-3">Sandbox — Disparar Evento de Teste</div>
          <div className="flex flex-col md:flex-row md:items-end gap-2">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Tipo de evento</div>
              <select className="border rounded-md px-3 py-2 w-full" value={sandboxType} onChange={(e:any)=>setSandboxType(e.target.value)}>
                {(catalogQ.data?.items || [
                  { type: 'hr.person.created' },
                  { type: 'hr.person.updated' },
                  { type: 'fin.payment.created' },
                  { type: 'fin.payment.failed' },
                ]).map((it:any)=> (
                  <option key={it.type} value={it.type}>{it.type}</option>
                ))}
              </select>
            </div>
            <div className="flex-[2]">
              <div className="text-sm text-muted-foreground mb-1">Payload (JSON opcional)</div>
              <Input placeholder='{"id":"123"}' value={sandboxPayload} onChange={(e:any)=>setSandboxPayload(e.target.value)} />
            </div>
            <div>
              <Button onClick={async()=>{
                try {
                  const payload = sandboxPayload.trim() ? JSON.parse(sandboxPayload) : undefined
                  await apiClient.sandboxEmitEvent(sandboxType, payload)
                  await qc.invalidateQueries({ queryKey: ['partners', selected.id, 'logs'] })
                } catch (e:any) {
                  alert('Payload inválido: ' + (e?.message || ''))
                }
              }}>Disparar</Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Dica: registre um webhook no parceiro para os tipos de evento acima para ver as entregas nos logs.</div>
        </Card>
      )}

      {/* Logs */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Logs de Entrega {selected ? `— ${selected.name}` : ''}</div>
          {selected && (
            <div className="flex items-center gap-2">
              <select className="border rounded-md px-2 py-1 text-sm" value={filterStatus} onChange={(e:any) => setFilterStatus(e.target.value)}>
                <option value="all">status: todos</option>
                <option value="delivered">status: delivered</option>
                <option value="failed">status: failed</option>
                <option value="queued">status: queued</option>
              </select>
              <Input className="h-8" placeholder="buscar por id/evento/erro/http" value={filterQuery} onChange={(e:any)=>setFilterQuery(e.target.value)} />
              <select className="h-8 border rounded px-2 text-sm" value={quickRange} onChange={(e:any)=>applyQuickRange(e.target.value)}>
                <option value="">intervalo…</option>
                <option value="30m">Últimos 30m</option>
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="all">Tudo</option>
              </select>
              <input className="h-8 border rounded px-2 text-sm" type="datetime-local" value={fromDate} onChange={(e:any)=>setFromDate(e.target.value)} />
              <span className="text-xs text-muted-foreground">→</span>
              <input className="h-8 border rounded px-2 text-sm" type="datetime-local" value={toDate} onChange={(e:any)=>setToDate(e.target.value)} />
              <Button size="sm" variant="ghost" onClick={() => { setFilterStatus('all'); setFilterQuery(''); setFromDate(''); setToDate(''); setQuickRange(''); setPage(0) }}>Limpar</Button>
              <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['partners', selected.id, 'logs'] })}>
                <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
              </Button>
            </div>
          )}
        </div>
        {!selected && <div className="text-sm text-muted-foreground">Selecione um parceiro para visualizar logs.</div>}
        {selected && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Evento</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Tentativas</th>
                  <th className="py-2 pr-4">HTTP</th>
                  <th className="py-2 pr-4">Quando</th>
                  <th className="py-2 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">{l.id}</td>
                    <td className="py-2 pr-4">{l.event}</td>
                    <td className="py-2 pr-4"><StatusBadge status={l.status as any} /></td>
                    <td className="py-2 pr-4">{l.attempt}</td>
                    <td className="py-2 pr-4">{l.responseStatus ?? '-'}</td>
                    <td className="py-2 pr-4">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => replayM.mutate(l.id)}>
                          <Repeat className="w-4 h-4 mr-2" /> Reenviar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDetailLog(l)}>
                          Detalhes
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logsQ.isLoading && <div className="text-sm text-muted-foreground flex items-center mt-2"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando…</div>}
            <div className="flex items-center justify-between mt-3 text-sm">
              <div>
                Total: {logsQ.data?.total || 0}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page===0} onClick={()=> setPage(p => Math.max(0, p-1))}>Anterior</Button>
                <div>Página {page+1}</div>
                <Button size="sm" variant="outline" disabled={(logsQ.data?.offset||0)+ (logsQ.data?.limit||pageSize) >= (logsQ.data?.total||0)} onClick={()=> setPage(p => p+1)}>Próxima</Button>
                <Button size="sm" variant="secondary" onClick={()=>exportCsv(filteredLogs)}>Exportar CSV (página)</Button>
                <Button size="sm" variant="secondary" onClick={()=>exportAllCsv(selected!.id, { status: filterStatus, q: filterQuery || undefined, from: fromDate || undefined, to: toDate || undefined })}>Exportar CSV (tudo)</Button>
                <Button size="sm" variant="outline" onClick={()=>exportJson(filteredLogs)}>Exportar JSON (página)</Button>
                <Button size="sm" variant="outline" onClick={()=>exportAllJson(selected!.id, { status: filterStatus, q: filterQuery || undefined, from: fromDate || undefined, to: toDate || undefined })}>Exportar JSON (tudo)</Button>
                <BulkReplayButton disabled={!selected} logs={filteredLogs} onReplay={async()=>{ if (selected) await qc.invalidateQueries({ queryKey: ['partners', selected.id, 'logs'] }) }} partnerId={selected?.id || ''} />
              </div>
            </div>
          </div>
        )}
      </Card>
      <Modal open={!!detailLog} onClose={()=>setDetailLog(null)}>
        {detailLog && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Entrega {detailLog.id}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payload</div>
                <pre className="bg-gray-50 border rounded p-2 text-xs overflow-auto" style={{maxHeight:300}}>{JSON.stringify(detailLog.payload, null, 2)}</pre>
                <Button size="sm" variant="outline" className="mt-2" onClick={()=>navigator.clipboard.writeText(JSON.stringify(detailLog.payload))}>Copiar payload</Button>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Resposta HTTP</div>
                <pre className="bg-gray-50 border rounded p-2 text-xs overflow-auto" style={{maxHeight:300}}>{detailLog.responseBody || '-'}</pre>
                <Button size="sm" variant="outline" className="mt-2" onClick={()=>navigator.clipboard.writeText(detailLog.responseBody || '')}>Copiar resposta</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CopyField({ label, value, secret, onCopied, copied }: { label: string; value: string; secret?: boolean; onCopied: () => void; copied: boolean }) {
  const masked = secret ? value.replace(/.(?=.{4})/g, '•') : value
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(value); onCopied() } catch (e) { void e }
  }
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input readOnly value={masked} className="w-full rounded-md border px-3 py-2 font-mono text-xs" />
        <Button size="sm" variant="outline" onClick={doCopy} aria-label={`Copiar ${label}`}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'queued'|'delivered'|'failed'|string }) {
  const map: Record<string, string> = {
    delivered: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    queued: 'bg-gray-100 text-gray-800',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-800'
  return <Badge className={cls}>{status}</Badge>
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: any }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-5xl w-[92vw] p-4">
        <div className="absolute top-2 right-2">
          <Button size="sm" variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
        {children}
      </div>
    </div>
  )
}

function exportCsv(rows: Array<any>) {
  const headers = ['id','event','status','attempt','responseStatus','timestamp']
  const escape = (v: any) => '"' + String(v ?? '').replace(/"/g,'""') + '"'
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => escape((r as any)[h])).join(','))).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'partner-logs.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function exportAllCsv(partnerId: string, params: { status?: 'all'|'queued'|'delivered'|'failed'; q?: string; from?: string; to?: string }) {
  try {
    const pageSize = 500
    let offset = 0
    let total = 0
    const all: any[] = []
    // Lazy import to avoid circular dependency issues
    const { apiClient } = await import('../../lib/api')
    do {
      const { items, total: t } = await apiClient.listPartnerLogsPaged(partnerId, { ...params, limit: pageSize, offset, sort: 'desc' })
      total = t
      all.push(...items)
      offset += items.length
    } while (offset < total && all.length < 25000) // hard cap to evitar downloads enormes acidentais
    exportCsv(all)
  } catch (e:any) {
    alert('Falha ao exportar CSV: ' + (e?.message || 'erro desconhecido'))
  }
}

function exportJson(rows: Array<any>) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'partner-logs.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function exportAllJson(partnerId: string, params: { status?: 'all'|'queued'|'delivered'|'failed'; q?: string; from?: string; to?: string }) {
  try {
    const pageSize = 500
    let offset = 0
    let total = 0
    const all: any[] = []
    const { apiClient } = await import('../../lib/api')
    do {
      const { items, total: t } = await apiClient.listPartnerLogsPaged(partnerId, { ...params, limit: pageSize, offset, sort: 'desc' })
      total = t
      all.push(...items)
      offset += items.length
    } while (offset < total && all.length < 25000)
    exportJson(all)
  } catch (e:any) {
    alert('Falha ao exportar JSON: ' + (e?.message || 'erro desconhecido'))
  }
}

function BulkReplayButton({ logs, partnerId, onReplay, disabled }: { logs: LogItem[]; partnerId: string; onReplay: () => Promise<void>; disabled?: boolean }) {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const failed = logs.filter(l => l.status === 'failed')
  const total = failed.length
  const handle = async () => {
    if (!partnerId || total === 0) return
    if (!confirm(`Reenviar ${total} entrega(s) com falha?`)) return
    setRunning(true); setDone(0)
    try {
      for (const l of failed) {
        try { await apiClient.request(`/api/v1/partners/${partnerId}/webhooks/${l.id}/replay`, { method: 'POST' }) } catch { /* ignore each */ }
        setDone((d)=>d+1)
      }
      await onReplay()
    } finally {
      setRunning(false)
    }
  }
  return (
    <Button size="sm" variant="destructive" disabled={disabled || running || total===0} onClick={handle} title={total ? `${total} falha(s) nesta página` : 'Sem falhas nesta página'}>
      <Repeat className="w-4 h-4 mr-2" /> {running ? `Reenviando… (${done}/${total})` : `Reenviar falhas (página)`}
    </Button>
  )
}
