import Redis from 'ioredis'
import { promClient } from '../metrics'

const cacheHits = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['cache_type', 'tenant_id'],
})

const cacheMisses = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['cache_type', 'tenant_id'],
})

export class CacheOptimizer {
  private redis: Redis
  private localCache = new Map<string, { data: any; expiry: number }>()

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl)
  }

  async get<T>(key: string, tenantId?: string): Promise<T | null> {
    const cacheKey = tenantId ? `${tenantId}:${key}` : key
    
    // Check local cache first (L1)
    const localData = this.localCache.get(cacheKey)
    if (localData && localData.expiry > Date.now()) {
      cacheHits.inc({ cache_type: 'local', tenant_id: tenantId || 'global' })
      return localData.data
    }

    // Check Redis cache (L2)
    const redisData = await this.redis.get(cacheKey)
    if (redisData) {
      const parsed = JSON.parse(redisData)
      // Store in local cache for faster access
      this.localCache.set(cacheKey, {
        data: parsed,
        expiry: Date.now() + 60000 // 1 minute local cache
      })
      cacheHits.inc({ cache_type: 'redis', tenant_id: tenantId || 'global' })
      return parsed
    }

    cacheMisses.inc({ cache_type: 'both', tenant_id: tenantId || 'global' })
    return null
  }

  async set(key: string, value: any, ttl: number = 3600, tenantId?: string): Promise<void> {
    const cacheKey = tenantId ? `${tenantId}:${key}` : key
    
    // Store in both caches
    await this.redis.setex(cacheKey, ttl, JSON.stringify(value))
    this.localCache.set(cacheKey, {
      data: value,
      expiry: Date.now() + Math.min(ttl * 1000, 60000) // Max 1 minute local
    })
  }

  async invalidate(pattern: string, tenantId?: string): Promise<void> {
    const searchPattern = tenantId ? `${tenantId}:${pattern}` : pattern
    
    // Clear Redis
    const keys = await this.redis.keys(searchPattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Clear local cache
    for (const key of this.localCache.keys()) {
      if (key.includes(searchPattern.replace('*', ''))) {
        this.localCache.delete(key)
      }
    }
  }

  async mget<T>(keys: string[], tenantId?: string): Promise<(T | null)[]> {
    const cacheKeys = keys.map(key => tenantId ? `${tenantId}:${key}` : key)
    const results = await this.redis.mget(...cacheKeys)
    
    return results.map(result => result ? JSON.parse(result) : null)
  }

  async mset(items: Array<{ key: string; value: any; ttl?: number }>, tenantId?: string): Promise<void> {
    const pipeline = this.redis.pipeline()
    
    items.forEach(item => {
      const cacheKey = tenantId ? `${tenantId}:${item.key}` : item.key
      const ttl = item.ttl || 3600
      pipeline.setex(cacheKey, ttl, JSON.stringify(item.value))
    })
    
    await pipeline.exec()
  }

  // Smart caching for database queries
  async cacheQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 300,
    tenantId?: string
  ): Promise<T> {
    const cached = await this.get<T>(queryKey, tenantId)
    if (cached !== null) return cached

    const result = await queryFn()
    await this.set(queryKey, result, ttl, tenantId)
    return result
  }

  // Cleanup expired local cache entries
  private cleanupLocalCache() {
    const now = Date.now()
    for (const [key, value] of this.localCache.entries()) {
      if (value.expiry <= now) {
        this.localCache.delete(key)
      }
    }
  }

  startCleanupTimer() {
    setInterval(() => this.cleanupLocalCache(), 60000) // Every minute
  }
}