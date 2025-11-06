'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { 
  Sprout, 
  FileSpreadsheet, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Beaker
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { validateFile, formatBytes, scanFileForThreats } from '@/lib/upload-validation'
import { toast } from 'sonner'
import { CSVPreview } from '@/components/csv-preview'
import Papa from 'papaparse'
import { generateAndDownloadTestData } from '@/lib/generate-test-data'
import { MultiSpeciesTabs } from '@/components/analysis/MultiSpeciesTabs'
import { SpeciesUploadForm } from '@/components/analysis/SpeciesUploadForm'

export default function AnaliseDataPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    id?: string;
    name?: string;
    data?: string;
    totalRows?: number;
    totalColumns?: number;
    validRows?: number;
    success?: boolean;
    analysis?: { id: string; name: string; data: string };
    message?: string;
  } | null>(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<'bovino' | 'suino' | 'avicultura' | 'ovino' | 'caprino' | 'piscicultura' | 'forragem'>('bovino')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validar arquivo
    const validation = validateFile(file)
    
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido')
      toast.error(validation.error || 'Arquivo inválido')
      setUploadedFile(null)
      return
    }

    // Verificar ameaças de segurança
    const securityCheck = await scanFileForThreats(file)
    if (!securityCheck.valid) {
      setError(securityCheck.error || 'Arquivo bloqueado por segurança')
      toast.error(securityCheck.error || 'Arquivo bloqueado por segurança')
      setUploadedFile(null)
      return
    }

    // Arquivo válido
    setUploadedFile(file)
    setError('')
    toast.success(`Arquivo "${file.name}" carregado com sucesso!`)
    
    // Mostrar avisos se houver
    if (validation.warnings && validation.warnings.length > 0) {
      setWarning(validation.warnings.join(' '))
      toast.warning(validation.warnings.join(' '))
    } else {
      setWarning('')
    }

    // Parse preview do CSV
    setIsParsing(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 100, // Apenas primeiras 100 linhas para preview
      complete: (results) => {
        setPreviewData(results.data as Record<string, unknown>[])
        setIsParsing(false)
      },
      error: (error) => {
        console.error('Erro ao fazer preview:', error)
        toast.error('Erro ao visualizar arquivo')
        setIsParsing(false)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  const handleGenerateTestData = () => {
    const speciesLabels = {
      'bovino': 'Bovinos',
      'suino': 'Suínos',
      'avicultura': 'Aves',
      'ovino': 'Ovinos',
      'caprino': 'Caprinos',
      'piscicultura': 'Peixes',
      'forragem': 'Forragem'
    }
    
    const toastId = toast.loading(`Gerando dados de teste para ${speciesLabels[selectedSpecies]}...`, {
      duration: Infinity,
      action: {
        label: 'Fechar',
        onClick: () => toast.dismiss(toastId)
      }
    })
    
    try {
      generateAndDownloadTestData(100, selectedSpecies)
      
      toast.dismiss(toastId)
      toast.success(`Arquivo de teste de ${speciesLabels[selectedSpecies]} gerado! Verifique seus downloads.`)
      toast.info('Agora você pode fazer upload do arquivo gerado', { duration: 5000 })
    } catch (error) {
      console.error('Erro ao gerar dados:', error)
      toast.dismiss(toastId)
      toast.error('Erro ao gerar arquivo de teste')
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setError('')
    
    // Toast de início
    const toastId = toast.loading('Analisando arquivo...')

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('/api/analise/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setAnalysisResult(result)
        toast.success('Análise concluída com sucesso!', { id: toastId })
      } else {
        const errorMsg = result.error || 'Erro ao analisar arquivo'
        setError(errorMsg)
        toast.error(errorMsg, { id: toastId })
      }
    } catch {
      const errorMsg = 'Erro ao processar arquivo. Tente novamente.'
      setError(errorMsg)
      toast.error(errorMsg, { id: toastId })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-foreground/60 hover:text-foreground">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-foreground/60 hover:text-foreground"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Análise de Dados Zootécnicos</h1>
            <div className="flex items-center gap-3">
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value as typeof selectedSpecies)}
                className="px-3 py-2 bg-card border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
                title="Selecione a espécie para gerar dados de teste"
              >
                <option value="bovino">Bovinos</option>
                <option value="suino">Suínos</option>
                <option value="avicultura">Aves</option>
                <option value="ovino">Ovinos</option>
                <option value="caprino">Caprinos</option>
                <option value="piscicultura">Peixes</option>
                <option value="forragem">Forragem</option>
              </select>
              <button
                onClick={handleGenerateTestData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium"
                title="Gera uma planilha CSV com dados fictícios para demonstração"
              >
                <Beaker className="h-4 w-4" />
                <span>Gerar Dados para Teste</span>
              </button>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">
            Faça upload de planilhas CSV com dados zootécnicos para análise estatística automática
          </p>

          {!analysisResult ? (
            <div className="space-y-8">
              {/* Sistema Multi-Espécie */}
              <div className="bg-card shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Análise Zootécnica Multi-Espécie
                </h2>
                <p className="text-muted-foreground mb-6">
                  Selecione a espécie e categoria para análise especializada com dados científicos de referência.
                </p>
                <MultiSpeciesTabs>
                  {(species, subtype) => (
                    <SpeciesUploadForm
                      species={species}
                      subtype={subtype}
                      onAnalysisComplete={(result) => {
                        console.log('[analise:complete]', { 
                          hasAnalysis: !!result.analysis,
                          analysisId: result.analysis?.id,
                          timestamp: new Date().toISOString()
                        })
                        
                        if (result.analysis) {
                          setAnalysisResult({
                            id: result.analysis.id,
                            name: result.analysis.name,
                            data: JSON.stringify(result.analysis),
                            success: true
                          })
                          toast.success('Análise concluída com sucesso!')
                          
                          console.log('[analise:redirect]', { 
                            analysisId: result.analysis.id,
                            targetUrl: `/dashboard/resultados?id=${result.analysis.id}`
                          })
                          
                          router.push(`/dashboard/resultados?id=${result.analysis.id}`)
                        } else {
                          console.error('[analise:complete:no-analysis]', { result })
                          toast.error('Erro: análise não retornou dados')
                        }
                      }}
                    />
                  )}
                </MultiSpeciesTabs>
              </div>

              {/* Upload Padrão (Alternativa) */}
              <details className="bg-card shadow rounded-lg">
                <summary className="p-6 cursor-pointer font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                  📊 Upload de Arquivo Padrão (Análise Genérica)
                </summary>
                <div className="p-6 pt-0">
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-primary/10' 
                      : 'border hover:border-primary hover:bg-muted'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  {isDragActive ? (
                    <p className="text-foreground">Solte o arquivo aqui...</p>
                  ) : (
                    <div>
                      <p className="text-muted-foreground mb-2">
                        Arraste e solte um arquivo CSV aqui, ou clique para selecionar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Apenas arquivos CSV são aceitos (máx: 50MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-green-800 dark:text-green-300">
                        Arquivo selecionado: {uploadedFile.name} ({formatBytes(uploadedFile.size)})
                      </span>
                    </div>
                  </div>
                )}

                {warning && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-yellow-800 dark:text-yellow-300">{warning}</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-red-800 dark:text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                {/* Preview do CSV */}
                {isParsing && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Gerando preview...</p>
                  </div>
                )}

                {!isParsing && previewData.length > 0 && (
                  <CSVPreview data={previewData} filename={uploadedFile?.name || ''} />
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || isAnalyzing}
                  className="mt-6 w-full bg-primary hover:bg-primary/90 disabled:bg-muted-foreground text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isAnalyzing ? 'Analisando...' : 'Analisar Dados'}
                </button>
                </div>
              </details>

              {/* Informações sobre o formato esperado */}
              <div className="bg-card shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Formato de Dados Esperado</h2>
                <p className="text-muted-foreground mb-4">
                  Sua planilha CSV deve conter colunas com dados zootécnicos. Exemplos de colunas aceitas:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Dados Básicos:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ano</li>
                      <li>• Raça</li>
                      <li>• Era (idade)</li>
                      <li>• Trimestre/Período</li>
                      <li>• Sexo</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Dados Zootécnicos:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Peso (kg)</li>
                      <li>• Rendimento de Carcaça (%)</li>
                      <li>• Ganho de Peso Diário (kg/dia)</li>
                      <li>• Conversão Alimentar</li>
                      <li>• Área de Olho de Lombo (cm²)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Dica:</strong> Certifique-se de que a primeira linha contém os nomes das colunas e que os dados numéricos estão formatados corretamente.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Resultados da Análise */
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Resultados da Análise</h2>
                <button
                  onClick={() => {
                    setAnalysisResult(null)
                    setUploadedFile(null)
                  }}
                  className="text-foreground hover:text-foreground/80 font-medium"
                >
                  Nova Análise
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{analysisResult.totalRows || 0}</div>
                  <div className="text-sm text-muted-foreground">Total de Registros</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{analysisResult.totalColumns || 0}</div>
                  <div className="text-sm text-muted-foreground">Colunas Identificadas</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysisResult.validRows || 0}</div>
                  <div className="text-sm text-muted-foreground">Registros Válidos</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/dashboard/resultados"
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ver Análise Completa
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
