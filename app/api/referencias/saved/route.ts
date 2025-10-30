import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar artigos salvos do usuário
    const savedReferences = await prisma.savedReference.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

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

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length
    })

  } catch (error) {
    console.error('Erro ao buscar artigos salvos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
