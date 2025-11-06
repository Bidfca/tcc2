/**
 * EN: Multi-species analysis API endpoint - handles species-aware data upload and validation
 * PT-BR: Endpoint de API de análise multi-espécie - gerencia upload e validação de dados com consciência de espécie
 * 
 * EN: This endpoint processes CSV uploads for different animal species (bovine, swine, poultry, etc.),
 *     validates data against species-specific reference ranges from NRC/EMBRAPA, calculates statistics,
 *     analyzes correlations, and stores results in the database.
 * PT-BR: Este endpoint processa uploads CSV para diferentes espécies animais (bovinos, suínos, aves, etc.),
 *        valida dados contra faixas de referência específicas da espécie do NRC/EMBRAPA, calcula estatísticas,
 *        analisa correlações e armazena resultados no banco de dados.
 */
// app/api/analysis/multi-species/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'
import Papa from 'papaparse'
import { validateUploadedFile, generateUniqueFilename } from '@/lib/upload-security'
import { withRateLimit } from '@/lib/rate-limit'
import { analyzeCorrelations, proposeCorrelations, getMissingVariables } from '@/lib/correlations/correlation-analysis'

/**
 * EN: POST handler for multi-species data analysis
 * PT-BR: Handler POST para análise de dados multi-espécie
 * 
 * @param request - EN: FormData with file, species, subtype, projectId | PT-BR: FormData com file, species, subtype, projectId
 * @returns EN: Analysis results with statistics, references, and correlations | PT-BR: Resultados da análise com estatísticas, referências e correlações
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, 'UPLOAD')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const species = formData.get('species') as string
    const subtype = formData.get('subtype') as string | null
    const projectId = formData.get('projectId') as string

    if (!file || !species) {
      return NextResponse.json(
        { error: 'Arquivo e espécie são obrigatórios' },
        { status: 400 }
      )
    }

    // Security validation
    const securityCheck = await validateUploadedFile(file, 'csv')
    if (!securityCheck.valid) {
      console.warn('🚫 Security check failed:', securityCheck.error)
      return NextResponse.json({ 
        error: securityCheck.error,
        warnings: securityCheck.warnings 
      }, { status: 400 })
    }

    const secureFilename = generateUniqueFilename(file.name)

    console.log('📊 Iniciando análise multi-espécie:', { species, subtype })

    // Parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      console.error('❌ Erros no CSV:', parsed.errors)
      return NextResponse.json(
        { error: 'Erro ao processar CSV', details: parsed.errors },
        { status: 400 }
      )
    }

    // Validação básica dos dados
    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      )
    }

    // Análise estatística básica
    const statistics = calculateBasicStatistics(parsed.data as Record<string, number>[])
    
    // Comparação com referências
    const references = ReferenceDataService.compareMultipleMetrics(
      statistics.means,
      species,
      subtype || undefined
    )
    
    // Interpretação
    const interpretation = generateBasicInterpretation(
      statistics,
      references,
      species
    )

    // Análise de correlações
    console.log('🔬 Analisando correlações biologicamente relevantes...')
    const correlationReport = analyzeCorrelations(
      parsed.data as Record<string, unknown>[],
      species,
      {
        maxCorrelations: 20,
        minRelevanceScore: 5,
        minDataPoints: 10,
        significanceLevel: 0.05
      }
    )

    const rows = (parsed.data ?? []) as Array<Record<string, unknown>>
    const firstRow = rows[0] ?? {}
    const availableColumns = Object.keys(firstRow)
    
    const correlationProposals = proposeCorrelations(availableColumns, species)
    const missingVariables = getMissingVariables(availableColumns, species)

    console.log(`✅ Encontradas ${correlationReport.totalCorrelations} correlações (${correlationReport.significantCorrelations} significativas)`)

    // Se não tem projectId, usar o primeiro projeto do usuário
    let finalProjectId = projectId
    if (!finalProjectId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
          projects: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (user?.projects[0]) {
        finalProjectId = user.projects[0].id
      } else {
        // Criar projeto padrão
        const newProject = await prisma.project.create({
          data: {
            name: 'Análise Multi-Espécie',
            description: 'Projeto criado automaticamente',
            ownerId: user!.id
          }
        })
        finalProjectId = newProject.id
      }
    }

    // Salvar no banco de dados
    const analysis = await prisma.dataset.create({
      data: {
        projectId: finalProjectId,
        name: `${species}${subtype ? ` - ${subtype}` : ''} - ${new Date().toLocaleDateString('pt-BR')}`,
        filename: secureFilename,
        status: 'VALIDATED',
        data: JSON.stringify({
          raw: parsed.data.slice(0, 100), // Limitar dados brutos para economia de espaço
          statistics,
          references,
          interpretation,
          correlations: {
            report: correlationReport,
            proposals: correlationProposals,
            missingVariables,
            analyzedAt: new Date().toISOString()
          }
        }),
        metadata: JSON.stringify({
          species,
          subtype,
          totalRows: parsed.data.length,
          totalColumns: Object.keys(parsed.data[0] || {}).length,
          analyzedAt: new Date().toISOString(),
          version: '2.0'
        })
      }
    })

    console.log('✅ Análise salva com ID:', analysis.id)

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        name: analysis.name,
        species,
        subtype,
        statistics,
        references: references.comparisons,
        overallStatus: references.overallStatus,
        summary: references.summary,
        interpretation,
        correlations: {
          total: correlationReport.totalCorrelations,
          significant: correlationReport.significantCorrelations,
          highRelevance: correlationReport.highRelevanceCorrelations,
          topCorrelations: correlationReport.topCorrelations.slice(0, 5)
        },
        createdAt: analysis.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Erro na análise multi-espécie:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}

/**
 * EN: Calculate basic statistical measures for all numeric columns in the dataset
 * PT-BR: Calcular medidas estatísticas básicas para todas as colunas numéricas no conjunto de dados
 * 
 * @param data - EN: Array of data rows with numeric values | PT-BR: Array de linhas de dados com valores numéricos
 * @returns EN: Statistics object with means, medians, standard deviations, CVs, mins, maxs, counts | PT-BR: Objeto de estatísticas com médias, medianas, desvios padrão, CVs, mínimos, máximos, contagens
 */
