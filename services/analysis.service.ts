/**
 * EN: Analysis Service - Business Logic for Data Analysis
 * PT-BR: Serviço de Análise - Lógica de Negócio para Análise de Dados
 * 
 * EN: This service handles all business logic related to dataset analysis in AgroInsight.
 *     It acts as the intermediary between API routes and the database, providing:
 *     - CRUD operations for analyses
 *     - Data processing and statistical analysis
 *     - Diagnostic generation for agricultural datasets
 *     - User-specific data access control
 * PT-BR: Este serviço gerencia toda a lógica de negócio relacionada à análise de conjuntos de dados no AgroInsight.
 *        Atua como intermediário entre rotas de API e o banco de dados, fornecendo:
 *        - Operações CRUD para análises
 *        - Processamento de dados e análise estatística
 *        - Geração de diagnósticos para conjuntos de dados agrícolas
 *        - Controle de acesso a dados específicos do usuário
 * 
 * EN: Key responsibilities:
 *     - Fetch user's analyses with proper authorization
 *     - Process uploaded CSV files for zootechnical data
 *     - Generate statistical summaries and diagnostics
 *     - Manage analysis lifecycle (creation, validation, deletion)
 * PT-BR: Responsabilidades principais:
 *        - Buscar análises do usuário com autorização adequada
 *        - Processar arquivos CSV carregados para dados zootécnicos
 *        - Gerar resumos estatísticos e diagnósticos
 *        - Gerenciar ciclo de vida da análise (criação, validação, exclusão)
 * 
 * @example
 * ```ts
 * const analysisService = new AnalysisService()
 * const result = await analysisService.getUserAnalyses(userId)
 * if (result.success) {
 *   console.log(result.data) // Array of DatasetDTO
 * }
 * ```
 */

import { prisma } from '@/lib/prisma'
import { analyzeDataset } from '@/lib/dataAnalysis'
import { gerarDiagnosticoLocal, type DiagnosticoLocal } from '@/lib/diagnostico-local'
import { logger } from '@/lib/logger'
import type {
  DatasetDTO,
  DatasetData,
  DatasetMetadata,
  ServiceResult,
} from '@/types/api'

/**
 * Analysis Service Class
 * 
 * Encapsulates all business logic for dataset analysis operations.
 * Follows the service pattern to separate concerns between API routes and data processing.
 */
