/*
  Next.js App Route to receive Content Security Policy violation reports.
  Accepts both legacy application/csp-report and modern application/reports+json formats.
*/

export const dynamic = 'force-dynamic'

type LegacyCspReport = {
  'csp-report'?: Record<string, unknown>
}

type ModernReport = {
  type?: string
  age?: number
  url?: string
  body?: Record<string, unknown>
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  try {
    if (contentType.includes('application/csp-report')) {
      const json = (await req.json()) as LegacyCspReport
      // eslint-disable-next-line no-console
      console.warn('[CSP] violation (legacy)', {
        report: json?.['csp-report'] ?? json,
        ua: req.headers.get('user-agent') || '',
        referer: req.headers.get('referer') || '',
      })
      // forward fire-and-forget to API for persistence/metrics
      fetch(`${apiBase}/api/v1/security/csp-report`, {
        method: 'POST',
        headers: { 'content-type': 'application/csp-report', 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' },
        body: JSON.stringify(json)
      }).catch(()=>{})
      return new Response(null, { status: 204 })
    }

    if (contentType.includes('application/reports+json')) {
      const reports = (await req.json()) as ModernReport[]
      // eslint-disable-next-line no-console
      console.warn('[CSP] violation (reports+json)', reports?.map(r => ({
        type: r?.type,
        url: r?.url,
        body: r?.body,
      })))
      fetch(`${apiBase}/api/v1/security/csp-report`, {
        method: 'POST',
        headers: { 'content-type': 'application/reports+json', 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' },
        body: JSON.stringify(reports)
      }).catch(()=>{})
      return new Response(null, { status: 204 })
    }

    // Try to parse as JSON if content-type is not set as expected
    try {
      const fallback = (await req.json()) as unknown
      // eslint-disable-next-line no-console
      console.warn('[CSP] violation (unknown content-type)', fallback)
      fetch(`${apiBase}/api/v1/security/csp-report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' },
        body: JSON.stringify(fallback as any)
      }).catch(()=>{})
      return new Response(null, { status: 204 })
    } catch {
      // eslint-disable-next-line no-console
      console.warn('[CSP] violation received with unsupported content-type', contentType)
      return new Response(null, { status: 204 })
    }
  } catch (e) {
    // Never explode on reporting endpoint; just acknowledge.
    // eslint-disable-next-line no-console
    console.error('[CSP] error handling report', e)
    return new Response(null, { status: 204 })
  }
}
