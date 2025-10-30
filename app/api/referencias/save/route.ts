import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const article = await request.json()

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

    // Salvar artigo
    const savedArticle = await prisma.savedReference.create({
      data: {
        userId: session.user.id,
        title: article.title,
        url: article.url,
        content: JSON.stringify({
          authors: article.authors,
          abstract: article.abstract,
          year: article.year,
          journal: article.journal,
          source: article.source,
          doi: article.doi || null
        }),
        tags: Array.isArray(article.authors) ? article.authors.join(', ') : article.authors
      }
    })

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
