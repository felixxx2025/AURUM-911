'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold mb-2">Ocorreu um erro</h1>
            <p className="text-sm text-gray-600 mb-4">{error.message || 'Algo inesperado aconteceu.'}</p>
            <div className="flex gap-2">
              <button className="border px-3 py-2 rounded" onClick={() => reset()}>Tentar novamente</button>
              <button className="border px-3 py-2 rounded" onClick={() => (window.location.href = '/')}>Voltar ao início</button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
