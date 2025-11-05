// app/api/reference/[species]/data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'

/**
 * GET /api/reference/[species]/data
 * Retorna dados de referência para uma espécie específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { species: string } }
) {
  try {
    const { species } = params
    const searchParams = request.nextUrl.searchParams
    const subtype = searchParams.get('subtype')
    const metric = searchParams.get('metric')
    
    console.log('🔍 Buscando referências:', { species, subtype, metric })

    // Primeiro, tenta buscar do banco de dados (se disponível)
    let speciesRecord = null
    try {
      speciesRecord = await prisma.animalSpecies.findUnique({
        where: { code: species }
      })
    } catch (dbError) {
      // Se Prisma falhar (ex: DATABASE_URL não configurado), continua para hardcoded
      console.warn('⚠️ Banco de dados não disponível, usando dados hardcoded:', dbError)
    }
    
    if (!speciesRecord) {
      // Se não encontrar no banco, usa dados hardcoded
      const hardcodedData = ReferenceDataService.getReference(
        species,
        subtype || undefined,
        metric || undefined
      )
      
      if (!hardcodedData) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Espécie não encontrada' 
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        source: 'hardcoded',
        data: hardcodedData,
        species,
        subtype,
        metric
      })
    }
    
    // Buscar referências do banco de dados
    const whereClause: {
      speciesId: string
      subtypeId?: string | null
      metric?: string
    } = {
      speciesId: speciesRecord.id
    }
    
    // Se tiver subtipo, buscar o ID do subtipo
    if (subtype) {
      const subtypeRecord = await prisma.animalSubtype.findFirst({
        where: {
          speciesId: speciesRecord.id,
          code: subtype
        }
      })
      
      if (subtypeRecord) {
        whereClause.subtypeId = subtypeRecord.id
      }
    }
    
    // Se tiver métrica específica
    if (metric) {
      whereClause.metric = metric
    }
    
    const dbReferences = await prisma.referenceData.findMany({
      where: whereClause,
      include: {
        species: {
          select: {
            name: true,
            code: true
          }
        },
        subtype: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })
    
    // Se não encontrar no banco mas temos hardcoded, usar hardcoded
    if (dbReferences.length === 0) {
      const hardcodedData = ReferenceDataService.getReference(
        species,
        subtype || undefined,
        metric || undefined
      )
      
      if (hardcodedData) {
        return NextResponse.json({
          success: true,
          source: 'hardcoded',
          data: hardcodedData,
          species,
          subtype,
          metric
        })
      }
      
      // Nenhum dado encontrado
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhuma referência encontrada para os parâmetros especificados' 
        },
        { status: 404 }
      )
    }
    
    // Formatar os dados do banco
    const formattedData: Record<string, {
      min: number | null
      ideal_min: number | null
      ideal_max: number | null
      max: number | null
      unit: string
      source: string
      description: string | null
      speciesName: string
      subtypeName?: string | null
    }> = {}
    
    dbReferences.forEach(ref => {
      formattedData[ref.metric] = {
        min: ref.minValue,
        ideal_min: ref.idealMinValue,
        ideal_max: ref.idealMaxValue,
        max: ref.maxValue,
        unit: ref.unit,
        source: ref.source,
        description: ref.description,
        speciesName: ref.species.name,
        subtypeName: ref.subtype?.name
      }
    })
    
    // Se solicitou métrica específica, retornar apenas ela
    if (metric && formattedData[metric]) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: formattedData[metric],
        species: speciesRecord.name,
        speciesCode: species,
        subtype: dbReferences[0].subtype?.name,
        subtypeCode: subtype,
        metric
      })
    }
    
    return NextResponse.json({
      success: true,
      source: 'database',
      data: formattedData,
      species: speciesRecord.name,
      speciesCode: species,
      subtype: dbReferences[0]?.subtype?.name,
      subtypeCode: subtype,
      count: dbReferences.length
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar referências:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar dados de referência' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reference/[species]/data
 * Adiciona nova referência para uma espécie
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { species: string } }
) {
  try {
    const { species } = params
    const body = await request.json()
    
    // Verificar se a espécie existe
    const speciesRecord = await prisma.animalSpecies.findUnique({
      where: { code: species }
    })
    
    if (!speciesRecord) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Espécie não encontrada' 
        },
        { status: 404 }
      )
    }
    
    // Se tiver subtipo, verificar se existe
    let subtypeId = null
    if (body.subtype) {
      const subtypeRecord = await prisma.animalSubtype.findFirst({
        where: {
          speciesId: speciesRecord.id,
          code: body.subtype
        }
      })
      
      if (!subtypeRecord) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Subtipo não encontrado' 
          },
          { status: 404 }
        )
      }
      
      subtypeId = subtypeRecord.id
    }
    
    // Verificar se já existe essa referência
    const existing = await prisma.referenceData.findFirst({
      where: {
        speciesId: speciesRecord.id,
        subtypeId,
        metric: body.metric
      }
    })
    
    if (existing) {
      // Atualizar existente
      const updated = await prisma.referenceData.update({
        where: { id: existing.id },
        data: {
          minValue: body.minValue,
          idealMinValue: body.idealMinValue,
          idealMaxValue: body.idealMaxValue,
          maxValue: body.maxValue,
          unit: body.unit,
          source: body.source,
          description: body.description
        }
      })
      
      return NextResponse.json({
        success: true,
        action: 'updated',
        reference: updated
      })
    }
    
    // Criar nova referência
    const reference = await prisma.referenceData.create({
      data: {
        speciesId: speciesRecord.id,
        subtypeId,
        metric: body.metric,
        minValue: body.minValue,
        idealMinValue: body.idealMinValue,
        idealMaxValue: body.idealMaxValue,
        maxValue: body.maxValue,
        unit: body.unit,
        source: body.source,
        description: body.description
      }
    })
    
    return NextResponse.json({
      success: true,
      action: 'created',
      reference
    })
    
  } catch (error) {
    console.error('❌ Erro ao adicionar referência:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao adicionar referência' 
      },
      { status: 500 }
    )
  }
}
