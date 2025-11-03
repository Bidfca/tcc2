import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

/**
 * Cliente Redis para rate limiting
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Prefixes para cada tipo de rate limiter
 */
export const rateLimitPrefixes = {
  analysis: 'ratelimit:analysis',
  diagnostic: 'ratelimit:diagnostic',
  search: 'ratelimit:search',
  general: 'ratelimit:general',
  upload: 'ratelimit:upload',
  auth: 'ratelimit:auth',
} as const

/**
 * Configurações de rate limit por tipo de endpoint
 */
export const rateLimiters = {
  // Endpoints de análise - mais restritivo
  analysis: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requisições por hora
    analytics: true,
    prefix: rateLimitPrefixes.analysis,
  }),

  // Endpoints de diagnóstico - muito restritivo (processamento pesado)
  diagnostic: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 requisições por hora
    analytics: true,
    prefix: rateLimitPrefixes.diagnostic,
  }),

  // Busca de artigos - moderado
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requisições por hora
    analytics: true,
    prefix: rateLimitPrefixes.search,
  }),

  // Endpoints gerais - mais permissivo
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 h'), // 200 requisições por hora
    analytics: true,
    prefix: rateLimitPrefixes.general,
  }),

  // Upload - muito restritivo
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 uploads por hora
    analytics: true,
    prefix: rateLimitPrefixes.upload,
  }),

  // Auth - proteção contra brute force
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 tentativas a cada 15 minutos
    analytics: true,
    prefix: rateLimitPrefixes.auth,
  }),
}

/**
 * Tipo de rate limiter
 */
export type RateLimitType = keyof typeof rateLimiters

/**
 * Verificar rate limit para um identificador
 * @param identifier - Identificador único (geralmente user ID ou IP)
 * @param type - Tipo de rate limiter a ser usado
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'general'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}> {
  try {
    const ratelimiter = rateLimiters[type]
    const { success, limit, remaining, reset } = await ratelimiter.limit(identifier)

    if (!success) {
      const retryAfter = Math.floor((reset - Date.now()) / 1000)
      logger.warn(`Rate limit excedido para ${identifier} (${type})`, {
        limit,
        remaining,
        retryAfter
      })

      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfter
      }
    }

    logger.debug(`Rate limit OK para ${identifier} (${type})`, {
      limit,
      remaining,
      reset
    })

    return {
      success: true,
      limit,
      remaining,
      reset
    }
  } catch (error) {
    logger.error('Erro ao verificar rate limit', error)
    // Em caso de erro, permitir a requisição (fail-open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now()
    }
  }
}

/**
 * Middleware para aplicar rate limiting
 * @param identifier - Identificador único
 * @param type - Tipo de rate limiter
 * @returns Response de erro se excedeu o limite, null caso contrário
 */
export async function applyRateLimit(
  identifier: string,
  type: RateLimitType = 'general'
): Promise<Response | null> {
  const result = await checkRateLimit(identifier, type)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit excedido',
        message: `Você excedeu o limite de requisições. Tente novamente em ${result.retryAfter} segundos.`,
        limit: result.limit,
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': result.retryAfter?.toString() || '3600',
        },
      }
    )
  }

  return null
}

/**
 * Higher-order function para proteger rotas com rate limiting
 * Uso: export const POST = withRateLimit('upload', async (request, { user }) => { ... })
 */
export function withRateLimit<T = Record<string, string>>(
  type: RateLimitType,
  handler: (
    request: Request,
    context: { params?: T; rateLimit: { remaining: number; limit: number } }
  ) => Promise<Response>
) {
  return async (request: Request, context?: { params?: T }) => {
    // Extrair identificador da requisição (IP ou user ID do header)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'anonymous'
    const identifier = ip

    const result = await checkRateLimit(identifier, type)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit excedido',
          message: `Você excedeu o limite de ${result.limit} requisições. Tente novamente em ${result.retryAfter} segundos.`,
          limit: result.limit,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': result.retryAfter?.toString() || '3600',
          },
        }
      )
    }

    // Adicionar headers de rate limit na resposta
    const response = await handler(request, {
      params: context?.params,
      rateLimit: {
        remaining: result.remaining,
        limit: result.limit
      }
    })

    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())

    return response
  }
}

/**
 * Obter informações de rate limit sem consumir uma requisição
 */
export async function getRateLimitInfo(
  identifier: string,
  type: RateLimitType = 'general'
): Promise<{ limit: number; remaining: number; reset: number } | null> {
  try {
    const key = `${rateLimitPrefixes[type]}:${identifier}`
    const data = await redis.get(key)
    
    if (!data) {
      return null
    }

    // Parsear dados do rate limit
    return data as { limit: number; remaining: number; reset: number }
  } catch (error) {
    logger.error('Erro ao obter informações de rate limit', error)
    return null
  }
}
