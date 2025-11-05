import { createApp } from './app'
import { initTracing, shutdownTracing } from './tracing'

async function main() {
  // Optional tracing
  await initTracing()
  const app = await createApp()
  const port = Number(process.env.PORT || 3000)
  app
    .listen({ port, host: '0.0.0.0' })
    .then(() => console.log(`🚀 AURUM API running on :${port}`))
    .catch((err: unknown) => {
      app.log.error(err)
      shutdownTracing().finally(() => process.exit(1))
    })

  // Graceful shutdown
  const close = async () => {
    try {
      await app.close()
    } finally {
      await shutdownTracing()
      process.exit(0)
    }
  }
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}

main()