function calculateBasicStatistics(data: Record<string, number>[]) {
  const numericColumns = Object.keys(data[0] || {}).filter(
    key => typeof data[0][key] === 'number'
  )
  
  const stats = {
    means: {} as Record<string, number>,
    medians: {} as Record<string, number>,
    stdDevs: {} as Record<string, number>,
    cvs: {} as Record<string, number>,
    mins: {} as Record<string, number>,
    maxs: {} as Record<string, number>,
    counts: {} as Record<string, number>
  }
  
  for (const col of numericColumns) {
    const values = data.map(row => row[col]).filter((v): v is number => v !== null && !isNaN(v))
    
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const sorted = [...values].sort((a, b) => a - b)
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      const cv = (stdDev / mean) * 100
      
      stats.means[col] = Number(mean.toFixed(2))
      stats.medians[col] = Number(median.toFixed(2))
      stats.stdDevs[col] = Number(stdDev.toFixed(2))
      stats.cvs[col] = Number(cv.toFixed(1))
      stats.mins[col] = Math.min(...values)
      stats.maxs[col] = Math.max(...values)
      stats.counts[col] = values.length
    }
  }
  
  return stats
}

/**
 * EN: Generate human-readable interpretation of analysis results with insights and recommendations
 * PT-BR: Gerar interpretação legível dos resultados da análise com insights e recomendações
 * 
 * EN: Analyzes validation results and statistics to provide actionable insights and species-specific recommendations
 * PT-BR: Analisa resultados de validação e estatísticas para fornecer insights acionáveis e recomendações específicas da espécie
 * 
 * @param stats - EN: Statistical measures | PT-BR: Medidas estatísticas
 * @param references - EN: Reference comparison results | PT-BR: Resultados de comparação de referência
 * @param species - EN: Animal species code | PT-BR: Código da espécie animal
 * @returns EN: Interpretation with insights, recommendations, and summary | PT-BR: Interpretação com insights, recomendações e resumo
 */
function generateBasicInterpretation(
  stats: ReturnType<typeof calculateBasicStatistics>,
  references: ReturnType<typeof ReferenceDataService.compareMultipleMetrics>,
  species: string
) {
  const insights: string[] = []
  const recommendations: string[] = []
  
  // Análise geral do status
  if (references.overallStatus === 'excellent') {
    insights.push('✅ Os indicadores gerais estão excelentes!')
  } else if (references.overallStatus === 'good') {
    insights.push('👍 Os indicadores estão dentro dos parâmetros aceitáveis')
  } else if (references.overallStatus === 'attention') {
    insights.push('⚠️ Alguns indicadores necessitam atenção')
  }
  
  // Análise específica por métrica com problemas
  references.comparisons.forEach((comp) => {
    if (comp.validation.status === 'below_minimum' || comp.validation.status === 'above_maximum') {
      insights.push(`❗ ${comp.metric}: ${comp.value} ${comp.validation.reference?.unit || ''} - ${comp.validation.message}`)
      
      // Recomendações específicas por espécie
      if (species === 'bovine' && comp.metric === 'producao_leite' && comp.validation.status === 'below_minimum') {
        recommendations.push('📌 Revisar nutrição: aumentar proteína na dieta e verificar qualidade da silagem')
      }
      if (species === 'poultry' && comp.metric === 'mortalidade' && comp.validation.status === 'above_maximum') {
        recommendations.push('📌 Revisar programa sanitário e condições ambientais do galpão')
      }
      if (species === 'swine' && comp.metric === 'conversao' && comp.validation.status === 'above_maximum') {
        recommendations.push('📌 Otimizar formulação da ração e revisar manejo alimentar')
      }
    }
  })
  
  // Análise de variabilidade (CV)
  const highVariability = Object.entries(stats.cvs)
    .filter(([, cv]) => (cv as number) > 35)
    .map(([metric, cv]) => `${metric} (CV: ${cv}%)`)
  
  if (highVariability.length > 0) {
    insights.push(`📊 Alta variabilidade detectada em: ${highVariability.join(', ')}`)
    recommendations.push('📌 Melhorar uniformidade do lote através de classificação e manejo específico')
  }
  
  return {
    insights,
    recommendations,
    summary: {
      totalMetrics: references.comparisons.length,
      excellent: references.summary.excellent,
      good: references.summary.good,
      attention: references.summary.attention,
      noReference: references.summary.noReference
    }
  }
}
