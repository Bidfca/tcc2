import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type {
  Article,
  SavedReferenceDTO,
  ServiceResponse,
} from '@/types/api'

/**
 * Serviço de referências científicas
 * Contém lógica de negócio para gerenciar artigos salvos
 */
export class ReferenceService {
  /**
   * Buscar artigos salvos do usuário
   */
  async getUserReferences(userId: string): Promise<ServiceResponse<Article[]>> {
    try {
      logger.db.query('FIND_MANY', 'saved_references')

      const savedReferences = await prisma.savedReference.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const articles: Article[] = savedReferences.map((ref) => {
        let authorsArray: string[] = []
        try {
          const authorsParsed = JSON.parse(ref.authors || '[]')
          if (Array.isArray(authorsParsed)) {
            authorsArray = authorsParsed.map((a: string | { name?: string }) =>
              typeof a === 'string' ? a : a.name || 'Autor não disponível'
            )
          }
        } catch (e) {
          logger.warn('Erro ao parsear autores', { refId: ref.id })
          authorsArray = ['Autor não disponível']
        }

        let keywordsArray: string[] | undefined
        try {
          if (ref.keywords) {
            const parsed = JSON.parse(ref.keywords)
            keywordsArray = Array.isArray(parsed) ? parsed : undefined
          }
        } catch (e) {
          logger.warn('Erro ao parsear keywords', { refId: ref.id })
        }

        return {
          id: ref.id,
          title: ref.title,
          authors: authorsArray,
          abstract: ref.abstract || 'Resumo não disponível',
          year: ref.year || new Date().getFullYear(),
          journal: ref.journal || 'Revista',
          url: ref.url || '',
          source: (ref.source as 'scielo' | 'crossref' | 'manual') || 'manual',
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
          saved: true,
        }
      })

      logger.success(`${articles.length} artigos encontrados`)

      return {
        success: true,
        data: articles,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao buscar artigos salvos', error)
      return {
        success: false,
        error: 'Erro ao buscar artigos salvos',
        statusCode: 500,
      }
    }
  }

  /**
   * Salvar artigo na biblioteca
   */
  async saveReference(
    userId: string,
    article: Article
  ): Promise<ServiceResponse<string>> {
    try {
      // Verificar se já existe
      const existing = await prisma.savedReference.findFirst({
        where: {
          userId,
          url: article.url,
        },
      })

      if (existing) {
        return {
          success: false,
          error: 'Artigo já foi salvo anteriormente',
          statusCode: 400,
        }
      }

      // Preparar dados
      const authorsArray = Array.isArray(article.authors)
        ? article.authors
        : [article.authors]
      const authorsJson = JSON.stringify(
        authorsArray.map((a) => ({ name: a }))
      )
      const keywordsJson = article.keywords
        ? JSON.stringify(article.keywords)
        : null

      let publishedDateTime: Date | null = null
      if (article.publishedDate) {
        try {
          const date = new Date(article.publishedDate)
          publishedDateTime = isNaN(date.getTime()) ? null : date
        } catch (e) {
          logger.warn('Data inválida', { date: article.publishedDate })
        }
      }

      // Salvar
      const savedArticle = await prisma.savedReference.create({
        data: {
          userId,
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
          content: JSON.stringify(article),
        },
      })

      logger.success('Artigo salvo', { articleId: savedArticle.id })

      return {
        success: true,
        data: savedArticle.id,
        statusCode: 201,
      }
    } catch (error) {
      logger.error('Erro ao salvar artigo', error)
      return {
        success: false,
        error: 'Erro ao salvar artigo',
        statusCode: 500,
      }
    }
  }

  /**
   * Remover artigo da biblioteca
   */
  async deleteReference(
    userId: string,
    url: string
  ): Promise<ServiceResponse<void>> {
    try {
      const result = await prisma.savedReference.deleteMany({
        where: {
          userId,
          url,
        },
      })

      if (result.count === 0) {
        return {
          success: false,
          error: 'Artigo não encontrado',
          statusCode: 404,
        }
      }

      logger.success('Artigo removido')

      return {
        success: true,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao remover artigo', error)
      return {
        success: false,
        error: 'Erro ao remover artigo',
        statusCode: 500,
      }
    }
  }

  /**
   * Obter estatísticas de referências do usuário
   */
  async getUserReferenceStats(userId: string): Promise<
    ServiceResponse<{
      total: number
      bySources: Record<string, number>
      byYear: Record<number, number>
      recentlyAdded: number
    }>
  > {
    try {
      const references = await prisma.savedReference.findMany({
        where: { userId },
        select: {
          source: true,
          year: true,
          createdAt: true,
        },
      })

      const bySources: Record<string, number> = {}
      const byYear: Record<number, number> = {}
      let recentlyAdded = 0

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      for (const ref of references) {
        // Por fonte
        bySources[ref.source] = (bySources[ref.source] || 0) + 1

        // Por ano
        if (ref.year) {
          byYear[ref.year] = (byYear[ref.year] || 0) + 1
        }

        // Recentemente adicionados
        if (ref.createdAt >= thirtyDaysAgo) {
          recentlyAdded++
        }
      }

      return {
        success: true,
        data: {
          total: references.length,
          bySources,
          byYear,
          recentlyAdded,
        },
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao obter estatísticas', error)
      return {
        success: false,
        error: 'Erro ao obter estatísticas',
        statusCode: 500,
      }
    }
  }

  /**
   * Buscar artigo específico
   */
  async getReferenceById(
    userId: string,
    referenceId: string
  ): Promise<ServiceResponse<Article>> {
    try {
      const ref = await prisma.savedReference.findFirst({
        where: {
          id: referenceId,
          userId,
        },
      })

      if (!ref) {
        return {
          success: false,
          error: 'Artigo não encontrado',
          statusCode: 404,
        }
      }

      let authorsArray: string[] = []
      try {
        const authorsParsed = JSON.parse(ref.authors || '[]')
        if (Array.isArray(authorsParsed)) {
          authorsArray = authorsParsed.map((a: string | { name?: string }) =>
            typeof a === 'string' ? a : a.name || 'Autor não disponível'
          )
        }
      } catch (e) {
        authorsArray = ['Autor não disponível']
      }

      const article: Article = {
        id: ref.id,
        title: ref.title,
        authors: authorsArray,
        abstract: ref.abstract || 'Resumo não disponível',
        year: ref.year || new Date().getFullYear(),
        journal: ref.journal || 'Revista',
        url: ref.url || '',
        source: (ref.source as 'scielo' | 'crossref' | 'manual') || 'manual',
        doi: ref.doi || undefined,
        saved: true,
      }

      return {
        success: true,
        data: article,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao buscar artigo', error)
      return {
        success: false,
        error: 'Erro ao buscar artigo',
        statusCode: 500,
      }
    }
  }
}

// Exportar instância singleton
export const referenceService = new ReferenceService()
