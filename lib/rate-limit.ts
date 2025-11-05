/**
 * Rate Limiting Configuration
 * 
 * Implements rate limiting using Upstash Redis
 * Protects API endpoints from abuse and DDoS attacks
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    requests: 5,
    window: '1m', // 5 requests per minute
    message: 'Too many authentication attempts. Please try again later.'
  },
  // File upload endpoints
  UPLOAD: {
    requests: 10,
    window: '5m', // 10 uploads per 5 minutes
    message: 'Upload limit reached. Please wait before uploading more files.'
  },
  // General API endpoints
  API: {
    requests: 60,
    window: '1m', // 60 requests per minute
    message: 'Rate limit exceeded. Please slow down your requests.'
  },
  // Search endpoints
  SEARCH: {
    requests: 30,
    window: '1m', // 30 searches per minute
    message: 'Too many search requests. Please wait a moment.'
  }
} as const

/**
 * Create rate limiter instance
 * Only initializes if Redis credentials are available
 */
function createRateLimiter() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    console.warn('⚠️ Upstash Redis not configured. Rate limiting disabled.')
    return null
  }

  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken
    })

    return {
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIGS.AUTH.requests,
          RATE_LIMIT_CONFIGS.AUTH.window
        ),
        analytics: true
      }),
      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIGS.UPLOAD.requests,
          RATE_LIMIT_CONFIGS.UPLOAD.window
        ),
        analytics: true
      }),
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIGS.API.requests,
          RATE_LIMIT_CONFIGS.API.window
        ),
        analytics: true
      }),
      search: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIGS.SEARCH.requests,
          RATE_LIMIT_CONFIGS.SEARCH.window
        ),
        analytics: true
      })
    }
  } catch (error) {
    console.error('❌ Failed to initialize rate limiter:', error)
    return null
  }
}

// Singleton instance
const rateLimiters = createRateLimiter()

/**
 * Get identifier for rate limiting
 * Uses IP address or fallback to a default identifier
 */
function getIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp
  
  // Fallback to a generic identifier if no IP found
  return ip || 'anonymous'
}

/**
 * Rate limit types
 */
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

/**
 * Apply rate limiting to a request
 * 
 * @param request - The incoming request
 * @param type - Type of rate limit to apply
 * @returns Response if rate limited, null otherwise
 */
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'API'
): Promise<NextResponse | null> {
  // If rate limiting is not configured, allow all requests
  if (!rateLimiters) {
    return null
  }

  const limiterType = type.toLowerCase() as keyof typeof rateLimiters
  const limiter = rateLimiters[limiterType]
  
  if (!limiter) {
    console.warn(`Rate limiter type "${type}" not found`)
    return null
  }

  const identifier = getIdentifier(request)
  
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier)
    
    if (!success) {
      // Rate limit exceeded
      console.warn(`🚫 Rate limit exceeded for ${identifier} on ${type} endpoint`)
      
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: RATE_LIMIT_CONFIGS[type].message,
          retryAfter: reset
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    // Rate limit check passed
    return null
  } catch (error) {
    // If rate limiting fails, log error but don't block request
    console.error('❌ Rate limit check failed:', error)
    return null
  }
}

/**
 * Middleware helper for rate limiting
 * Use this in API routes
 * 
 * @example
 * // In an API route
 * import { withRateLimit } from '@/lib/rate-limit'
 * 
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await withRateLimit(request, 'AUTH')
 *   if (rateLimitResponse) return rateLimitResponse
 *   
 *   // Your API logic here
 * }
 */
export async function withRateLimit(
  request: NextRequest,
  type: RateLimitType = 'API'
): Promise<NextResponse | null> {
  return rateLimit(request, type)
}
