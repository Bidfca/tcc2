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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 🚀 CACHE: Tentar buscar do cache primeiro
    const cacheKey = `articles:saved:${session.user.id}`
    const cachedArticles = await getCachedData<{
      articles: Array<{
        id: string;
        title: string;
        authors: string[];
        year: number;
        abstract: string;
        journal: string;
        doi: string | null;
        url: string | null;
        keywords: string[];
        source: string;
        savedAt: string;
      }>;
      total: number;
    }>(cacheKey)

    if (cachedArticles) {
      console.log('✅ Cache HIT: Artigos salvos encontrados no cache')
      return NextResponse.json({
        success: true,
        articles: cachedArticles.articles,
        total: cachedArticles.total,
        cached: true
      })
    }

    console.log('❌ Cache MISS: Buscando artigos salvos do banco')

    // Get pagination parameters
    const pagination = getPaginationFromRequest(request)
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20)
    const take = pagination.limit || 20

    // Buscar artigos salvos do usuário com paginação
    const [savedReferences, total] = await Promise.all([
      prisma.savedReference.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.savedReference.count({
        where: {
          userId: session.user.id
        }
      })
    ])

    // Converter para formato esperado pelo frontend
    const articles = savedReferences.map(ref => {
      // Parse de authors e keywords (que são JSON)
      let authorsArray = []
      try {
        const authorsParsed = JSON.parse(ref.authors || '[]')
        // Validar se é array antes de mapear
        if (Array.isArray(authorsParsed)) {
          authorsArray = authorsParsed.map((a: string | { name?: string }) => 
            typeof a === 'string' ? a : a.name || 'Autor não disponível'
          )
        } else {
          authorsArray = ['Autor não disponível']
        }
      } catch (e) {
        console.error('Erro ao parsear authors:', e)
        authorsArray = ['Autor não disponível']
      }
      
      let keywordsArray = undefined
      try {
        if (ref.keywords) {
          const parsed = JSON.parse(ref.keywords)
          // Validar se é array
          keywordsArray = Array.isArray(parsed) ? parsed : undefined
        }
      } catch (e) {
        console.error('Erro ao parsear keywords:', e)
        keywordsArray = undefined
      }
      
      return {
        id: ref.id,
        title: ref.title,
        authors: authorsArray,
        abstract: ref.abstract || 'Resumo não disponível',
        year: ref.year || new Date().getFullYear(),
        journal: ref.journal || 'Revista',
        url: ref.url || '',
        source: ref.source || 'manual',
        doi: ref.doi || undefined,
        issn: ref.issn || undefined,
        volume: ref.volume || undefined,
        issue: ref.issue || undefined,
        pages: ref.pages || undefined,
        keywords: keywordsArray,
        language: ref.language || undefined,
        pdfUrl: ref.pdfUrl || undefined,
        citationsCount: ref.citationsCount || undefined,
        publishedDate: ref.publishedDate?.toISOString() || undefined,
        saved: true
      }
    })

    // 💾 CACHE: Salvar no cache (10 minutos = 600s)
    const resultToCache = { articles, total: articles.length }
    await setCachedData(cacheKey, resultToCache, 600)
    console.log('💾 Artigos salvos no cache')

    // Build paginated response
    const paginatedResponse = buildPaginatedResponse(articles, total, pagination)

    return NextResponse.json({
      success: true,
      ...paginatedResponse,
      cached: false
    })

  } catch (error) {
    console.error('Erro ao buscar artigos salvos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
