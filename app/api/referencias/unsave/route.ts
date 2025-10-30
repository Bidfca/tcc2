import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
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

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        error: 'Campo "url" é obrigatório e deve ser string' 
      }, { status: 400 })
    }

    // Remover artigo salvo
    const deletedArticle = await prisma.savedReference.deleteMany({
      where: {
        userId: session.user.id,
        url: url
      }
    })

    if (deletedArticle.count === 0) {
      return NextResponse.json({ 
        error: 'Artigo não encontrado ou não pertence ao usuário' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Artigo removido da biblioteca com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover artigo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
