import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gerarDiagnosticoLocal } from '@/lib/diagnostico-local'
import { getCachedData, setCachedData } from '@/lib/cache'

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

    // 🚀 CACHE: Tentar buscar do cache primeiro
    const cacheKey = `diagnostico:${analysisId}`
    const cachedDiagnostico = await getCachedData<any>(cacheKey)

    if (cachedDiagnostico) {
      console.log('✅ Cache HIT: Diagnóstico encontrado no cache')
      return NextResponse.json({
        success: true,
        diagnostico: cachedDiagnostico.diagnostico,
        geradoEm: cachedDiagnostico.geradoEm,
        metodo: cachedDiagnostico.metodo,
        cached: true
      })
    }

    console.log('❌ Cache MISS: Gerando novo diagnóstico')

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

    // Preparar resposta
    const response = {
      diagnostico,
      geradoEm: new Date().toISOString(),
      metodo: 'Análise baseada em referências zootécnicas (EMBRAPA, NRC)'
    }

    // 💾 CACHE: Salvar no cache (24 horas = 86400s)
    await setCachedData(cacheKey, response, 86400)
    console.log('💾 Diagnóstico salvo no cache')

    return NextResponse.json({
      success: true,
      ...response,
      cached: false
    })

  } catch (error) {
    console.error('❌ Erro ao gerar diagnóstico:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar diagnóstico. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
