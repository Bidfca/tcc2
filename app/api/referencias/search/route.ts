import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { getCachedData, setCachedData, generateArticlesCacheKey } from '@/lib/cache'

// Types
interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'scielo' | 'crossref'
  doi?: string
  // Campos expandidos
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  keywords?: string[]
  language?: string
  pdfUrl?: string
  citationsCount?: number
  publishedDate?: string
}

interface SearchFilters {
  yearFrom?: number
  yearTo?: number
  language?: 'pt' | 'en' | 'es' | 'all'
}

// Função para buscar artigos usando a API oficial do SciELO ArticleMeta
async function searchScieloApiArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  try {
    // A API ArticleMeta fornece metadados completos
    const offset = (page - 1) * pageSize
    
    // Endpoint da API ArticleMeta para buscar artigos
    const apiUrl = `http://articlemeta.scielo.org/api/v1/article/identifiers/`
    
    const response = await axios.get(apiUrl, {
      params: {
        collection: 'scl', // SciELO (todas as coleções)
        limit: pageSize * 5, // Buscar mais para filtrar depois
        offset: offset
      },
      headers: {
        'User-Agent': 'AgroInsight/1.0 (https://agroinsight.com; mailto:contact@agroinsight.com)'
      },
      timeout: 15000
    })

    const identifiers = response.data?.objects || []
    const articles: Article[] = []
    
    // Para cada identificador, buscar os metadados completos
    for (const identifier of identifiers.slice(0, pageSize)) {
      try {
        const articleUrl = `http://articlemeta.scielo.org/api/v1/article/`
        const articleResponse = await axios.get(articleUrl, {
          params: {
            code: identifier.code,
            collection: identifier.collection
          },
          timeout: 10000
        })
        
        const article = articleResponse.data
        
        // Filtrar por query nos títulos e resumos
        const titleMatch = article.title?.pt?.toLowerCase().includes(query.toLowerCase()) ||
                          article.title?.en?.toLowerCase().includes(query.toLowerCase()) ||
                          article.title?.es?.toLowerCase().includes(query.toLowerCase())
                          
        const abstractMatch = article.abstract?.pt?.toLowerCase().includes(query.toLowerCase()) ||
                             article.abstract?.en?.toLowerCase().includes(query.toLowerCase()) ||
                             article.abstract?.es?.toLowerCase().includes(query.toLowerCase())
        
        if (!titleMatch && !abstractMatch) continue
        
        const authors = article.authors?.slice(0, 5).map((a: { surname?: string; given_names?: string }) => 
          a.surname ? `${a.surname}, ${a.given_names?.charAt(0) || ''}.` : 'Autor não disponível'
        ) || ['Autor não disponível']
        
        const title = article.title?.pt || article.title?.en || article.title?.es || 'Título não disponível'
        const abstract = article.abstract?.pt || article.abstract?.en || article.abstract?.es || 'Resumo não disponível'
        const year = article.publication_date ? parseInt(article.publication_date.split('-')[0]) : new Date().getFullYear()
        const journal = article.journal?.title || 'Revista Científica'
        
        // Construir URL do artigo
        const doi = article.doi
        const url = doi ? `https://doi.org/${doi}` : article.html_url || `https://www.scielo.br/scielo.php?script=sci_arttext&pid=${identifier.code}`
        
        // Extrair keywords
        const keywords: string[] = []
        if (article.keywords?.pt) keywords.push(...article.keywords.pt)
        if (article.keywords?.en) keywords.push(...article.keywords.en)
        if (article.keywords?.es) keywords.push(...article.keywords.es)
        
        // ISSN e outros metadados
        const issn = article.journal?.issn || article.code?.split('-')[0]
        const volume = article.issue?.volume
        const issue = article.issue?.number
        const pages = article.pages?.first && article.pages?.last 
          ? `${article.pages.first}-${article.pages.last}` 
          : undefined
        
        // PDF URL - usar regex para substituir corretamente
        const pdfUrl = article.pdf_url || (doi ? `https://www.scielo.br/pdf/${identifier.code.replace(/^S/, '').replace(/-/g, '/')}.pdf` : undefined)
        
        // Idioma
        const language = article.original_language || 'pt'
        
        articles.push({
          id: `scielo-api-${identifier.code}`,
          title,
          authors,
          abstract: abstract.substring(0, 300) + (abstract.length > 300 ? '...' : ''),
          year,
          journal,
          url,
          source: 'scielo' as const,
          doi,
          issn,
          volume,
          issue,
          pages,
          keywords: keywords.length > 0 ? keywords : undefined,
          language,
          pdfUrl,
          publishedDate: article.publication_date
        })
        
        if (articles.length >= pageSize) break
      } catch (err) {
        console.error('Erro ao buscar artigo individual:', err)
        continue
      }
    }
    
    return articles
  } catch (error) {
    console.error('Erro ao buscar SciELO API:', error)
    // Fallback para scraping se a API falhar
    return searchScieloScrapingArticles(query, page, pageSize)
  }
}

