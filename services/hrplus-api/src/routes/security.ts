/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import client from 'prom-client'

import { register } from '../metrics'

const cspCounter = new client.Counter({
  name: 'csp_violations_total',
  help: 'Total de violações de CSP recebidas',
  labelNames: ['directive', 'origin'] as const,
})
register.registerMetric(cspCounter)

type LegacyCspReport = {
  'csp-report'?: Record<string, unknown> & {
    'effective-directive'?: string
    'violated-directive'?: string
    'blocked-uri'?: string
    'document-uri'?: string
    referrer?: string
  }
}

type ModernReport = {
  type?: string
  age?: number
  url?: string
  body?: Record<string, any>
}

export async function securityRoutes(app: FastifyInstance) {
  // Recebe relatórios de CSP (legado e modernos) e persiste no DB
  app.post('/api/v1/security/csp-report', {
    schema: { tags: ['security'], security: [], body: { type: ['object', 'array'] } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const ua = String(request.headers['user-agent'] || '')
    const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || (request.socket as any)?.remoteAddress || undefined
    const contentType = String(request.headers['content-type'] || '')
    const now = new Date()
    const ttlDays = Number(process.env.CSP_REPORT_TTL_DAYS || 30)
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000)

    // Prune simples de expirados (melhor mover para job dedicado em alto volume)
    try {
      await (app as any).prisma.cspReport.deleteMany({ where: { expires_at: { lt: now } } })
    } catch (error) {
      // manter operação resiliente; reportar em nível de debug
      app.log.debug({ err: error }, 'csp prune failed (ignored)')
    }

    try {
      if (contentType.includes('application/csp-report')) {
        const json = request.body as LegacyCspReport
        const rpt = json?.['csp-report'] || (json as any)
        const documentUri = String(rpt?.['document-uri'] || '')
        const origin = safeOrigin(documentUri)
        const directive = String(rpt?.['effective-directive'] || rpt?.['violated-directive'] || '')
        const blockedUri = String(rpt?.['blocked-uri'] || '')
        cspCounter.inc({ directive: directive || 'unknown', origin: origin || 'unknown' })
        await (app as any).prisma.cspReport.create({
          data: {
            url: documentUri || undefined,
            path: pathFromUrl(documentUri),
            directive: directive || undefined,
            blocked_uri: blockedUri || undefined,
            referrer: String(rpt?.['referrer'] || '') || undefined,
            user_agent: ua || undefined,
            report_type: 'legacy',
            client_ip: ip || undefined,
            body: rpt as any,
            expires_at: expiresAt,
          }
        })
        return reply.code(204).send()
      }

      if (contentType.includes('application/reports+json')) {
        const reports = request.body as ModernReport[]
        for (const r of Array.isArray(reports) ? reports : []) {
          const url = String(r?.url || '')
          const origin = safeOrigin(url)
          const directive = String(r?.body?.['effectiveDirective'] || r?.body?.['violatedDirective'] || r?.type || '')
          const blockedUri = String(r?.body?.['blockedURL'] || '')
          cspCounter.inc({ directive: directive || 'unknown', origin: origin || 'unknown' })
          await (app as any).prisma.cspReport.create({
            data: {
              url: url || undefined,
              path: pathFromUrl(url),
              directive: directive || undefined,
              blocked_uri: blockedUri || undefined,
              referrer: String(r?.body?.['referrer'] || '') || undefined,
              user_agent: ua || undefined,
              report_type: 'reports+json',
              client_ip: ip || undefined,
              body: r?.body as any,
              expires_at: expiresAt,
            }
          })
        }
        return reply.code(204).send()
      }

  // Tenta JSON "genérico"
      try {
        const anyBody = request.body as any
        const url = String(anyBody?.url || anyBody?.['document-uri'] || '')
        const origin = safeOrigin(url)
        const directive = String(anyBody?.['effective-directive'] || anyBody?.['violated-directive'] || anyBody?.type || '')
        const blockedUri = String(anyBody?.['blocked-uri'] || '')
        cspCounter.inc({ directive: directive || 'unknown', origin: origin || 'unknown' })
        await (app as any).prisma.cspReport.create({
          data: {
            url: url || undefined,
            path: pathFromUrl(url),
            directive: directive || undefined,
            blocked_uri: blockedUri || undefined,
            referrer: String(anyBody?.referrer || '') || undefined,
            user_agent: ua || undefined,
            report_type: 'unknown',
            client_ip: ip || undefined,
            body: anyBody as any,
            expires_at: expiresAt,
          }
        })
      } catch (error) {
        request.log.debug({ err: error }, 'csp report generic parse failed (ignored)')
      }
      return reply.code(204).send()
    } catch (e) {
      request.log.warn({ err: e }, 'failed to persist CSP report')
      return reply.code(204).send()
    }
  })

  // Listagem paginada de relatórios
  app.get('/api/v1/security/csp-reports', {
    schema: {
      tags: ['security'], security: [],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 200 },
          sinceDays: { type: 'integer', minimum: 1 },
          directive: { type: 'string' },
          path: { type: 'string' },
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { page?: number; pageSize?: number; sinceDays?: number; directive?: string; path?: string } }>, reply: FastifyReply) => {
    const page = Number(request.query?.page || 1)
    const pageSize = Number(request.query?.pageSize || 50)
    const sinceDays = Number(request.query?.sinceDays || 7)
    const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
    const where: any = { created_at: { gte: since } }
    if (request.query?.directive) where.directive = request.query.directive
    if (request.query?.path) where.path = request.query.path
    const [items, total] = await Promise.all([
      (app as any).prisma.cspReport.findMany({ where, orderBy: { created_at: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      (app as any).prisma.cspReport.count({ where })
    ])
    reply.header('X-Total-Count', String(total))
    reply.header('X-Result-Limit', String(pageSize))
    reply.header('X-Result-Offset', String((page - 1) * pageSize))
    return { items, total, page, pageSize }
  })
}

function safeOrigin(u?: string) {
  try { return u ? new URL(u).origin : '' } catch { return '' }
}
function pathFromUrl(u?: string) {
  try { return u ? new URL(u).pathname : '' } catch { return '' }
}
