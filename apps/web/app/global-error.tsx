'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold mb-2">Erro crítico</h1>
            <p className="text-sm text-gray-600 mb-4">{error.message || 'Falha fora do escopo da página.'}</p>
            <button className="border px-3 py-2 rounded" onClick={() => reset()}>Tentar novamente</button>
          </div>
        </div>
      </body>
    </html>
  )
}
