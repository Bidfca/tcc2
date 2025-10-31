import { prisma } from '@/lib/prisma'
import { analyzeDataset } from '@/lib/dataAnalysis'
import { gerarDiagnosticoLocal } from '@/lib/diagnostico-local'
import { logger } from '@/lib/logger'
import type {
  DatasetDTO,
  DatasetData,
  DatasetMetadata,
  Diagnostico,
  ServiceResult,
} from '@/types/api'

/**
 * Serviço de análise de dados
 * Contém toda a lógica de negócio relacionada a análise de datasets
 */
export class AnalysisService {
  /**
   * Buscar análises do usuário
   */
  async getUserAnalyses(userId: string): ServiceResult<DatasetDTO[]> {
    try {
      logger.db.query('FIND_MANY', 'datasets')
      
      const analyses = await prisma.dataset.findMany({
        where: {
          status: 'VALIDATED',
          project: {
            ownerId: userId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          filename: true,
          data: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
          projectId: true,
          status: true,
        },
      })

      const formattedAnalyses: DatasetDTO[] = analyses.map((analysis) => ({
        id: analysis.id,
        projectId: analysis.projectId,
        name: analysis.name,
        filename: analysis.filename,
        status: analysis.status as any,
        data: JSON.parse(analysis.data) as DatasetData,
        metadata: JSON.parse(analysis.metadata || '{}') as DatasetMetadata,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
      }))

      logger.success(`${analyses.length} análises encontradas para usuário ${userId}`)

      return {
        success: true,
        data: formattedAnalyses,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao buscar análises do usuário', error)
      return {
        success: false,
        error: 'Erro ao buscar análises',
        statusCode: 500,
      }
    }
  }

  /**
   * Buscar análise específica por ID
   */
  async getAnalysisById(
    analysisId: string,
    userId: string
  ): ServiceResult<DatasetDTO> {
    try {
      logger.db.query('FIND_FIRST', 'datasets')
      
      const analysis = await prisma.dataset.findFirst({
        where: {
          id: analysisId,
          project: {
            ownerId: userId,
          },
        },
      })

      if (!analysis) {
        return {
          success: false,
          error: 'Análise não encontrada',
          statusCode: 404,
        }
      }

      const formattedAnalysis: DatasetDTO = {
        id: analysis.id,
        projectId: analysis.projectId,
        name: analysis.name,
        filename: analysis.filename,
        status: analysis.status as any,
        data: JSON.parse(analysis.data) as DatasetData,
        metadata: JSON.parse(analysis.metadata || '{}') as DatasetMetadata,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
      }

      return {
        success: true,
        data: formattedAnalysis,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao buscar análise', error)
      return {
        success: false,
        error: 'Erro ao buscar análise',
        statusCode: 500,
      }
    }
  }

  /**
   * Criar nova análise a partir de CSV
   */
  async createAnalysis(
    userId: string,
    fileName: string,
    fileSize: number,
    csvData: Record<string, unknown>[]
  ): ServiceResult<DatasetDTO> {
    try {
      logger.info('Iniciando análise de dataset', {
        fileName,
        rows: csvData.length,
      })

      // Analisar dados
      const analysisResult = analyzeDataset(csvData)

      // Filtrar variáveis zootécnicas
      const zootechnicalVariables = Object.entries(analysisResult.variablesInfo)
        .filter(([, info]) => info.isZootechnical)
        .map(([name]) => name)

      // Contar registros válidos
      const validRows = csvData.filter((row) =>
        Object.values(row).some(
          (val) => val !== null && val !== undefined && val !== ''
        )
      ).length

      // Garantir projeto do usuário
      let userProject = await prisma.project.findFirst({
        where: { ownerId: userId },
        orderBy: { createdAt: 'asc' },
      })

      if (!userProject) {
        logger.info('Criando projeto padrão para usuário')
        userProject = await prisma.project.create({
          data: {
            name: 'Meu Projeto',
            ownerId: userId,
          },
        })
      }

      // Salvar análise
      const analysis = await prisma.dataset.create({
        data: {
          name: fileName,
          filename: fileName,
          projectId: userProject.id,
          status: 'VALIDATED',
          data: JSON.stringify({
            rawData: csvData.slice(0, 100), // Primeiros 100 registros
            variablesInfo: analysisResult.variablesInfo,
            numericStats: analysisResult.numericStats,
            categoricalStats: analysisResult.categoricalStats,
            zootechnicalVariables,
          }),
          metadata: JSON.stringify({
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            fileSize,
            totalRows: analysisResult.totalRows,
            totalColumns: analysisResult.totalColumns,
            validRows,
            zootechnicalCount: zootechnicalVariables.length,
          }),
        },
      })

      logger.success('Análise criada com sucesso', { analysisId: analysis.id })

      const formattedAnalysis: DatasetDTO = {
        id: analysis.id,
        projectId: analysis.projectId,
        name: analysis.name,
        filename: analysis.filename,
        status: analysis.status as any,
        data: JSON.parse(analysis.data) as DatasetData,
        metadata: JSON.parse(analysis.metadata || '{}') as DatasetMetadata,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
      }

      return {
        success: true,
        data: formattedAnalysis,
        statusCode: 201,
      }
    } catch (error) {
      logger.error('Erro ao criar análise', error)
      return {
        success: false,
        error: 'Erro ao criar análise',
        statusCode: 500,
      }
    }
  }

  /**
   * Gerar diagnóstico para uma análise
   */
  async generateDiagnostic(
    analysisId: string,
    userId: string
  ): ServiceResult<Diagnostico> {
    try {
      logger.info('Gerando diagnóstico', { analysisId })

      // Buscar análise
      const analysisResult = await this.getAnalysisById(analysisId, userId)

      if (!analysisResult.success || !analysisResult.data) {
        return {
          success: false,
          error: analysisResult.error || 'Análise não encontrada',
          statusCode: analysisResult.statusCode || 404,
        }
      }

      const analysis = analysisResult.data
      const metadata = analysis.metadata

      // Gerar diagnóstico
      const diagnostico = gerarDiagnosticoLocal(
        analysis.data.numericStats || {},
        analysis.data.categoricalStats || {},
        analysis.name,
        metadata.totalRows || 0
      )

      logger.success('Diagnóstico gerado com sucesso')

      return {
        success: true,
        data: diagnostico,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao gerar diagnóstico', error)
      return {
        success: false,
        error: 'Erro ao gerar diagnóstico',
        statusCode: 500,
      }
    }
  }

  /**
   * Deletar análise
   */
  async deleteAnalysis(analysisId: string, userId: string): ServiceResult<void> {
    try {
      // Verificar se análise pertence ao usuário
      const analysis = await prisma.dataset.findFirst({
        where: {
          id: analysisId,
          project: {
            ownerId: userId,
          },
        },
      })

      if (!analysis) {
        return {
          success: false,
          error: 'Análise não encontrada ou sem permissão',
          statusCode: 404,
        }
      }

      // Deletar análise
      await prisma.dataset.delete({
        where: { id: analysisId },
      })

      logger.success('Análise deletada', { analysisId })

      return {
        success: true,
        statusCode: 200,
      }
    } catch (error) {
      logger.error('Erro ao deletar análise', error)
      return {
        success: false,
        error: 'Erro ao deletar análise',
        statusCode: 500,
      }
    }
  }

  /**
   * Obter estatísticas de análises do usuário
   */
  async getUserAnalyticsStats(userId: string): ServiceResult<{
    totalAnalyses: number
    totalDatasets: number
    averageRowsPerDataset: number
    mostRecentAnalysis?: string
  }> {
    try {
      const analyses = await prisma.dataset.findMany({
        where: {
          project: {
            ownerId: userId,
          },
        },
        select: {
          metadata: true,
          createdAt: true,
        },
      })

      const totalAnalyses = analyses.length
      let totalRows = 0

      for (const analysis of analyses) {
        const metadata = JSON.parse(analysis.metadata || '{}') as DatasetMetadata
        totalRows += metadata.totalRows || 0
      }

      const averageRowsPerDataset =
        totalAnalyses > 0 ? Math.round(totalRows / totalAnalyses) : 0

      const mostRecentAnalysis =
        analyses.length > 0
          ? analyses.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            )[0].createdAt.toISOString()
          : undefined

      return {
        success: true,
        data: {
          totalAnalyses,
          totalDatasets: totalAnalyses,
          averageRowsPerDataset,
          mostRecentAnalysis,
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
}

// Exportar instância singleton
export const analysisService = new AnalysisService()
