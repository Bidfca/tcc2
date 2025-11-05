import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeCorrelations, proposeCorrelations, getMissingVariables } from '@/lib/correlations/correlation-analysis'

export const dynamic = 'force-dynamic'

/**
 * POST /api/analysis/correlations
 * Analyze correlations for a dataset
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { datasetId, species, options } = body

    if (!datasetId || !species) {
      return NextResponse.json(
        { error: 'datasetId e species são obrigatórios' },
        { status: 400 }
      )
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: {
        project: {
          include: {
            owner: true
          }
        }
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset não encontrado' },
        { status: 404 }
      )
    }

    if (dataset.project.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const datasetData = JSON.parse(dataset.data)
    const rawData = datasetData.raw || []

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { error: 'Dataset não contém dados brutos para análise' },
        { status: 400 }
      )
    }

    const correlationReport = analyzeCorrelations(rawData, species, options)

    const numericColumns = Object.keys(rawData[0] || {}).filter(
      key => typeof rawData[0][key] === 'number'
    )
    const proposals = proposeCorrelations(numericColumns, species)
    const missingVariables = getMissingVariables(numericColumns, species)

    const updatedData = {
      ...datasetData,
      correlations: {
        report: correlationReport,
        proposals,
        missingVariables,
        analyzedAt: new Date().toISOString()
      }
    }

    await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        data: JSON.stringify(updatedData)
      }
    })

    return NextResponse.json({
      success: true,
      correlations: correlationReport,
      proposals,
      missingVariables
    })

  } catch (error) {
    console.error('❌ Erro na análise de correlações:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise de correlações' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analysis/correlations?datasetId=xxx
 * Get correlation analysis for a dataset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('datasetId')

    if (!datasetId) {
      return NextResponse.json(
        { error: 'datasetId é obrigatório' },
        { status: 400 }
      )
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: {
        project: {
          include: {
            owner: true
          }
        }
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset não encontrado' },
        { status: 404 }
      )
    }

    if (dataset.project.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const datasetData = JSON.parse(dataset.data)
    const correlations = datasetData.correlations || null

    if (!correlations) {
      return NextResponse.json(
        { error: 'Análise de correlações não encontrada para este dataset' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      correlations: correlations.report,
      proposals: correlations.proposals,
      missingVariables: correlations.missingVariables,
      analyzedAt: correlations.analyzedAt
    })

  } catch (error) {
    console.error('❌ Erro ao buscar correlações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar análise de correlações' },
      { status: 500 }
    )
  }
}
