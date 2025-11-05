'use client'

import { useEffect, useState } from 'react'

export default function NetworkBanner() {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  if (online) return null
  return (
    <div className="w-full text-center text-sm bg-amber-100 text-amber-900 py-2">
      Você está offline. Tentaremos novamente quando a conexão voltar.
    </div>
  )
}
