/**
 * Redis Cache Utilities for AgroInsight
 * 
 * This module provides caching functionality using Upstash Redis.
 * Caching improves performance by storing frequently accessed data in memory.
 * 
 * Features:
 * - Get/Set cached data with TTL (Time To Live)
 * - Cache invalidation (single key or pattern-based)
 * - Cache key generation for articles
 * - Cache statistics
 * 
 * Benefits:
 * - Reduces database queries
 * - Faster response times for repeated requests
 * - Lower API costs for external services
 * 
 * Usage:
 * ```ts
 * // Store data in cache
 * await setCachedData('user:123', userData, 3600) // 1 hour TTL
 * 
 * // Retrieve from cache
 * const user = await getCachedData<User>('user:123')
 * 
 * // Invalidate when data changes
 * await invalidateCache('user:123')
 * ```
 */

import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client for caching
 * Configured using environment variables for security
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,    // REST API URL from Upstash dashboard
  token: process.env.UPSTASH_REDIS_REST_TOKEN!, // Authentication token
})

/**
 * Retrieve data from cache
 * 
 * @param key - Cache key to look up
 * @returns Cached data of type T, or null if not found/expired
 * 
 * @example
 * ```ts
 * const articles = await getCachedData<Article[]>('articles:search:agriculture')
 * if (articles) {
 *   return articles // Use cached data
 * } else {
 *   // Fetch from database/API and cache it
 * }
 * ```
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    
    // If data is a string, parse it as JSON
    // Upstash may return data as string or already parsed
    if (typeof cached === 'string') {
      return JSON.parse(cached) as T
    }
    
    return cached as T
  } catch (error) {
    // Log error but don't throw - cache failures shouldn't break the app
    console.error('Erro ao buscar cache:', error)
    return null
  }
}

/**
 * Store data in cache with expiration
 * 
 * @param key - Cache key to store under
 * @param data - Data to cache (will be JSON serialized)
 * @param ttl - Time to live in seconds (default: 3600 = 1 hour)
 * 
 * @example
 * ```ts
 * await setCachedData('dashboard:stats', statsData, 300) // Cache for 5 minutes
 * ```
 */
export async function setCachedData<T>(
  key: string, 
  data: T, 
  ttl: number = 3600  // Default: 1 hour
): Promise<void> {
  try {
    // Serialize data to JSON string for storage
    const serialized = JSON.stringify(data)
    
    // Store with expiration (SETEX command)
    await redis.setex(key, ttl, serialized)
  } catch (error) {
    console.error('Erro ao salvar cache:', error)
    // Don't throw error - cache failures shouldn't break the application
    // The app should still work without cache, just slower
  }
}

/**
 * Delete a single key from cache
 * Used when data is updated and cache needs to be refreshed
 * 
 * @param key - Cache key to delete
 * 
 * @example
 * ```ts
 * // After updating user data
 * await prisma.user.update({ where: { id: '123' }, data: { name: 'New Name' } })
 * await invalidateCache('user:123') // Remove old cached data
 * ```
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Erro ao invalidar cache:', error)
  }
}

/**
 * Delete multiple cache keys matching a pattern
 * Useful for invalidating related cache entries at once
 * 
 * @param pattern - Redis key pattern (e.g., 'articles:*', 'user:123:*')
 * 
 * @example
 * ```ts
 * // Invalidate all article caches
 * await invalidateCachePattern('articles:*')
 * 
 * // Invalidate all caches for a specific user
 * await invalidateCachePattern('user:123:*')
 * ```
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // Find all keys matching the pattern
    const keys = await redis.keys(pattern)
    
    // Delete them if any found
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Erro ao invalidar cache por padrão:', error)
  }
}

/**
 * Generate a unique cache key for article searches
 * Creates consistent keys for the same search parameters
 * 
 * @param query - Search query string
 * @param source - Data source (e.g., 'pubmed', 'crossref')
 * @param page - Page number
 * @param filters - Additional filters applied
 * @returns Unique cache key string
 * 
 * @example
 * ```ts
 * const cacheKey = generateArticlesCacheKey('agriculture', 'pubmed', 1, { year: 2024 })
 * // Returns: "articles:pubmed:agriculture:p1:{"year":2024}"
 * ```
 */
export function generateArticlesCacheKey(
  query: string, 
  source: string, 
  page: number, 
  filters: Record<string, unknown>
): string {
  // Normalize query to lowercase and trim whitespace
  // This ensures "Agriculture" and "agriculture" use the same cache
  const normalizedQuery = query.toLowerCase().trim()
  
  // Convert filters to string for consistent hashing
  const filtersHash = JSON.stringify(filters || {})
  
  // Construct cache key: articles:source:query:page:filters
  return `articles:${source}:${normalizedQuery}:p${page}:${filtersHash}`
}

/**
 * Get cache statistics
 * Useful for monitoring and debugging cache usage
 * 
 * @returns Object with cache statistics
 * 
 * @example
 * ```ts
 * const stats = await getCacheStats()
 * console.log(`Total cached keys: ${stats.keys}`)
 * ```
 */
export async function getCacheStats(): Promise<{
  keys: number  // Total number of keys in cache
}> {
  try {
    // Get database size (number of keys)
    const keys = await redis.dbsize()
    
    return {
      keys: keys || 0
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return { keys: 0 }
  }
}

/**
 * Clear all cache entries
 * ⚠️ USE WITH CAUTION! This deletes ALL cached data
 * 
 * Should only be used:
 * - During development/testing
 * - When cache is corrupted
 * - When data schema changes significantly
 * 
 * @example
 * ```ts
 * // In development only!
 * if (process.env.NODE_ENV === 'development') {
 *   await clearAllCache()
 * }
 * ```
 */
export async function clearAllCache(): Promise<void> {
  try {
    // FLUSHDB deletes all keys in current database
    await redis.flushdb()
    console.log('Cache limpo com sucesso')
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
  }
}