// Função para buscar artigos do SciELO com scraping (fallback)
async function searchScieloScrapingArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  try {
    const offset = (page - 1) * pageSize
    const searchUrl = `https://search.scielo.org/?q=${encodeURIComponent(query)}&lang=pt&count=${pageSize}&from=${offset}&output=site&sort=&format=summary&fb=&page=${page}`
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    })
    
    const $ = cheerio.load(response.data)
    const articles: Article[] = []
    
    $('.results .item').each((index, element) => {
      if (index >= pageSize) return false
      
      const $item = $(element)
      const title = $item.find('.title a').text().trim()
      const authors = $item.find('.authors').text().trim()
      const source = $item.find('.source').text().trim()
      const url = $item.find('.title a').attr('href') || ''
      
      if (title && url) {
        const yearMatch = source.match(/\b(19|20)\d{2}\b/)
        // Gerar ID único com timestamp + random para evitar colisões
        const uniqueId = `scielo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        articles.push({
          id: uniqueId,
          title,
          authors: authors ? authors.split(/[;,]/).map(a => a.trim()).filter(Boolean).slice(0, 5) : ['Autor não disponível'],
          abstract: 'Artigo disponível no SciELO. Acesse o link para ler o resumo completo.',
          year: yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear(),
          journal: source.split('.').slice(0, -1).join('.').trim() || 'Revista Científica',
          url: url.startsWith('http') ? url : `https://scielo.org${url}`,
          source: 'scielo' as const
        })
      }
    })
    
    return articles
  } catch (error) {
    console.error('Erro ao buscar SciELO (scraping):', error)
    return []
  }
}

// Função wrapper que tenta a API primeiro e faz fallback para scraping
async function searchScieloArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  // Usar a API oficial do SciELO ArticleMeta
  return searchScieloApiArticles(query, page, pageSize)
}

