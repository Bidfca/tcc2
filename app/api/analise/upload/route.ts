/**
 * CSV Upload API Route for Data Analysis
 * 
 * Endpoint: POST /api/analise/upload
 * 
 * This route handles CSV file uploads for agricultural data analysis:
 * - Validates user authentication
 * - Processes uploaded CSV files using Papa Parse
 * - Analyzes data for zootechnical variables
 * - Stores analysis results in database
 * - Invalidates relevant cache entries
 * 
 * Request format:
 * - Content-Type: multipart/form-data
 * - Body: FormData with 'file' field containing CSV
 * 
 * Success response (201):
 * ```json
 * {
 *   success: true,
 *   analysis: { id, name, data, metadata, ... },
 *   message: "Análise criada com sucesso"
 * }
 * ```
 * 
 * Error responses:
 * - 401: Unauthorized
 * - 400: Invalid file format or parsing error
 * - 500: Server error during processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { analyzeDataset } from '@/lib/dataAnalysis'
import { invalidateCache } from '@/lib/cache'
import { withRateLimit } from '@/lib/rate-limit'
import { validateUploadedFile, generateUniqueFilename } from '@/lib/upload-security'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * POST handler for CSV file upload and analysis
 * 
 * Process:
 * 1. Authenticate user session
 * 2. Validate uploaded file is CSV
 * 3. Parse CSV content with Papa Parse
 * 4. Analyze data for zootechnical variables
 * 5. Ensure user has a project (create default if needed)
 * 6. Store analysis in database
 * 7. Invalidate cache entries
 * 
 * @param request - Next.js request containing FormData with CSV file
 * @returns JSON response with analysis results or error
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting for file uploads
  const rateLimitResponse = await withRateLimit(request, 'UPLOAD')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Security validation
    const securityCheck = await validateUploadedFile(file, 'csv')
    if (!securityCheck.valid) {
      console.warn('🚫 Security check failed:', securityCheck.error)
      return NextResponse.json({ 
        error: securityCheck.error,
        warnings: securityCheck.warnings 
      }, { status: 400 })
    }

    // Log warnings if any
    if (securityCheck.warnings && securityCheck.warnings.length > 0) {
      console.warn('⚠️ Upload warnings:', securityCheck.warnings)
    }

    // Generate secure filename
    const secureFilename = generateUniqueFilename(file.name)

    // Check file size for streaming decision
    const fileSizeInMB = file.size / (1024 * 1024)
    const useStreaming = fileSizeInMB > 10 // Use streaming for files > 10MB
    
    let data: Record<string, unknown>[] = []
    let parseErrors: Papa.ParseError[] = []
    
    if (useStreaming) {
      // STREAMING MODE: Process CSV in chunks for large files
      console.log(`📊 Processando arquivo grande (${fileSizeInMB.toFixed(2)}MB) em modo streaming...`)
      
      const fileContent = await file.text()
      const chunks: Record<string, unknown>[][] = []
      let currentChunk: Record<string, unknown>[] = []
      const chunkSize = 1000 // Process 1000 rows at a time
      
      // Parse with streaming callback
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        step: (row: Papa.ParseStepResult<Record<string, unknown>>) => {
          if (row.errors.length === 0) {
            currentChunk.push(row.data)
            
            // When chunk is full, process it
            if (currentChunk.length >= chunkSize) {
              chunks.push([...currentChunk])
              currentChunk = []
            }
          } else {
            parseErrors.push(...row.errors)
          }
        },
        complete: () => {
          // Add remaining rows
          if (currentChunk.length > 0) {
            chunks.push(currentChunk)
          }
        }
      })
      
      // Flatten chunks into single array
      data = chunks.flat()
      console.log(`✅ Processados ${data.length} registros em ${chunks.length} chunks`)
      
    } else {
      // STANDARD MODE: Load entire file for smaller files
      const fileContent = await file.text()
      
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      })
      
      parseErrors = parseResult.errors
      data = parseResult.data as Record<string, unknown>[]
    }

    if (parseErrors.length > 0) {
      console.warn(`⚠️ ${parseErrors.length} erros durante parse`)
      // Only fail if there are critical errors
      if (data.length === 0) {
        return NextResponse.json({ 
          error: 'Erro ao processar CSV: ' + parseErrors[0].message 
        }, { status: 400 })
      }
    }
    
    if (data.length === 0) {
      return NextResponse.json({ 
        error: 'Arquivo CSV vazio ou sem dados válidos' 
      }, { status: 400 })
    }

    // Usar o novo sistema de análise
    const analysisResult = analyzeDataset(data)
    
    // Filtrar apenas variáveis zootécnicas
    const zootechnicalVariables = Object.entries(analysisResult.variablesInfo)
      .filter(([, info]) => info.isZootechnical)
      .map(([name]) => name)
    
    // Contar registros válidos
    const validRows = data.filter(row => 
      Object.values(row).some(val => val !== null && val !== undefined && val !== '')
    ).length

    // Garantir projeto do usuário (usa o primeiro existente ou cria um padrão)
    let userProject = await prisma.project.findFirst({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'asc' }
    })

    if (!userProject) {
      userProject = await prisma.project.create({
        data: {
          name: 'Meu Projeto',
          ownerId: session.user.id
        }
      })
    }

    // Salvar análise no banco de dados vinculado ao projeto do usuário
    const analysis = await prisma.dataset.create({
      data: {
        name: file.name,
        filename: secureFilename,
        projectId: userProject.id,
        status: 'VALIDATED',
        data: JSON.stringify({
          rawData: data.slice(0, 100), // Salvar apenas os primeiros 100 registros para economia
          variablesInfo: analysisResult.variablesInfo,
          numericStats: analysisResult.numericStats,
          categoricalStats: analysisResult.categoricalStats,
          zootechnicalVariables
        }),
        metadata: JSON.stringify({
          uploadedBy: session.user.id,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          totalRows: analysisResult.totalRows,
          totalColumns: analysisResult.totalColumns,
          validRows,
          zootechnicalCount: zootechnicalVariables.length
        })
      }
    })

    // 🗑️ CACHE: Invalidar cache de resultados do usuário
    const cacheKey = `resultados:${session.user.id}`
    await invalidateCache(cacheKey)
    console.log('🗑️ Cache de resultados invalidado')

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      totalRows: analysisResult.totalRows,
      totalColumns: analysisResult.totalColumns,
      validRows,
      zootechnicalVariables,
      variablesInfo: analysisResult.variablesInfo,
      numericStats: analysisResult.numericStats,
      categoricalStats: analysisResult.categoricalStats,
      message: 'Arquivo analisado com sucesso!'
    })

  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
}
