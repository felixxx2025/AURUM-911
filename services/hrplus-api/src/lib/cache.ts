// Cache Redis - Baseado em padrões do Stripe e GitHub
// import { createClient } from 'redis'

interface CacheConfig {
  url: string
  ttl: number
}

export class CacheService {
  private client: any
  private defaultTTL: number
  private cache = new Map<string, { value: any, expires: number }>()

  constructor(config: CacheConfig) {
    // this.client = createClient({ url: config.url })
    this.defaultTTL = config.ttl
    // this.client.on('error', (err: any) => console.error('Redis error:', err))
  }

  async connect() {
    // Mock implementation
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = Date.now() + ((ttl || this.defaultTTL) * 1000)
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Cache específico para tenant
  tenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`
  }

  // Cache de sessão
  sessionKey(userId: string): string {
    return `session:${userId}`
  }

  // Cache de rate limiting
  rateLimitKey(ip: string, endpoint: string): string {
    return `rate_limit:${ip}:${endpoint}`
  }
}

export const cacheService = new CacheService({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: 3600 // 1 hora
})