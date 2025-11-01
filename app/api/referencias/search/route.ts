/**
 * References Search API Route - Enhanced Version
 * 
 * Endpoint: POST /api/referencias/search
 * 
 * This route now uses the enhanced ReferenceSearchService which:
 * - Searches real scientific articles from Google Scholar, PubMed, and Crossref
 * - Validates articles from trusted sources
 * - Deduplicates results across providers
 * - Ranks articles by relevance
 * - Caches results for performance
 * 
 * Request body:
 * ```json
 * {
 *   "query": "leite",
 *   "source": "all" | "scholar" | "pubmed" | "crossref",
 *   "page": 1,
 *   "pageSize": 10,
 *   "yearFrom": 2020,
 *   "yearTo": 2024,
 *   "language": "pt" | "en" | "es" | "all"
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { referenceService } from '@/services/references'


export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Step 2: Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido na requisição' },
        { status: 400 }
      )
    }

    const { 
      query, 
      source = 'all', 
      page = 1, 
      pageSize = 10,
      yearFrom,
      yearTo,
      language = 'all',
      publicationType
    } = body

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Termo de pesquisa deve ter pelo menos 2 caracteres' 
      }, { status: 400 })
    }

    // Validate pagination
    const validPage = Math.max(1, parseInt(String(page)) || 1)
    const validPageSize = Math.min(20, Math.max(5, parseInt(String(pageSize)) || 10))
    const offset = (validPage - 1) * validPageSize

    console.log(`🔍 Searching for: "${query}" (source: ${source}, page: ${validPage})`);

    // Step 3: Build search options
    const searchOptions = {
      limit: validPageSize,
      offset: offset,
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      language: language as 'pt' | 'en' | 'es' | 'all',
      publicationType: publicationType,
      sources: source === 'all' ? undefined : [source]
    }

    // Step 4: Use the new ReferenceSearchService
    try {
      const searchResult = await referenceService.search(query, searchOptions)
      
      console.log(`✅ Found ${searchResult.articles.length} articles from ${searchResult.sources.join(', ')}`);
      
      // Step 5: Return formatted response
      return NextResponse.json({
        success: true,
        articles: searchResult.articles,
        page: searchResult.page,
        pageSize: searchResult.pageSize,
        hasMore: searchResult.hasMore,
        total: searchResult.totalResults,
        query: searchResult.query,
        source: source,
        sources: searchResult.sources,
        searchTime: searchResult.searchTime,
        message: `${searchResult.totalResults} artigo(s) encontrado(s)`,
        cached: false
      })
    } catch (searchError) {
      console.error('❌ Reference search error:', searchError)
      
      // Return user-friendly error
      return NextResponse.json({
        success: false,
        articles: [],
        error: 'Erro ao buscar referências. Tente novamente com outros termos.',
        query: query,
        page: validPage,
        pageSize: validPageSize,
        hasMore: false,
        total: 0
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro geral na pesquisa:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    )
  }
}