// Função para buscar artigos do Crossref com paginação
async function searchCrossrefArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  try {
    const offset = (page - 1) * pageSize
    const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${pageSize}&offset=${offset}&filter=type:journal-article&sort=relevance&mailto=contact@agroinsight.com`
    
    const response = await axios.get(crossrefUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (https://agroinsight.com; mailto:contact@agroinsight.com)'
      }
    })
    
    const items = response.data?.message?.items || []
    const articles: Article[] = []
    
    for (const item of items) {
      // Extrair autores
      const authors = item.author?.slice(0, 5).map((a: { family?: string; given?: string }) => {
        const family = a.family || ''
        const given = a.given || ''
        return given ? `${family}, ${given.charAt(0)}.` : family
      }).filter(Boolean) || ['Autor não disponível']
      
      // Extrair ano
      const year = item.published?.['date-parts']?.[0]?.[0] || 
                   item.created?.['date-parts']?.[0]?.[0] || 
                   new Date().getFullYear()
      
      // Extrair abstract (limitado)
      const abstract = item.abstract 
        ? item.abstract.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
        : 'Resumo não disponível. Acesse o artigo completo para mais informações.'
      
      // URL e DOI
      const doi = item.DOI
      const url = doi ? `https://doi.org/${doi}` : item.URL || '#'
      
      // ISSN
      const issn = item.ISSN?.[0] || undefined
      
      // Volume, Issue, Pages
      const volume = item.volume || undefined
      const issue = item.issue || undefined
      const pages = item.page || undefined
      
      // Idioma
      const language = item.language || undefined
      
      // Keywords/subjects
      const keywords = item.subject || undefined
      
      // Contagem de citações
      const citationsCount = item['is-referenced-by-count'] || undefined
      
      // Data de publicação
      const publishedDate = item.published?.['date-parts']?.[0] 
        ? `${item.published['date-parts'][0].join('-')}` 
        : undefined
      
      // Gerar ID único para evitar colisões
      const uniqueId = doi 
        ? `crossref-${doi.replace(/[^a-zA-Z0-9]/g, '-')}` 
        : `crossref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      articles.push({
        id: uniqueId,
        title: item.title?.[0] || 'Título não disponível',
        authors,
        abstract,
        year,
        journal: item['container-title']?.[0] || item.publisher || 'Journal',
        url,
        source: 'crossref' as const,
        doi,
        issn,
        volume,
        issue,
        pages,
        keywords,
        language,
        citationsCount,
        publishedDate
      })
    }
    
    return articles
  } catch (error) {
    console.error('Erro ao buscar Crossref:', error)
    return []
  }
}

// Fallback em caso de erro total
function getFallbackArticles(query: string): Article[] {
  return [
    {
      id: 'fallback-1',
      title: `Pesquisa sobre ${query} - Consulte as bases científicas`,
      authors: ['Sistema AgroInsight'],
      abstract: `Não foi possível recuperar artigos no momento. Por favor, tente novamente ou consulte diretamente as bases SciELO e Crossref. Use termos específicos para melhores resultados.`,
      year: new Date().getFullYear(),
      journal: 'Sistema de Busca',
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      source: 'crossref' as const
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse JSON com tratamento de erro
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
      language = 'all'
    } = body
    
    // Criar objeto de filtros
    const filters: SearchFilters = {
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      language: language as 'pt' | 'en' | 'es' | 'all'
    }

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        error: 'Termo de pesquisa deve ter pelo menos 3 caracteres' 
      }, { status: 400 })
    }

    // Validar paginação
    const validPage = Math.max(1, parseInt(String(page)) || 1)
    const validPageSize = Math.min(20, Math.max(5, parseInt(String(pageSize)) || 10))

    // 🚀 CACHE: Tentar buscar do cache primeiro
    const cacheKey = generateArticlesCacheKey(query, source, validPage, filters)
    const cachedResult = await getCachedData<{
      articles: Article[]
      hasMore: boolean
      total: number
    }>(cacheKey)

    if (cachedResult) {
      console.log('✅ Cache HIT:', cacheKey)
      return NextResponse.json({
        success: true,
        articles: cachedResult.articles,
        page: validPage,
        pageSize: validPageSize,
        hasMore: cachedResult.hasMore,
        total: cachedResult.total,
        query,
        source,
        message: `${cachedResult.total} artigo(s) encontrado(s) (cache)`,
        cached: true
      })
    }

    console.log('❌ Cache MISS:', cacheKey)

    let articles: Article[] = []

    // Estratégia: SciELO + Crossref em paralelo, combinar resultados
    // Usar a API oficial do SciELO ArticleMeta para melhores resultados
    if (source === 'scielo') {
      articles = await searchScieloArticles(query, validPage, validPageSize)
    } else if (source === 'crossref') {
      articles = await searchCrossrefArticles(query, validPage, validPageSize)
    } else {
      // 'all': buscar de ambas as fontes com prioridade para SciELO
      const scieloSize = Math.ceil(validPageSize * 0.6) // 60% SciELO
      const crossrefSize = Math.floor(validPageSize * 0.4) // 40% Crossref
      
      const [scieloResults, crossrefResults] = await Promise.all([
        searchScieloArticles(query, validPage, scieloSize),
        searchCrossrefArticles(query, validPage, crossrefSize)
      ])
      
      // Combinar e ordenar por relevância (SciELO primeiro, depois Crossref)
      articles = [...scieloResults, ...crossrefResults].slice(0, validPageSize)
    }

    // Fallback se não encontrou nada
    if (articles.length === 0 && validPage === 1) {
      articles = getFallbackArticles(query)
    }

    // Determinar se há mais resultados
    const hasMore = articles.length === validPageSize

    // 💾 CACHE: Salvar resultado no cache (1 hora de TTL)
    const resultToCache = {
      articles,
      hasMore,
      total: articles.length
    }
    await setCachedData(cacheKey, resultToCache, 3600) // 3600 segundos = 1 hora
    console.log('💾 Resultado salvo no cache:', cacheKey)

    return NextResponse.json({
      success: true,
      articles,
      page: validPage,
      pageSize: validPageSize,
      hasMore,
      total: articles.length,
      query,
      source,
      message: `${articles.length} artigo(s) encontrado(s)`,
      cached: false
    })

  } catch (error) {
    console.error('Erro na pesquisa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar referências. Tente novamente.' },
      { status: 500 }
    )
  }
}
