import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Detectar e extrair DOI de uma URL
function extractDOI(url: string): string | null {
  const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i
  const match = url.match(doiPattern)
  return match ? match[0] : null
}

// Detectar se é URL do SciELO
function isSciELOUrl(url: string): boolean {
  const scieloPatterns = [
    /scielo\.br/i,
    /scielo\.org/i,
    /scielo\.(cl|ar|mx|co|pe|ve|cu)/i
  ]
  return scieloPatterns.some(pattern => pattern.test(url))
}

// Extrair metadados de página SciELO via scraping
async function getMetadataFromSciELO(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    })
    
    const $ = cheerio.load(response.data)
    
    // Título
    const title = $('h1.article-title').text().trim() ||
                  $('meta[name="citation_title"]').attr('content') ||
                  'Título não disponível'
    
    // Autores
    const authors: string[] = []
    $('meta[name="citation_author"]').each((_, el) => {
      const name = $(el).attr('content')
      if (name) authors.push(name)
    })
    
    // Abstract
    const abstract = $('.abstract p').text().trim() ||
                     $('meta[name="citation_abstract"]').attr('content') ||
                     'Resumo não disponível'
    
    // DOI
    const doi = $('meta[name="citation_doi"]').attr('content')
    
    // Journal
    const journal = $('meta[name="citation_journal_title"]').attr('content') || 'Revista Científica'
    
    // ISSN
    const issn = $('meta[name="citation_issn"]').attr('content')
    
    // Ano e data
    const yearStr = $('meta[name="citation_publication_date"]').attr('content') ||
                    $('meta[name="citation_year"]').attr('content')
    const year = yearStr ? parseInt(yearStr.split('/')[0]) : new Date().getFullYear()
    const publishedDate = yearStr ? yearStr : undefined
    
    // Volume e Issue
    const volume = $('meta[name="citation_volume"]').attr('content')
    const issue = $('meta[name="citation_issue"]').attr('content')
    
    // Páginas
    const firstPage = $('meta[name="citation_firstpage"]').attr('content')
    const lastPage = $('meta[name="citation_lastpage"]').attr('content')
    const pages = firstPage && lastPage ? `${firstPage}-${lastPage}` : undefined
    
    // PDF URL
    const pdfUrl = $('meta[name="citation_pdf_url"]').attr('content') ||
                   $('a.pdf-link').attr('href')
    
    // Keywords
    const keywords: string[] = []
    $('.keyword').each((_, el) => {
      const keyword = $(el).text().trim()
      if (keyword) keywords.push(keyword)
    })
    
    // Idioma
    const language = $('html').attr('lang')?.split('-')[0] || 'pt'
    
    return {
      title,
      authors: authors.length > 0 ? authors : ['Autor não especificado'],
      abstract: abstract.substring(0, 500),
      year,
      publishedDate,
      journal,
      issn,
      volume,
      issue,
      pages,
      url,
      doi,
      pdfUrl,
      keywords,
      language,
      citationsCount: 0,
      source: 'scielo'
    }
  } catch (error) {
    console.error('Erro ao extrair metadados do SciELO:', error)
    return null
  }
}

