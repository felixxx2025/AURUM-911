import './globals.css'
import Providers from './providers'
import { getNonce } from '@/lib/nonce'

import NetworkBanner from '@/components/NetworkBanner'

export const metadata = {
  title: 'AURUM - Plataforma de Gestão',
  description: 'Plataforma SaaS multi-tenant para gestão de RH, finanças e mais',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the CSP nonce from middleware
  const nonce = await getNonce()
  
  return (
    <html lang="pt-BR">
      <head>
        {/* CSP nonce is available for inline scripts/styles if needed */}
        {nonce && <meta property="csp-nonce" content={nonce} />}
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <NetworkBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}