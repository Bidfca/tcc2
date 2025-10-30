import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const analysisId = params.analysisId

    // Buscar análise garantindo que pertence ao usuário
    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id
        }
      }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análise não encontrada ou você não tem permissão para deletá-la' },
        { status: 404 }
      )
    }

    // Deletar análise
    await prisma.dataset.delete({
      where: {
        id: analysisId
      }
    })

    console.log(`✅ Análise ${analysisId} deletada por ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Análise deletada com sucesso'
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar análise:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao deletar análise',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
