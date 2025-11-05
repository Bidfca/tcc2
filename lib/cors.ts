/**
 * CORS Configuration
 * 
 * Centralized CORS settings for the application
 * Provides security by controlling which origins can access the API
 */

/**
 * Allowed origins for CORS
 * In production, this should be restricted to actual domains
 */
export const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? [
      process.env.NEXTAUTH_URL || 'https://agroinsight.vercel.app',
      'https://agroinsight.com',
      'https://www.agroinsight.com'
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ]

/**
 * CORS Headers configuration
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400', // 24 hours
}

/**
 * Get CORS headers for a specific origin
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  // Check if origin is allowed
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    // Allow Vercel preview URLs in development
    (process.env.NODE_ENV === 'development' && origin.includes('vercel.app'))
  )

  if (isAllowed && origin) {
    return {
      ...CORS_HEADERS,
      'Access-Control-Allow-Origin': origin,
    }
  }

  // For requests without origin (e.g., server-side requests)
  // or disallowed origins, don't set Access-Control-Allow-Origin
  return process.env.NODE_ENV === 'development' 
    ? {
        ...CORS_HEADERS,
        'Access-Control-Allow-Origin': '*', // Allow all in development
      }
    : {}
}

/**
 * Middleware to handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(origin) as HeadersInit
    })
  }
  return null
}
