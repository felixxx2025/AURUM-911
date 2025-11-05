export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type ClientLog = {
  t: number
  level: LogLevel
  msg: string
  extra?: Record<string, unknown>
}

const MAX = 200
const buf: ClientLog[] = []

export function pushLog(level: LogLevel, msg: string, extra?: Record<string, unknown>) {
  const entry: ClientLog = { t: Date.now(), level, msg, extra }
  buf.push(entry)
  if (buf.length > MAX) buf.shift()
  if (process.env.NODE_ENV !== 'production') {
    const args = [msg, extra].filter(Boolean) as any[]
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'debug' : level](...args)
  }
}

export function getLogs() {
  return buf.slice().reverse()
}
