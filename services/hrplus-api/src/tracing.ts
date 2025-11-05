import { context, SpanStatusCode, trace } from '@opentelemetry/api'
// Resource configuration can be driven by env vars (OTEL_SERVICE_NAME, OTEL_RESOURCE_ATTRIBUTES)
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NodeSDK } from '@opentelemetry/sdk-node'

let sdk: NodeSDK | undefined
const tracer = trace.getTracer('hrplus-api')

export async function initTracing() {
  const enabled = String(process.env.OTEL_ENABLED || '').toLowerCase() === 'true'
  if (!enabled) return

  try {
    // Configure OTLP/HTTP exporter (compatible with Jaeger all-in-one via 4318)
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'
    const exporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })

    sdk = new NodeSDK({
      traceExporter: exporter,
      instrumentations: getNodeAutoInstrumentations({
        // Keep defaults; disable heavy ones if needed in future
      }),
    })

    await sdk.start()
  } catch (err) {
    // Non-fatal: keep app running even if tracing fails
    // eslint-disable-next-line no-console
    console.warn('[otel] failed to initialize tracing:', err)
  }

}

export function createSpan(name: string, attributes?: Record<string, any>) {
  return tracer.startSpan(name, { attributes })
}

export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  const span = createSpan(name, attributes)
  
  try {
    const result = await context.with(trace.setSpan(context.active(), span), fn)
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    span.setStatus({ code: SpanStatusCode.ERROR, message })
    // recordException aceita Exception; fazemos cast seguro aqui
    span.recordException(error as any)
    throw error
  } finally {
    span.end()
  }
}

export async function shutdownTracing() {
  if (!sdk) return
  await sdk.shutdown()
  sdk = undefined
}
 
