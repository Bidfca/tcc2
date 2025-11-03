/**
 * Authentication Middleware Utilities for AgroInsight
 * 
 * This module provides reusable authentication helpers for API routes and server components.
 * It wraps NextAuth session management with a consistent interface.
 * 
 * Key features:
 * - requireAuth() - Validates user session
 * - withAuth() - HOF to protect API routes
 * - getAuthUser() - Simple user retrieval
 * - isAuthenticated() - Boolean auth check
 * 
 * Usage in API routes:
 * ```ts
 * export const GET = withAuth(async (request, { user }) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ userId: user.id })
 * })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

/**
 * Authentication response interface
 * 
 * Standardized response format for all auth operations
 */
export interface AuthResponse {
  authenticated: boolean   // Whether the user is authenticated
  user?: {                 // User data if authenticated
    id: string             // User ID from database
    email: string          // User email
    name?: string | null   // Optional display name
  }
  error?: string          // Error message if authentication failed
}

/**
 * Reusable authentication middleware
 * 
 * Checks if the user has a valid session and returns user data.
 * This is the core authentication check used by all other utilities.
 * 
 * @param request - Optional NextRequest (not currently used, reserved for future)
 * @returns AuthResponse object with authentication status and user data
 * 
 * @example
 * ```ts
 * const auth = await requireAuth()
 * if (!auth.authenticated) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthResponse> {
  try {
    // Retrieve the current session from NextAuth
    // This works in both API routes and server components
    const session = await getServerSession(authOptions)
    
    // No session found - user is not authenticated
    if (!session?.user) {
      logger.auth.failed('Tentativa de acesso não autenticado')
      return {
        authenticated: false,
        error: 'Não autorizado'
      }
    }

    // Session found - user is authenticated
    logger.debug(`Usuário autenticado: ${session.user.email}`)
    
    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name
      }
    }
  } catch (error) {
    // Handle any errors during session retrieval
    logger.error('Erro na verificação de autenticação', error)
    return {
      authenticated: false,
      error: 'Erro ao verificar autenticação'
    }
  }
}

/**
 * Higher-order function to protect API routes with authentication
 * 
 * This is a wrapper that automatically checks authentication before
 * executing your handler. If not authenticated, returns 401.
 * 
 * @param handler - Your API route handler function
 * @returns Wrapped handler with authentication check
 * 
 * @example
 * ```ts
 * // In your API route file (e.g., app/api/data/route.ts)
 * export const GET = withAuth(async (request, { user }) => {
 *   // This code only runs if user is authenticated
 *   const data = await prisma.data.findMany({
 *     where: { userId: user.id }
 *   })
 *   return NextResponse.json(data)
 * })
 * ```
 */
export function withAuth<T = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { user: NonNullable<AuthResponse['user']>; params?: T }
  ) => Promise<Response>
) {
  // Return an async function that Next.js will call
  return async (request: NextRequest, context?: { params?: T }) => {
    // Check authentication first
    const auth = await requireAuth()
    
    // If not authenticated, return 401 immediately
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Não autorizado' },
        { status: 401 }
      )
    }

    // User is authenticated - execute the actual handler
    try {
      return await handler(request, { 
        user: auth.user,           // Pass authenticated user
        params: context?.params    // Pass route params if any
      })
    } catch (error) {
      // Log and return 500 for any handler errors
      logger.error('Erro no handler da API', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Simplified authentication check
 * 
 * Returns the authenticated user or null.
 * Useful when you just need the user data without full auth response.
 * 
 * @returns User object if authenticated, null otherwise
 * 
 * @example
 * ```ts
 * const user = await getAuthUser()
 * if (user) {
 *   console.log(`Current user: ${user.email}`)
 * }
 * ```
 */
export async function getAuthUser() {
  const auth = await requireAuth()
  return auth.authenticated ? auth.user : null
}

/**
 * Simple boolean authentication check
 * 
 * Returns true if user is authenticated, false otherwise.
 * Useful for conditional logic without needing user data.
 * 
 * @returns Boolean indicating authentication status
 * 
 * @example
 * ```ts
 * if (await isAuthenticated()) {
 *   // Show authenticated content
 * } else {
 *   // Show sign-in prompt
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const auth = await requireAuth()
  return auth.authenticated
}
