'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

let singletonClient: QueryClient | null = null

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000),
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  })
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    if (singletonClient) return singletonClient
    singletonClient = createClient()
    return singletonClient
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