// Buscar metadata de um DOI via Crossref
async function getMetadataFromDOI(doi: string) {
  try {
    const response = await axios.get(`https://api.crossref.org/works/${doi}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)'
      }
    })
    
    const item = response.data?.message
    if (!item) return null
    
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
    
    // Abstract
    const abstract = item.abstract 
      ? item.abstract.replace(/<[^>]*>/g, '').substring(0, 500)
      : 'Resumo não disponível. Acesse o artigo completo.'
    
    // ISSN
    const issn = item.ISSN?.[0]
    
    // Volume, Issue, Pages
    const volume = item.volume
    const issue = item.issue
    const pages = item.page
    
    // Keywords
    const keywords = item.subject
    
    // Idioma
    const language = item.language
    
    // Citações
    const citationsCount = item['is-referenced-by-count'] || 0
    
    // Data de publicação
    const publishedDate = item.published?.['date-parts']?.[0] 
      ? `${item.published['date-parts'][0].join('-')}` 
      : undefined
    
    return {
      title: item.title?.[0] || 'Título não disponível',
      authors,
      abstract,
      year,
      publishedDate,
      journal: item['container-title']?.[0] || 'Journal',
      issn,
      volume,
      issue,
      pages,
      keywords,
      language,
      citationsCount,
      url: `https://doi.org/${doi}`,
      doi,
      pdfUrl: null,
      source: 'crossref'
    }
  } catch (error) {
    console.error('Erro ao buscar metadata do DOI:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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

    const { url } = body

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Campo "url" é obrigatório e deve ser uma string válida' 
      }, { status: 400 })
    }

    // Validar se é uma URL válida
    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Protocolo inválido')
      }
    } catch {
      return NextResponse.json({ 
        error: 'URL inválida. Use uma URL completa com http:// ou https://' 
      }, { status: 400 })
    }

    // Detectar tipo de URL
    const isScielo = isSciELOUrl(url)
    const doi = extractDOI(url)
    
    let metadata = null
    
    // Prioridade 1: Se for SciELO, extrair diretamente da página
    if (isScielo) {
      metadata = await getMetadataFromSciELO(url)
    }
    
    // Prioridade 2: Se houver DOI e não for SciELO, buscar via Crossref
    if (!metadata && doi) {
      metadata = await getMetadataFromDOI(doi)
    }
    
    // Se não conseguiu metadata via DOI, criar entrada básica com a URL fornecida
    if (!metadata) {
      // Tentar extrair título do domínio/path
      const urlParts = validUrl.pathname.split('/').filter(Boolean)
      const lastPart = urlParts[urlParts.length - 1] || validUrl.hostname
      const basicTitle = lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]+$/, '') // Remove extensão de arquivo
        .trim() || 'Artigo sem título'
      
      metadata = {
        title: basicTitle,
        authors: 'Autor não especificado',
        abstract: 'Resumo não disponível. Acesse o artigo completo no link fornecido.',
        year: new Date().getFullYear(),
        journal: validUrl.hostname.replace('www.', ''),
        url: url,
        doi: doi || null,
        pdfUrl: null,
        citationsCount: 0,
        source: 'manual'
      }
    }

    // Verificar se já existe na biblioteca do usuário
    const existing = await prisma.savedReference.findFirst({
      where: {
        userId: session.user.id,
        url: metadata.url
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Este artigo já está na sua biblioteca',
        article: existing
      }, { status: 409 })
    }

    // Preparar dados para salvar
    const authorsArray = Array.isArray(metadata.authors) ? metadata.authors : [metadata.authors]
    const authorsJson = JSON.stringify(authorsArray.map((a: string) => ({ name: a })))
    const keywordsJson = metadata.keywords ? JSON.stringify(metadata.keywords) : null
    
    // Converter publishedDate para DateTime se existir
    let publishedDateTime = null
    if (metadata.publishedDate) {
      try {
        const date = new Date(metadata.publishedDate)
        // Validar se a data é válida
        publishedDateTime = isNaN(date.getTime()) ? null : date
      } catch (e) {
        console.error('Erro ao converter data:', e)
        publishedDateTime = null
      }
    }
    
    // Salvar na biblioteca com campos estruturados
    const savedArticle = await prisma.savedReference.create({
      data: {
        userId: session.user.id,
        title: metadata.title,
        url: metadata.url,
        doi: metadata.doi || null,
        abstract: metadata.abstract || null,
        authors: authorsJson,
        year: metadata.year || null,
        publishedDate: publishedDateTime,
        language: metadata.language || null,
        journal: metadata.journal || null,
        issn: metadata.issn || null,
        volume: metadata.volume || null,
        issue: metadata.issue || null,
        pages: metadata.pages || null,
        keywords: keywordsJson,
        source: metadata.source || 'manual',
        pdfUrl: metadata.pdfUrl || null,
        citationsCount: metadata.citationsCount || 0,
        tags: authorsArray.slice(0, 3).join(', '), // Primeiros 3 autores como tags
        content: JSON.stringify(metadata) // Manter compatibilidade
      }
    })

    return NextResponse.json({
      success: true,
      article: {
        ...savedArticle,
        ...metadata
      },
      message: metadata.source === 'manual' 
        ? 'Artigo adicionado! Você pode editar as informações depois clicando no artigo.' 
        : 'Artigo adicionado à biblioteca com sucesso'
    })

  } catch (error) {
    console.error('Erro ao adicionar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar artigo. Tente novamente.' },
      { status: 500 }
    )
  }
}
