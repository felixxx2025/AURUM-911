import './globals.css'
import Providers from './providers'

import NetworkBanner from '@/components/NetworkBanner'

export const metadata = {
  title: 'AURUM - Plataforma de Gestão',
  description: 'Plataforma SaaS multi-tenant para gestão de RH, finanças e mais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <Providers>
          <NetworkBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}