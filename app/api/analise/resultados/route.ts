import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCachedData, setCachedData } from '@/lib/cache'
import { getPaginationFromRequest, buildPaginatedResponse } from '@/lib/pagination'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 🚀 CACHE: Tentar buscar do cache primeiro
    const cacheKey = `resultados:${session.user.id}`
    const cachedResults = await getCachedData<{
      analyses: Array<{
        id: string;
        name: string;
        filename: string;
        data: string;
        metadata: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>(cacheKey)

    if (cachedResults) {
      console.log('✅ Cache HIT: Resultados encontrados no cache')
      return NextResponse.json({
        success: true,
        analyses: cachedResults.analyses,
        cached: true
      })
    }

    console.log('❌ Cache MISS: Buscando resultados do banco')

    // Get pagination parameters
    const pagination = getPaginationFromRequest(request)
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20)
    const take = pagination.limit || 20

    // Buscar análises pertencentes aos projetos do usuário com paginação
    const [analyses, total] = await Promise.all([
      prisma.dataset.findMany({
        where: {
          status: 'VALIDATED',
          project: {
            ownerId: session.user.id
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          filename: true,
          status: true,
          data: true,
          metadata: true,
          createdAt: true,
          projectId: true,
          project: {
            select: {
              name: true,
              id: true
            }
          }
        },
        skip,
        take
      }),
      prisma.dataset.count({
        where: {
          status: 'VALIDATED',
          project: {
            ownerId: session.user.id
          }
        }
      })
    ])

    // 💾 CACHE: Salvar no cache (5 minutos = 300s)
    const resultToCache = { analyses }
    await setCachedData(cacheKey, resultToCache, 300)
    console.log('💾 Resultados salvos no cache')

    // Build paginated response
    const paginatedResponse = buildPaginatedResponse(analyses, total, pagination)

    return NextResponse.json({
      success: true,
      ...paginatedResponse,
      cached: false
    })

  } catch (error) {
    console.error('Erro ao buscar análises:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
