'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Sprout, 
  ArrowLeft,
  Download,
  BarChart3,
  PieChart,
  FileText,
  Printer,
  Activity,
  Info,
  GitCompare,
  Trash2,
  User
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tabs } from '@/components/tabs'
import { LaymanTab } from '@/components/layman'
import {
  BoxPlotChart,
  PieChartComponent,
  ScatterPlotChart,
  HistogramChart,
  StatsTable,
  StatCard
} from '@/components/AdvancedCharts'
import { VariableType, VariableInfo, NumericStats, CategoricalStats } from '@/lib/dataAnalysis'
import { AnalysisLoadingSkeleton } from '@/components/skeleton'
import { toast } from 'sonner'

// const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280']

// Função auxiliar para obter label do tipo de variável
function getVariableTypeLabel(type: VariableType): string {
  const labels: Record<VariableType, string> = {
    [VariableType.QUANTITATIVE_CONTINUOUS]: 'Quantitativa Contínua',
    [VariableType.QUANTITATIVE_DISCRETE]: 'Quantitativa Discreta',
    [VariableType.QUALITATIVE_NOMINAL]: 'Qualitativa Nominal',
    [VariableType.QUALITATIVE_ORDINAL]: 'Qualitativa Ordinal',
    [VariableType.TEMPORAL]: 'Temporal',
    [VariableType.IDENTIFIER]: 'Identificador'
  }
  return labels[type] || type
}

// Type definition for analysis data
interface AnalysisData {
  variablesInfo?: Record<string, VariableInfo>;
  numericStats?: Record<string, NumericStats>;
  categoricalStats?: Record<string, CategoricalStats>;
  rawData?: Record<string, unknown>[];
  statistics?: Record<string, NumericStats>; // Legacy format
  categoricalAnalysis?: Record<string, CategoricalStats>; // Legacy format
  zootechnicalVariables?: string[];
  totalRows?: number;
  totalColumns?: number;
}

