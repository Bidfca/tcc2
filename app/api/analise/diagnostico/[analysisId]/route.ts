import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gerarDiagnosticoLocal } from '@/lib/diagnostico-local'

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const analysisId = params.analysisId

    // Buscar análise no banco garantindo propriedade do projeto
    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id
        }
      }
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    const data = JSON.parse(analysis.data)
    const metadata = analysis.metadata ? JSON.parse(analysis.metadata) : {}

    console.log('🔍 Gerando diagnóstico local (baseado em regras)...')
    console.log('📊 Total de variáveis:', Object.keys(data.numericStats || {}).length)

    // Gerar diagnóstico com regras baseadas em literatura zootécnica
    const diagnostico = gerarDiagnosticoLocal(
      data.numericStats || {},
      data.categoricalStats || {},
      analysis.name,
      metadata.totalRows || 0
    )

    console.log('✅ Diagnóstico gerado com sucesso')

    return NextResponse.json({
      success: true,
      diagnostico,
      geradoEm: new Date().toISOString(),
      metodo: 'Análise baseada em referências zootécnicas (EMBRAPA, NRC)'
    })

  } catch (error: any) {
    console.error('❌ Erro ao gerar diagnóstico:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar diagnóstico. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
