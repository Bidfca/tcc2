import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  authenticated: boolean
  user?: {
    id: string
    email: string
    name?: string | null
  }
  error?: string
}

/**
 * Middleware de autenticação reutilizável
 * Verifica se o usuário está autenticado e retorna os dados
 */
export async function requireAuth(request?: NextRequest): Promise<AuthResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      logger.auth.failed('Tentativa de acesso não autenticado')
      return {
        authenticated: false,
        error: 'Não autorizado'
      }
    }

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
    logger.error('Erro na verificação de autenticação', error)
    return {
      authenticated: false,
      error: 'Erro ao verificar autenticação'
    }
  }
}

/**
 * Higher-order function para proteger rotas API
 * Uso: export const GET = withAuth(async (request, { user }) => { ... })
 */
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    context: { user: NonNullable<AuthResponse['user']>; params?: T }
  ) => Promise<Response>
) {
  return async (request: NextRequest, context?: { params?: T }) => {
    const auth = await requireAuth(request)
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Não autorizado' },
        { status: 401 }
      )
    }

    try {
      return await handler(request, { 
        user: auth.user, 
        params: context?.params 
      })
    } catch (error) {
      logger.error('Erro no handler da API', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware simplificado apenas para verificação
 * Retorna o usuário ou null
 */
export async function getAuthUser() {
  const auth = await requireAuth()
  return auth.authenticated ? auth.user : null
}

/**
 * Verificar se usuário está autenticado (retorna boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const auth = await requireAuth()
  return auth.authenticated
}
