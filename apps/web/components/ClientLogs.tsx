'use client'

import { useEffect, useState } from 'react'

import { ClientLog, getLogs } from '@/lib/log'

export default function ClientLogs() {
  const [logs, setLogs] = useState<ClientLog[]>([])
  const refresh = () => setLogs(getLogs())
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Logs do Cliente</div>
        <button className="text-xs underline" onClick={refresh}>Atualizar</button>
      </div>
      <div className="h-48 overflow-auto border rounded p-2 text-xs font-mono bg-gray-50">
        {logs.length === 0 && <div className="text-gray-500">Sem entradas recentes.</div>}
        {logs.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {new Date(l.t).toLocaleTimeString()} [{l.level.toUpperCase()}] {l.msg}
            {l.extra ? ' ' + JSON.stringify(l.extra) : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