export default function ResultadosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Array<{
    id: string;
    name: string;
    filename: string;
    data: string;
    metadata: string | null;
    createdAt: string;
    updatedAt: string;
  }>>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    id: string;
    name: string;
    filename: string;
    data: string;
    metadata: string | null;
    createdAt: string;
    updatedAt: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [diagnostico, setDiagnostico] = useState<{
    diagnostico: string;
    geradoEm: string;
    metodo: string;
    resumoExecutivo?: string;
    analiseNumericas?: Array<{
      variavel: string;
      status: string;
      interpretacao: string;
      comparacaoLiteratura?: string;
    }>;
    pontosFortes?: string[];
    pontosAtencao?: string[];
    recomendacoesPrioritarias?: Array<{
      titulo: string;
      descricao: string;
      prioridade: string;
    }>;
    conclusao?: string;
    fontes?: string[];
  } | null>(null)
  const [loadingDiagnostico, setLoadingDiagnostico] = useState(false)
  const [showDiagnostico, setShowDiagnostico] = useState(false)

  useEffect(() => {
    if (session) {
      fetchAnalyses()
    }
  }, [session])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analise/resultados')
      const data = await response.json()
      setAnalyses(data.analyses || [])
      if (data.analyses && data.analyses.length > 0) {
        setSelectedAnalysis(data.analyses[0])
      }
    } catch (error) {
      console.error('Erro ao carregar análises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async (analysisId: string, analysisName: string) => {
    // Confirmação antes de deletar
    if (!confirm(`Tem certeza que deseja deletar a análise "${analysisName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    const toastId = toast.loading('Deletando análise...')

    try {
      const response = await fetch(`/api/analise/delete/${analysisId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Análise deletada com sucesso!', { id: toastId })
        
        // Remover da lista
        const updatedAnalyses = analyses.filter(a => a.id !== analysisId)
        setAnalyses(updatedAnalyses)
        
        // Se era a selecionada, selecionar outra
        if (selectedAnalysis?.id === analysisId) {
          setSelectedAnalysis(updatedAnalyses[0] || null)
          setShowDiagnostico(false)
          setDiagnostico(null)
        }
      } else {
        toast.error(data.error || 'Erro ao deletar análise', { id: toastId })
      }
    } catch (error) {
      console.error('Erro ao deletar análise:', error)
      toast.error('Erro ao conectar com o servidor', { id: toastId })
    }
  }

  const handleDownloadCSV = async () => {
    if (!selectedAnalysis) return
    
    try {
      const response = await fetch(`/api/analise/download/${selectedAnalysis.id}?format=csv`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedAnalysis.name.replace(/[^a-z0-9]/gi, '_')}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar CSV:', error)
      alert('Erro ao baixar arquivo CSV')
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handleGerarDiagnostico = async () => {
    if (!selectedAnalysis) return
    
    setLoadingDiagnostico(true)
    const toastId = toast.loading('Gerando diagnóstico...')
    
    try {
      const response = await fetch(`/api/analise/diagnostico/${selectedAnalysis.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDiagnostico(data.diagnostico)
        setShowDiagnostico(true)
        toast.success('Diagnóstico gerado com sucesso!', { id: toastId })
      } else {
        toast.error(data.error || 'Erro ao gerar diagnóstico', { id: toastId })
      }
    } catch (error) {
      console.error('Erro ao gerar diagnóstico:', error)
      toast.error('Erro ao conectar com o servidor', { id: toastId })
    } finally {
      setLoadingDiagnostico(false)
    }
  }

  // const handlePrint = () => {
  //   window.print()
  // }

  const handlePrintDiagnostico = () => {
    if (!diagnostico) return
    
    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return
    
    printWindow.document.write('<html><head><title>Diagnóstico Zootécnico</title>')
    printWindow.document.write('<style>')
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }')
    printWindow.document.write('h1 { color: #10B981; }')
    printWindow.document.write('h2 { color: #374151; margin-top: 20px; }')
    printWindow.document.write('.section { margin-bottom: 20px; }')
    printWindow.document.write('.status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }')
    printWindow.document.write('.status-excelente { background: #D1FAE5; color: #065F46; }')
    printWindow.document.write('.status-bom { background: #DBEAFE; color: #1E40AF; }')
    printWindow.document.write('.status-regular { background: #FEF3C7; color: #92400E; }')
    printWindow.document.write('.status-preocupante { background: #FEE2E2; color: #991B1B; }')
    printWindow.document.write('ul { margin: 10px 0; }')
    printWindow.document.write('</style>')
    printWindow.document.write('</head><body>')
    printWindow.document.write('<h1>Diagnóstico Zootécnico - Análise Especializada</h1>')
    printWindow.document.write(`<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>`)
    
    if (diagnostico.resumoExecutivo) {
      printWindow.document.write('<div class="section"><h2>Resumo Executivo</h2>')
      printWindow.document.write(`<p>${diagnostico.resumoExecutivo}</p></div>`)
    }
    
    if (diagnostico.analiseNumericas && diagnostico.analiseNumericas.length > 0) {
      printWindow.document.write('<div class="section"><h2>Análise de Variáveis Numéricas</h2>')
      diagnostico.analiseNumericas.forEach((analise: {
        variavel: string;
        status: string;
        interpretacao: string;
        comparacaoLiteratura?: string;
      }) => {
        const statusClass = `status-${analise.status?.toLowerCase() || 'regular'}`
        printWindow.document.write(`<h3>${analise.variavel} <span class="status ${statusClass}">${analise.status}</span></h3>`)
        printWindow.document.write(`<p>${analise.interpretacao}</p>`)
        if (analise.comparacaoLiteratura) {
          printWindow.document.write(`<p><em>${analise.comparacaoLiteratura}</em></p>`)
        }
      })
      printWindow.document.write('</div>')
    }
    
    if (diagnostico.pontosFortes && diagnostico.pontosFortes.length > 0) {
      printWindow.document.write('<div class="section"><h2>Pontos Fortes</h2><ul>')
      diagnostico.pontosFortes.forEach((ponto: string) => {
        printWindow.document.write(`<li>${ponto}</li>`)
      })
      printWindow.document.write('</ul></div>')
    }
    
    if (diagnostico.pontosAtencao && diagnostico.pontosAtencao.length > 0) {
      printWindow.document.write('<div class="section"><h2>Pontos de Atenção</h2><ul>')
      diagnostico.pontosAtencao.forEach((ponto: string) => {
        printWindow.document.write(`<li>${ponto}</li>`)
      })
      printWindow.document.write('</ul></div>')
    }
    
    if (diagnostico.recomendacoesPrioritarias && diagnostico.recomendacoesPrioritarias.length > 0) {
      printWindow.document.write('<div class="section"><h2>Recomendações Prioritárias</h2>')
      diagnostico.recomendacoesPrioritarias.forEach((rec: {
        titulo: string;
        descricao: string;
        prioridade: string;
        justificativa?: string;
      }) => {
        printWindow.document.write(`<h3>${rec.prioridade}. ${rec.titulo}</h3>`)
        printWindow.document.write(`<p>${rec.descricao}</p>`)
        if (rec.justificativa) {
          printWindow.document.write(`<p><em>Justificativa: ${rec.justificativa}</em></p>`)
        }
      })
      printWindow.document.write('</div>')
    }
    
    if (diagnostico.conclusao) {
      printWindow.document.write('<div class="section"><h2>Conclusão</h2>')
      printWindow.document.write(`<p>${diagnostico.conclusao}</p></div>`)
    }
    
    if (diagnostico.fontes && diagnostico.fontes.length > 0) {
      printWindow.document.write('<div class="section"><h2>Fontes</h2><ul>')
      diagnostico.fontes.forEach((fonte: string) => {
        printWindow.document.write(`<li>${fonte}</li>`)
      })
      printWindow.document.write('</ul></div>')
    }
    
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  /**
   * Calcular correlações entre variáveis numéricas com priorização inteligente
   * Priorizamos correlações biologicamente relevantes em zootecnia
   */
  const calculateCorrelations = (numericStats: Record<string, unknown>, rawData: Record<string, unknown>[]) => {
    if (!numericStats || !rawData || rawData.length === 0) return []
    
    const variables = Object.keys(numericStats)
    const correlations: Array<{
      var1: string
      var2: string
      correlation: number
      data: Array<{x: number, y: number}>
      relevanceScore: number
      category: string
    }> = []
    
    // Definir pares de variáveis com relevância biológica
    const biologicalPairs = [
      // Crescimento e desenvolvimento
      { keywords1: ['peso_nascimento', 'birth_weight', 'peso_nasc'], keywords2: ['peso_desmame', 'weaning_weight', 'peso_desm'], category: 'Crescimento', score: 10 },
      { keywords1: ['peso_desmame', 'weaning_weight', 'peso_desm'], keywords2: ['peso_atual', 'current_weight', 'peso_final'], category: 'Crescimento', score: 10 },
      { keywords1: ['peso_nascimento', 'birth_weight'], keywords2: ['peso_atual', 'current_weight', 'peso_final'], category: 'Crescimento', score: 9 },
      
      // Morfometria
      { keywords1: ['peso', 'weight'], keywords2: ['altura', 'height', 'cernelha'], category: 'Morfometria', score: 8 },
      { keywords1: ['peso', 'weight'], keywords2: ['perimetro', 'perimeter', 'toracico'], category: 'Morfometria', score: 8 },
      { keywords1: ['altura', 'height'], keywords2: ['perimetro', 'perimeter'], category: 'Morfometria', score: 7 },
      
      // Performance e eficiência
      { keywords1: ['gpd', 'gmd', 'ganho', 'gain'], keywords2: ['peso', 'weight'], category: 'Performance', score: 9 },
      { keywords1: ['consumo', 'intake', 'feed'], keywords2: ['ganho', 'gain', 'gpd'], category: 'Eficiência', score: 9 },
      { keywords1: ['conversao', 'conversion', 'ca'], keywords2: ['ganho', 'gain'], category: 'Eficiência', score: 8 },
      
      // Produção
      { keywords1: ['producao', 'production', 'leite', 'milk'], keywords2: ['peso', 'weight'], category: 'Produção', score: 8 },
      { keywords1: ['gordura', 'fat'], keywords2: ['proteina', 'protein'], category: 'Qualidade', score: 7 },
      
      // Idade e desenvolvimento
      { keywords1: ['idade', 'age', 'meses'], keywords2: ['peso', 'weight'], category: 'Desenvolvimento', score: 9 },
      { keywords1: ['idade', 'age'], keywords2: ['altura', 'height'], category: 'Desenvolvimento', score: 8 },
    ]
    
    /**
     * Calcular score de relevância biológica para um par de variáveis
     */
    const getRelevanceScore = (var1: string, var2: string): { score: number, category: string } => {
      const v1Lower = var1.toLowerCase()
      const v2Lower = var2.toLowerCase()
      
      for (const pair of biologicalPairs) {
        const match1 = pair.keywords1.some(k => v1Lower.includes(k) || v2Lower.includes(k))
        const match2 = pair.keywords2.some(k => v1Lower.includes(k) || v2Lower.includes(k))
        
        if (match1 && match2) {
          return { score: pair.score, category: pair.category }
        }
      }
      
      // Score padrão para outros pares (menor prioridade)
      return { score: 1, category: 'Outros' }
    }
    
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const var1 = variables[i]
        const var2 = variables[j]
        
        // Extrair valores válidos
        const pairs = rawData.map(row => ({
          x: parseFloat(row[var1] as string),
          y: parseFloat(row[var2] as string)
        })).filter(p => !isNaN(p.x) && !isNaN(p.y))
        
        if (pairs.length < 3) continue
        
        // Calcular correlação de Pearson
        const n = pairs.length
        const sumX = pairs.reduce((sum, p) => sum + p.x, 0)
        const sumY = pairs.reduce((sum, p) => sum + p.y, 0)
        const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0)
        const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0)
        const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0)
        
        const numerator = n * sumXY - sumX * sumY
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
        
        if (denominator === 0) continue
        
        const correlation = numerator / denominator
        
        // Calcular relevância biológica
        const { score: relevanceScore, category } = getRelevanceScore(var1, var2)
        
        // Filtro mais permissivo: |r| > 0.25 para pares biologicamente relevantes, |r| > 0.4 para outros
        const threshold = relevanceScore >= 7 ? 0.25 : 0.4
        
        if (Math.abs(correlation) > threshold) {
          correlations.push({ 
            var1, 
            var2, 
            correlation, 
            data: pairs,
            relevanceScore,
            category
          })
        }
      }
    }
    
    // Ordenar por: 1) Relevância biológica, 2) Força da correlação
    return correlations.sort((a, b) => {
      // Primeiro por relevância
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      // Depois por força da correlação
      return Math.abs(b.correlation) - Math.abs(a.correlation)
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <AnalysisLoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  // Parse e compatibilidade com formato antigo
  const analysisData: AnalysisData | null = selectedAnalysis ? (() => {
    const parsed = JSON.parse(selectedAnalysis.data) as AnalysisData
    // Compatibilidade: converter formato antigo para novo
    if (parsed.statistics && !parsed.numericStats) {
      parsed.numericStats = parsed.statistics
    }
    if (parsed.categoricalAnalysis && !parsed.categoricalStats) {
      parsed.categoricalStats = parsed.categoricalAnalysis
    }
    return parsed
  })() : null
  
  interface Metadata {
    totalRows: number;
    totalColumns: number;
    validRows: number;
    zootechnicalCount?: number;
  }
  
  const metadata: Metadata | null = selectedAnalysis && selectedAnalysis.metadata ? JSON.parse(selectedAnalysis.metadata) as Metadata : null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-muted-foreground hover:text-foreground/80"
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resultados das Análises</h1>
              <p className="text-muted-foreground mt-2">
                Visualize e exporte os resultados das suas análises zootécnicas
              </p>
            </div>
            
            {selectedAnalysis && (
              <div className="flex space-x-3 print:hidden">
                <button
                  onClick={handleGerarDiagnostico}
                  disabled={loadingDiagnostico}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
                >
                  {loadingDiagnostico ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Diagnóstico IA
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center px-4 py-2 border border text-foreground/80 bg-card hover:bg-background rounded-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </button>
              </div>
            )}
          </div>

          {analyses.length === 0 ? (
            <div className="bg-card shadow rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma análise encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não realizou nenhuma análise de dados. Comece fazendo upload de um arquivo CSV.
              </p>
              <Link
                href="/dashboard/analise"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Fazer Nova Análise
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lista de Análises */}
              <div className="lg:col-span-1 print:hidden">
                <div className="bg-card shadow rounded-lg p-4">
                  <h3 className="text-lg font-medium text-foreground mb-4">Análises Realizadas</h3>
                  <div className="space-y-2">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className={`relative group rounded-md transition-colors border ${
                          selectedAnalysis?.id === analysis.id
                            ? 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-900'
                            : 'hover:bg-background border'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="w-full text-left p-3 pr-12"
                        >
                          <div className="font-medium text-sm text-foreground truncate">
                            {analysis.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnalysis(analysis.id, analysis.name)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Deletar análise"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados Detalhados */}
              <div className="lg:col-span-3">
                {selectedAnalysis && analysisData && metadata ? (
                  <div className="space-y-6">
                    {/* Resumo Geral */}
                    <div className="bg-card shadow rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Resumo da Análise: {selectedAnalysis.name}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                          title="Total de Registros"
                          value={metadata.totalRows}
                          color="gray"
                        />
                        <StatCard
                          title="Colunas"
                          value={metadata.totalColumns}
                          color="gray"
                        />
                        <StatCard
                          title="Registros Válidos"
                          value={metadata.validRows}
                          color="green"
                        />
                        <StatCard
                          title="Variáveis Zootécnicas"
                          value={metadata.zootechnicalCount || analysisData.zootechnicalVariables?.length || 0}
                          color="blue"
                        />
                      </div>
                    </div>

                    {/* Tabs: Análise Técnica vs Visualização Leiga */}
                    <Tabs
                      defaultTab="technical"
                      tabs={[
                        {
                          id: 'technical',
                          label: 'Análise Técnica',
                          icon: <BarChart3 className="h-4 w-4" />,
                          content: (
                            <>
                              {/* Diagnóstico Zootécnico com IA */}
                              {showDiagnostico && diagnostico && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg rounded-lg p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Activity className="h-6 w-6 text-blue-600 mr-2" />
                            <h3 className="text-xl font-bold text-foreground">Diagnóstico Zootécnico - Análise Especializada</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handlePrintDiagnostico}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                              title="Imprimir/Salvar como PDF"
                            >
                              <Printer className="h-4 w-4" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                            <button
                              onClick={() => setShowDiagnostico(false)}
                              className="text-muted-foreground hover:text-foreground/80 px-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Resumo Executivo */}
                        <div className="bg-card rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            📋 Resumo Executivo
                          </h4>
                          <p className="text-foreground/80 leading-relaxed">{diagnostico.resumoExecutivo}</p>
                        </div>

                        {/* Análises Numéricas */}
                        {diagnostico.analiseNumericas && diagnostico.analiseNumericas.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                              📊 Análise das Variáveis Numéricas
                            </h4>
                            <div className="space-y-3">
                              {diagnostico.analiseNumericas.map((analise: {
                                variavel: string;
                                status: string;
                                interpretacao: string;
                                comparacaoLiteratura?: string;
                              }, idx: number) => (
                                <div key={idx} className="border-l-2 border pl-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-foreground">{analise.variavel}</span>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      analise.status === 'Excelente' ? 'bg-green-100 text-green-800' :
                                      analise.status === 'Bom' ? 'bg-blue-100 text-blue-800' :
                                      analise.status === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {analise.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/80 mb-1">{analise.interpretacao}</p>
                                  {analise.comparacaoLiteratura && (
                                    <p className="text-xs text-muted-foreground italic">📚 {analise.comparacaoLiteratura}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pontos Fortes */}
                        {diagnostico.pontosFortes && diagnostico.pontosFortes.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                              ✅ Pontos Fortes
                            </h4>
                            <ul className="space-y-2">
                              {diagnostico.pontosFortes.map((ponto: string, idx: number) => (
                                <li key={idx} className="flex items-start text-sm text-foreground/80">
                                  <span className="text-green-600 mr-2">▸</span>
                                  {ponto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Pontos de Atenção */}
                        {diagnostico.pontosAtencao && diagnostico.pontosAtencao.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                              ⚠️ Pontos de Atenção
                            </h4>
                            <ul className="space-y-2">
                              {diagnostico.pontosAtencao.map((ponto: string, idx: number) => (
                                <li key={idx} className="flex items-start text-sm text-foreground/80">
                                  <span className="text-orange-600 mr-2">▸</span>
                                  {ponto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recomendações Prioritárias */}
                        {diagnostico.recomendacoesPrioritarias && diagnostico.recomendacoesPrioritarias.length > 0 && (
                          <div className="bg-card rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                              🎯 Recomendações Prioritárias
                            </h4>
                            <div className="space-y-3">
                              {diagnostico.recomendacoesPrioritarias.map((rec: {
                                titulo: string;
                                descricao: string;
                                prioridade: string;
                                justificativa?: string;
                              }, idx: number) => (
                                <div key={idx} className="border border-purple-200 rounded p-3">
                                  <div className="flex items-center mb-1">
                                    <span className="bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                      {rec.prioridade}
                                    </span>
                                    <span className="font-semibold text-foreground">{rec.titulo}</span>
                                  </div>
                                  <p className="text-sm text-foreground/80 ml-8 mb-1">{rec.descricao}</p>
                                  <p className="text-xs text-muted-foreground italic ml-8">💡 {rec.justificativa}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Conclusão */}
                        {diagnostico.conclusao && (
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                              🎓 Conclusão e Perspectivas
                            </h4>
                            <p className="text-foreground leading-relaxed">{diagnostico.conclusao}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Informações sobre Tipos de Variáveis */}
                    {analysisData.variablesInfo && Object.keys(analysisData.variablesInfo).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Info className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Classificação das Variáveis</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(analysisData.variablesInfo).map(([variable, info]: [string, VariableInfo]) => (
                            <div key={variable} className="border border rounded-lg p-3">
                              <div className="font-medium text-foreground text-sm mb-1">{variable}</div>
                              <div className="text-xs text-muted-foreground mb-1">
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {getVariableTypeLabel(info.type)}
                                </span>
                              </div>
                              {info.isZootechnical && (
                                <div className="text-xs text-green-600 font-medium">✓ Zootécnica</div>
                              )}
                              {info.description && (
                                <div className="text-xs text-muted-foreground mt-1">{info.description}</div>
                              )}
                              {info.unit && (
                                <div className="text-xs text-muted-foreground">Unidade: {info.unit}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estatísticas Descritivas - Tabela Detalhada */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <StatsTable 
                          stats={analysisData.numericStats} 
                          title="Estatísticas Descritivas - Variáveis Numéricas"
                        />
                      </div>
                    )}

                    {/* BoxPlot - Distribuição das Variáveis */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Activity className="h-5 w-5 text-green-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Distribuição das Variáveis (BoxPlot)</h3>
                        </div>
                        <BoxPlotChart 
                          data={analysisData.numericStats}
                        />
                      </div>
                    )}

                    {/* Histogramas */}
                    {analysisData.numericStats && Object.keys(analysisData.numericStats).length > 0 && analysisData.rawData && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição de Frequências</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.keys(analysisData.numericStats).slice(0, 4).map((variable) => {
                            const values = analysisData.rawData!
                              .map((row: Record<string, unknown>) => parseFloat(row[variable] as string))
                              .filter((v: number) => !isNaN(v))
                            
                            return values.length > 0 ? (
                              <HistogramChart
                                key={variable}
                                data={values}
                                variableName={variable}
                                title={`Histograma - ${variable}`}
                                bins={10}
                              />
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {/* Gráficos de Pizza para Variáveis Categóricas */}
                    {analysisData.categoricalStats && Object.keys(analysisData.categoricalStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                          <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-foreground">Distribuição de Variáveis Categóricas</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.entries(analysisData.categoricalStats).map(([variable, stats]) => (
                            <PieChartComponent
                              key={variable}
                              data={stats}
                              title={variable}
                              maxSlices={8}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Análise Categórica Detalhada */}
                    {analysisData.categoricalStats && Object.keys(analysisData.categoricalStats).length > 0 && (
                      <div className="bg-card shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Estatísticas das Variáveis Categóricas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(analysisData.categoricalStats).map(([variable, stats]) => (
                            <div key={variable} className="border border rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-3">{variable}</h4>
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Valores únicos:</span>
                                  <span className="font-medium">{stats.uniqueValues}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Mais comum:</span>
                                  <span className="font-medium text-green-600">{stats.mostCommon}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Valores válidos:</span>
                                  <span className="font-medium">{stats.validCount}</span>
                                </div>
                                {stats.entropy !== undefined && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Entropia:</span>
                                    <span className="font-medium">{stats.entropy.toFixed(4)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-foreground/80 mb-2">Distribuição:</div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                  {Object.entries(stats.distribution)
                                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                                    .map(([value, count]: [string, number]) => (
                                      <div key={value} className="flex justify-between text-sm">
                                        <span className="text-foreground/80 truncate mr-2">{value}</span>
                                        <span className="font-medium whitespace-nowrap">
                                          {count} ({typeof stats.frequencies[value] === 'number' ? stats.frequencies[value] : stats.frequencies[value]}%)
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gráficos de Dispersão - Correlações Significativas */}
                    {analysisData.numericStats && 
                     Object.keys(analysisData.numericStats).length >= 2 && 
                     analysisData.rawData && (() => {
                        const correlations = calculateCorrelations(analysisData.numericStats, analysisData.rawData)
                        return correlations.length > 0 ? (
                          <div className="bg-card shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <GitCompare className="h-5 w-5 text-purple-600 mr-2" />
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">Análise de Correlações Biologicamente Relevantes</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Priorizadas por relevância zootécnica • {correlations.length} correlações encontradas
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Legenda de categorias */}
                            <div className="mb-6 flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                📈 Crescimento
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                📏 Morfometria
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                ⚡ Performance
                              </span>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded">
                                🎯 Eficiência
                              </span>
                              <span className="px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 rounded">
                                🥛 Produção
                              </span>
                              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 rounded">
                                🧬 Desenvolvimento
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {correlations.slice(0, 12).map((corr, idx) => (
                                <div key={idx} className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm text-foreground">
                                        {corr.var1} vs {corr.var2}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-xs rounded ${
                                          corr.category === 'Crescimento' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                          corr.category === 'Morfometria' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                          corr.category === 'Performance' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                          corr.category === 'Eficiência' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                          corr.category === 'Produção' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                                          corr.category === 'Desenvolvimento' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }`}>
                                          {corr.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          Relevância: {corr.relevanceScore}/10
                                        </span>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                      Math.abs(corr.correlation) > 0.7 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                      Math.abs(corr.correlation) > 0.5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                      r = {corr.correlation.toFixed(3)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {Math.abs(corr.correlation) > 0.7 ? '🔴 Correlação forte' :
                                     Math.abs(corr.correlation) > 0.5 ? '🟠 Correlação moderada' :
                                     Math.abs(corr.correlation) > 0.3 ? '🟡 Correlação fraca positiva' :
                                     '⚪ Correlação fraca'}
                                    {corr.correlation > 0 ? ' positiva' : ' negativa'}
                                  </div>
                                  <ScatterPlotChart
                                    data={analysisData.rawData || []}
                                    xKey={corr.var1}
                                    yKey={corr.var2}
                                    title=""
                                  />
                                </div>
                              ))}
                            </div>
                            {correlations.length > 12 && (
                              <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Mostrando as 12 correlações mais relevantes de {correlations.length} encontradas
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  💡 As correlações são priorizadas por relevância biológica e força estatística
                                </p>
                              </div>
                            )}
                          </div>
                        ) : null
                      })()
                    }
                            </>
                          ),
                        },
                        {
                          id: 'layman',
                          label: 'Visualização Leiga',
                          icon: <User className="h-4 w-4" />,
                          content: (
                            <LaymanTab 
                              analysisData={analysisData as Record<string, unknown>}
                              entityType="gado"
                            />
                          ),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="bg-card shadow rounded-lg p-8 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Selecione uma análise</h3>
                    <p className="text-muted-foreground">
                      Escolha uma análise da lista ao lado para visualizar os resultados detalhados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
