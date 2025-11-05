/**
 * Advanced Cache Manager
 * 
 * Provides enhanced caching with:
 * - Tag-based invalidation
 * - Version support
 * - TTL management
 * - Error handling
 */

import { Redis } from '@upstash/redis'

/**
 * Cache configuration options
 */
export interface CacheConfig {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for group invalidation
  version?: string // Cache version for invalidation
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  errors: number
}

/**
 * Cache Manager Class
 * Handles all cache operations with Upstash Redis
 */
class CacheManager {
  private redis: Redis | null
  private version: string
  private stats: CacheStats
  private enabled: boolean
  
  constructor() {
    this.version = process.env.CACHE_VERSION || 'v1'
    this.stats = { hits: 0, misses: 0, sets: 0, errors: 0 }
    this.enabled = true
    this.redis = this.initRedis()
  }
  
  /**
   * Initialize Redis connection
   */
  private initRedis(): Redis | null {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!redisUrl || !redisToken) {
      console.warn('⚠️ Upstash Redis not configured. Caching disabled.')
      this.enabled = false
      return null
    }
    
    try {
      return new Redis({
        url: redisUrl,
        token: redisToken
      })
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      this.enabled = false
      return null
    }
  }
  
  /**
   * Check if cache is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled && this.redis !== null
  }
  
  /**
   * Build versioned cache key
   */
  private buildKey(key: string): string {
    return `${this.version}:${key}`
  }
  
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled()) return null
    
    const versionedKey = this.buildKey(key)
    
    try {
      const data = await this.redis!.get(versionedKey)
      
      if (data !== null) {
        this.stats.hits++
        console.log(`✅ Cache HIT: ${key}`)
        return data as T
      }
      
      this.stats.misses++
      console.log(`❌ Cache MISS: ${key}`)
      return null
    } catch (error) {
      this.stats.errors++
      console.error(`Cache get error for ${key}:`, error)
      return null
    }
  }
  
  /**
   * Set value in cache with TTL and tags
   */
  async set(
    key: string,
    value: unknown,
    config: CacheConfig = {}
  ): Promise<void> {
    if (!this.isEnabled()) return
    
    const versionedKey = this.buildKey(key)
    const ttl = config.ttl || 3600 // Default 1 hour
    
    try {
      // Store the value with expiration
      await this.redis!.setex(versionedKey, ttl, JSON.stringify(value))
      this.stats.sets++
      
      // Store tags for group invalidation
      if (config.tags && config.tags.length > 0) {
        for (const tag of config.tags) {
          const tagKey = `tag:${tag}`
          await this.redis!.sadd(tagKey, versionedKey)
          await this.redis!.expire(tagKey, ttl)
        }
      }
      
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`)
    } catch (error) {
      this.stats.errors++
      console.error(`Cache set error for ${key}:`, error)
    }
  }
  
  /**
   * Invalidate a specific cache key
   */
  async invalidate(key: string): Promise<void> {
    if (!this.isEnabled()) return
    
    const versionedKey = this.buildKey(key)
    
    try {
      await this.redis!.del(versionedKey)
      console.log(`🗑️ Cache invalidated: ${key}`)
    } catch (error) {
      this.stats.errors++
      console.error(`Cache invalidate error for ${key}:`, error)
    }
  }
  
  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag: string): Promise<void> {
    if (!this.isEnabled()) return
    
    const tagKey = `tag:${tag}`
    
    try {
      // Get all keys with this tag
      const keys = await this.redis!.smembers(tagKey)
      
      if (keys.length > 0) {
        // Delete all keys
        await this.redis!.del(...keys)
        // Delete the tag set itself
        await this.redis!.del(tagKey)
        console.log(`🗑️ Cache tag invalidated: ${tag} (${keys.length} keys)`)
      }
    } catch (error) {
      this.stats.errors++
      console.error(`Cache tag invalidate error for ${tag}:`, error)
    }
  }
  
  /**
   * Invalidate multiple tags at once
   */
  async invalidateTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map(tag => this.invalidateTag(tag)))
  }
  
  /**
   * Clear all cache
   * WARNING: Use with caution in production
   */
  async clear(): Promise<void> {
    if (!this.isEnabled()) return
    
    try {
      // Get all keys with current version
      const pattern = `${this.version}:*`
      const keys = await this.redis!.keys(pattern)
      
      if (keys.length > 0) {
        await this.redis!.del(...keys)
        console.log(`🗑️ Cache cleared: ${keys.length} keys`)
      }
    } catch (error) {
      this.stats.errors++
      console.error('Cache clear error:', error)
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }
  
  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, errors: 0 }
  }
  
  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    if (total === 0) return 0
    return (this.stats.hits / total) * 100
  }
  
  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled()) return false
    
    const versionedKey = this.buildKey(key)
    
    try {
      const result = await this.redis!.exists(versionedKey)
      return result === 1
    } catch (error) {
      console.error(`Cache exists error for ${key}:`, error)
      return false
    }
  }
  
  /**
   * Get remaining TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isEnabled()) return -1
    
    const versionedKey = this.buildKey(key)
    
    try {
      return await this.redis!.ttl(versionedKey)
    } catch (error) {
      console.error(`Cache TTL error for ${key}:`, error)
      return -1
    }
  }
  
  /**
   * Extend TTL for an existing key
   */
  async extend(key: string, additionalSeconds: number): Promise<void> {
    if (!this.isEnabled()) return
    
    const versionedKey = this.buildKey(key)
    
    try {
      const currentTTL = await this.redis!.ttl(versionedKey)
      if (currentTTL > 0) {
        await this.redis!.expire(versionedKey, currentTTL + additionalSeconds)
        console.log(`⏰ Cache TTL extended: ${key} (+${additionalSeconds}s)`)
      }
    } catch (error) {
      console.error(`Cache extend error for ${key}:`, error)
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Export convenience functions
export const {
  get: getCache,
  set: setCache,
  invalidate: invalidateCache,
  invalidateTag: invalidateCacheTag,
  invalidateTags: invalidateCacheTags
} = {
  get: cacheManager.get.bind(cacheManager),
  set: cacheManager.set.bind(cacheManager),
  invalidate: cacheManager.invalidate.bind(cacheManager),
  invalidateTag: cacheManager.invalidateTag.bind(cacheManager),
  invalidateTags: cacheManager.invalidateTags.bind(cacheManager)
}
