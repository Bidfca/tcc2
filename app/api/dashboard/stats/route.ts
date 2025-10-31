import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET /api/dashboard/stats
 * Retorna estatísticas do dashboard do usuário
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    logger.info('Buscando estatísticas do dashboard', { userId })

    // Buscar análises realizadas
    const analysesCount = await prisma.dataset.count({
      where: {
        project: {
          ownerId: userId,
        },
      },
    })

    // Buscar artigos salvos
    const savedArticlesCount = await prisma.savedReference.count({
      where: {
        userId,
      },
    })

    // Para cálculos, vamos contar datasets que têm pelo menos 1 variável numérica
    // (isso indica que foi feita análise estatística)
    const datasets = await prisma.dataset.findMany({
      where: {
        project: {
          ownerId: userId,
        },
      },
      select: {
        data: true,
      },
    })

    let calculationsCount = 0
    for (const dataset of datasets) {
      try {
        const data = JSON.parse(dataset.data)
        if (data.numericStats && Object.keys(data.numericStats).length > 0) {
          calculationsCount++
        }
      } catch (e) {
        // Ignorar erros de parse
      }
    }

    const stats = {
      analysesCount,
      calculationsCount,
      savedArticlesCount,
    }

    logger.success('Estatísticas recuperadas', stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error('Erro ao buscar estatísticas do dashboard', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
