import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { analyzeDataset } from '@/lib/dataAnalysis'
import { invalidateCache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Apenas arquivos CSV são aceitos' }, { status: 400 })
    }

    // Ler conteúdo do arquivo
    const fileContent = await file.text()
    
    // Parse do CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Erro ao processar CSV: ' + parseResult.errors[0].message 
      }, { status: 400 })
    }

    const data = parseResult.data as Record<string, unknown>[]
    
    if (data.length === 0) {
      return NextResponse.json({ 
        error: 'Arquivo CSV vazio ou sem dados válidos' 
      }, { status: 400 })
    }

    // Usar o novo sistema de análise
    const analysisResult = analyzeDataset(data)
    
    // Filtrar apenas variáveis zootécnicas
    const zootechnicalVariables = Object.entries(analysisResult.variablesInfo)
      .filter(([, info]) => info.isZootechnical)
      .map(([name]) => name)
    
    // Contar registros válidos
    const validRows = data.filter(row => 
      Object.values(row).some(val => val !== null && val !== undefined && val !== '')
    ).length

    // Garantir projeto do usuário (usa o primeiro existente ou cria um padrão)
    let userProject = await prisma.project.findFirst({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'asc' }
    })

    if (!userProject) {
      userProject = await prisma.project.create({
        data: {
          name: 'Meu Projeto',
          ownerId: session.user.id
        }
      })
    }

    // Salvar análise no banco de dados vinculado ao projeto do usuário
    const analysis = await prisma.dataset.create({
      data: {
        name: file.name,
        filename: file.name,
        projectId: userProject.id,
        status: 'VALIDATED',
        data: JSON.stringify({
          rawData: data.slice(0, 100), // Salvar apenas os primeiros 100 registros para economia
          variablesInfo: analysisResult.variablesInfo,
          numericStats: analysisResult.numericStats,
          categoricalStats: analysisResult.categoricalStats,
          zootechnicalVariables
        }),
        metadata: JSON.stringify({
          uploadedBy: session.user.id,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          totalRows: analysisResult.totalRows,
          totalColumns: analysisResult.totalColumns,
          validRows,
          zootechnicalCount: zootechnicalVariables.length
        })
      }
    })

    // 🗑️ CACHE: Invalidar cache de resultados do usuário
    const cacheKey = `resultados:${session.user.id}`
    await invalidateCache(cacheKey)
    console.log('🗑️ Cache de resultados invalidado')

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      totalRows: analysisResult.totalRows,
      totalColumns: analysisResult.totalColumns,
      validRows,
      zootechnicalVariables,
      variablesInfo: analysisResult.variablesInfo,
      numericStats: analysisResult.numericStats,
      categoricalStats: analysisResult.categoricalStats,
      message: 'Arquivo analisado com sucesso!'
    })

  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
}
