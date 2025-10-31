import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse JSON com tratamento de erro
    let article
    try {
      article = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido na requisição' },
        { status: 400 }
      )
    }

    // Validar campos obrigatórios
    if (!article.title || typeof article.title !== 'string') {
      return NextResponse.json(
        { error: 'Campo "title" é obrigatório e deve ser string' },
        { status: 400 }
      )
    }

    if (!article.url || typeof article.url !== 'string') {
      return NextResponse.json(
        { error: 'Campo "url" é obrigatório e deve ser string' },
        { status: 400 }
      )
    }

    if (!article.authors) {
      return NextResponse.json(
        { error: 'Campo "authors" é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o artigo já foi salvo
    const existingArticle = await prisma.savedReference.findFirst({
      where: {
        userId: session.user.id,
        url: article.url
      }
    })

    if (existingArticle) {
      return NextResponse.json({ 
        error: 'Artigo já foi salvo anteriormente' 
      }, { status: 400 })
    }

    // Preparar authors como JSON
    const authorsArray = Array.isArray(article.authors) ? article.authors : [article.authors]
    const authorsJson = JSON.stringify(authorsArray.map((a: string) => ({ name: a })))
    
    // Preparar keywords como JSON
    const keywordsJson = article.keywords ? JSON.stringify(article.keywords) : null
    
    // Converter publishedDate para DateTime se existir
    let publishedDateTime = null
    if (article.publishedDate) {
      try {
        const date = new Date(article.publishedDate)
        // Validar se a data é válida
        publishedDateTime = isNaN(date.getTime()) ? null : date
      } catch (e) {
        console.error('Erro ao converter data:', e)
        publishedDateTime = null
      }
    }
    
    // Salvar artigo com campos estruturados
    const savedArticle = await prisma.savedReference.create({
      data: {
        userId: session.user.id,
        title: article.title,
        url: article.url,
        doi: article.doi || null,
        abstract: article.abstract || null,
        authors: authorsJson,
        year: article.year || null,
        publishedDate: publishedDateTime,
        language: article.language || null,
        journal: article.journal || null,
        issn: article.issn || null,
        volume: article.volume || null,
        issue: article.issue || null,
        pages: article.pages || null,
        keywords: keywordsJson,
        source: article.source || 'manual',
        pdfUrl: article.pdfUrl || null,
        citationsCount: article.citationsCount || 0,
        tags: authorsArray.slice(0, 3).join(', '),
        content: JSON.stringify(article) // Manter compatibilidade
      }
    })

    // 🗑️ CACHE: Invalidar cache de artigos salvos do usuário
    const cacheKey = `articles:saved:${session.user.id}`
    await invalidateCache(cacheKey)
    console.log('🗑️ Cache invalidado:', cacheKey)

    return NextResponse.json({
      success: true,
      message: 'Artigo salvo com sucesso!',
      articleId: savedArticle.id
    })

  } catch (error) {
    console.error('Erro ao salvar artigo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