export class AnalysisService {
  /**
   * Get all analyses for a specific user
   * 
   * Fetches all validated datasets belonging to the user's projects.
   * Includes proper authorization by checking project ownership.
   * 
   * @param userId - The user's unique identifier
   * @returns ServiceResult containing array of DatasetDTO or error
   * 
   * @example
   * ```ts
   * const result = await analysisService.getUserAnalyses('user-123')
   * if (result.success) {
   *   console.log(`Found ${result.data.length} analyses`)
   * }
   * ```
   */
  async getUserAnalyses(userId: string): Promise<ServiceResult<DatasetDTO[]>> {
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
   * Get a specific analysis by ID for a user
   * 
   * Fetches a single dataset with authorization check to ensure
   * the user can only access their own analyses.
   * 
   * @param analysisId - The dataset's unique identifier
   * @param userId - The user's unique identifier (for authorization)
   * @returns ServiceResult containing DatasetDTO or error
   * 
   * @example
   * ```ts
   * const result = await analysisService.getAnalysisById('analysis-123', 'user-123')
   * if (result.success) {
   *   console.log('Analysis data:', result.data)
   * } else if (result.statusCode === 404) {
   *   console.log('Analysis not found')
   * }
   * ```
   */
  async getAnalysisById(
    analysisId: string,
    userId: string
  ): Promise<ServiceResult<DatasetDTO>> {
    try {
      logger.db.query('FIND_FIRST', 'datasets')
      
      // Query with authorization check - ensures user owns the project containing this analysis
      const analysis = await prisma.dataset.findFirst({
        where: {
          id: analysisId,
          project: {
            ownerId: userId,
          },
        },
      })

      // Return 404 if analysis doesn't exist or user doesn't have access
      if (!analysis) {
        return {
          success: false,
          error: 'Análise não encontrada',
          statusCode: 404,
        }
      }

      // Format database data to DTO structure
      const formattedAnalysis: DatasetDTO = {
        id: analysis.id,
        projectId: analysis.projectId,
        name: analysis.name,
        filename: analysis.filename,
        status: analysis.status as any,
        data: JSON.parse(analysis.data) as DatasetData,  // Parse JSON string to object
        metadata: JSON.parse(analysis.metadata || '{}') as DatasetMetadata,  // Parse metadata
        createdAt: analysis.createdAt.toISOString(),  // Convert Date to ISO string
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
   * Create a new analysis from uploaded CSV data
   * 
   * Processes raw CSV data, performs statistical analysis,
   * identifies zootechnical variables, and stores in database.
   * 
   * Process:
   * 1. Analyze dataset for statistics and variable types
   * 2. Filter for zootechnical variables (weight, age, etc.)
   * 3. Count valid rows (non-empty records)
   * 4. Ensure user has a project (create default if needed)
   * 5. Store analysis with all metadata
   * 
   * @param userId - The user's unique identifier
   * @param fileName - Original filename of uploaded CSV
   * @param fileSize - Size of uploaded file in bytes
   * @param csvData - Parsed CSV data as array of records
   * @returns ServiceResult containing created DatasetDTO or error
   * 
   * @example
   * ```ts
   * const result = await analysisService.createAnalysis(
   *   'user-123',
   *   'cattle-data.csv',
   *   1024000,
   *   parsedCsvData
   * )
   * ```
   */
  async createAnalysis(
    userId: string,
    fileName: string,
    fileSize: number,
    csvData: Record<string, unknown>[]
  ): Promise<ServiceResult<DatasetDTO>> {
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
   * EN: Generate diagnostic report for an analysis
   * PT-BR: Gerar relatório de diagnóstico para uma análise
   * 
   * EN: Creates a rule-based diagnostic report using zootechnical references
   * PT-BR: Cria um relatório de diagnóstico baseado em regras usando referências zootécnicas
   * 
   * @param analysisId - EN: Analysis unique identifier | PT-BR: Identificador único da análise
   * @param userId - EN: User ID for authorization | PT-BR: ID do usuário para autorização
   * @returns EN: ServiceResult with diagnostic report | PT-BR: ServiceResult com relatório de diagnóstico
   */
  async generateDiagnostic(
    analysisId: string,
    userId: string
  ): Promise<ServiceResult<DiagnosticoLocal>> {
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
   * EN: Delete an analysis
   * PT-BR: Deletar uma análise
   * 
   * EN: Removes an analysis from the database with authorization check
   * PT-BR: Remove uma análise do banco de dados com verificação de autorização
   * 
   * @param analysisId - EN: Analysis unique identifier | PT-BR: Identificador único da análise
   * @param userId - EN: User ID for authorization | PT-BR: ID do usuário para autorização
   * @returns EN: ServiceResult indicating success or failure | PT-BR: ServiceResult indicando sucesso ou falha
   */
  async deleteAnalysis(analysisId: string, userId: string): Promise<ServiceResult<void>> {
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
   * EN: Get user's analytics statistics
   * PT-BR: Obter estatísticas de análises do usuário
   * 
   * EN: Calculates aggregate statistics across all user analyses
   * PT-BR: Calcula estatísticas agregadas em todas as análises do usuário
   * 
   * @param userId - EN: User unique identifier | PT-BR: Identificador único do usuário
   * @returns EN: ServiceResult with statistics summary | PT-BR: ServiceResult com resumo de estatísticas
   */
  async getUserAnalyticsStats(userId: string): Promise<ServiceResult<{
    totalAnalyses: number
    totalDatasets: number
    averageRowsPerDataset: number
    mostRecentAnalysis?: string
  }>> {
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
