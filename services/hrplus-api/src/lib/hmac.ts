import crypto from 'crypto'

export type HmacHeaders = {
  'x-aurum-signature': string
  'x-aurum-timestamp': string
}

export function signWebhook(body: unknown, secret: string, timestamp?: number): HmacHeaders {
  const ts = timestamp ?? Math.floor(Date.now() / 1000)
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  const base = `${ts}.${payload}`
  const hmac = crypto.createHmac('sha256', secret).update(base).digest('hex')
  return {
    'x-aurum-signature': `t=${ts},v1=${hmac}`,
    'x-aurum-timestamp': String(ts),
  }
}

export function verifyWebhook(rawBody: string, signatureHeader: string | undefined, secret: string, toleranceSec = 300): boolean {
  if (!signatureHeader) return false
  try {
    const parts = signatureHeader.split(',').reduce<Record<string,string>>((acc, kv) => {
      const [k, v] = kv.split('=')
      if (k && v) acc[k.trim()] = v.trim()
      return acc
    }, {})
    const ts = Number(parts['t'])
    const v1 = parts['v1']
    if (!ts || !v1) return false
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - ts) > toleranceSec) return false
    const base = `${ts}.${rawBody}`
    const expected = crypto.createHmac('sha256', secret).update(base).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  } catch {
    return false
  }
}
