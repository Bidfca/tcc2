/**
 * DIAGNÓSTICO ZOOTÉCNICO AUTOMÁTICO (SEM IA)
 * 
 * Baseado em:
 * - EMBRAPA Gado de Corte - Parâmetros Zootécnicos
 * - NRC (National Research Council) - Nutrient Requirements
 * - Literatura científica consolidada
 */

interface NumericStats {
  validCount: number
  mean: string
  median: string
  stdDev: string
  min: string
  max: string
  q1: string
  q3: string
  cv: string
  outliers: number[]
}

interface DiagnosticoLocal {
  resumoExecutivo: string
  analiseNumericas: Array<{
    variavel: string
    interpretacao: string
    comparacaoLiteratura: string
    status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante'
  }>
  analiseCategoricas: Array<{
    variavel: string
    interpretacao: string
    distribuicao: string
  }>
  pontosFortes: string[]
  pontosAtencao: string[]
  recomendacoesPrioritarias: Array<{
    prioridade: number
    titulo: string
    descricao: string
    justificativa: string
  }>
  conclusao: string
  fontes: string[]
}

/**
 * VALORES DE REFERÊNCIA ZOOTÉCNICOS
 * Fontes: EMBRAPA, NRC, literatura científica
 */
const REFERENCIAS = {
  peso_nascimento: { 
    min: 28, ideal_min: 30, ideal_max: 38, max: 45,
    fonte: 'EMBRAPA Gado de Corte (2020)'
  },
  peso_desmame_210d: { 
    min: 160, ideal_min: 180, ideal_max: 250, max: 280,
    fonte: 'Manual Brasileiro de Boas Práticas Agropecuárias'
  },
  gpd: { 
    min: 0.4, ideal_min: 0.8, ideal_max: 1.4, max: 1.8,
    fonte: 'NRC - Nutrient Requirements of Beef Cattle'
  },
  conversao_alimentar: {
    min: 5, ideal_min: 6, ideal_max: 9, max: 12,
    fonte: 'Manual de Confinamento ASBIA'
  },
  taxa_nascimento: {
    min: 70, ideal_min: 85, ideal_max: 95, max: 100,
    fonte: 'EMBRAPA - Índices Reprodutivos'
  },
  cv_aceitavel: {
    excelente: 15, bom: 25, regular: 35,
    fonte: 'Análise Estatística Aplicada à Zootecnia'
  }
}

function identificarTipoVariavel(nome: string): keyof typeof REFERENCIAS | null {
  const lower = nome.toLowerCase()
  if (lower.includes('gpd') || (lower.includes('ganho') && lower.includes('peso'))) return 'gpd'
  if (lower.includes('peso') && (lower.includes('nasc') || lower.includes('birth'))) return 'peso_nascimento'
  if (lower.includes('peso') && (lower.includes('desmame') || lower.includes('wean'))) return 'peso_desmame_210d'
  if (lower.includes('conversao') || lower.includes('ca')) return 'conversao_alimentar'
  if (lower.includes('taxa') && lower.includes('nasc')) return 'taxa_nascimento'
  return null
}

function avaliarStatus(valor: number, ref: { min: number; ideal_min?: number; ideal_max?: number; max: number; fonte: string }): {
  status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante',
  interpretacao: string
} {
  if (ref.ideal_min !== undefined && ref.ideal_max !== undefined) {
    if (valor >= ref.ideal_min && valor <= ref.ideal_max) {
      return { status: 'Excelente', interpretacao: `Valor dentro da faixa ideal (${ref.ideal_min}-${ref.ideal_max}).` }
    }
    if (valor >= ref.min && valor < ref.ideal_min) {
      return { status: 'Bom', interpretacao: `Valor aceitável, mas abaixo do ideal (${ref.ideal_min}-${ref.ideal_max}).` }
    }
    if (valor > ref.ideal_max && valor <= ref.max) {
      return { status: 'Regular', interpretacao: `Valor acima do ideal, mas ainda aceitável (${ref.ideal_min}-${ref.ideal_max}).` }
    }
    if (valor < ref.min || valor > ref.max) {
      return { status: 'Preocupante', interpretacao: `Valor fora dos limites aceitáveis (${ref.min}-${ref.max}).` }
    }
  }
  return { status: 'Regular', interpretacao: 'Valor requer análise mais detalhada.' }
}

export function gerarDiagnosticoLocal(
  numericStats: Record<string, NumericStats>,
  categoricalStats: Record<string, unknown>,
  datasetName: string,
  totalRows: number
): DiagnosticoLocal {
  
  const analiseNumericas = []
  const pontosFortes: string[] = []
  const pontosAtencao: string[] = []
  const fontesUsadas = new Set<string>()
  let variaveis_excelentes = 0
  let variaveis_problematicas = 0

  for (const [varName, stats] of Object.entries(numericStats)) {
    const mean = parseFloat(stats.mean)
    const cv = parseFloat(stats.cv)
    const tipoVar = identificarTipoVariavel(varName)
    
    let status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante' = 'Regular'
    let interpretacao = ''
    let comparacao = ''

    if (tipoVar && tipoVar in REFERENCIAS && tipoVar !== 'cv_aceitavel') {
      const ref = REFERENCIAS[tipoVar]
      const avaliacao = avaliarStatus(mean, ref as { min: number; ideal_min?: number; ideal_max?: number; max: number; fonte: string })
      status = avaliacao.status
      interpretacao = `Média de ${stats.mean}: ${avaliacao.interpretacao}`
      comparacao = `Referência: ${ref.fonte}`
      fontesUsadas.add(ref.fonte)
      
      if (status === 'Excelente') {
        pontosFortes.push(`${varName}: ${stats.mean} (Excelente)`)
        variaveis_excelentes++
      } else if (status === 'Preocupante') {
        pontosAtencao.push(`${varName}: ${stats.mean} (Necessita atenção)`)
        variaveis_problematicas++
      }
    } else {
      const cvRef = REFERENCIAS.cv_aceitavel
      if (cv < cvRef.excelente) {
        status = 'Excelente'
        interpretacao = `Média de ${stats.mean} com excelente uniformidade (CV=${stats.cv}%).`
        comparacao = `CV% < ${cvRef.excelente}% indica lote muito uniforme.`
      } else if (cv < cvRef.bom) {
        status = 'Bom'
        interpretacao = `Média de ${stats.mean} com boa uniformidade (CV=${stats.cv}%).`
        comparacao = `CV% < ${cvRef.bom}% é aceitável.`
      } else if (cv < cvRef.regular) {
        status = 'Regular'
        interpretacao = `Média de ${stats.mean} com variação moderada (CV=${stats.cv}%).`
        comparacao = `CV% entre ${cvRef.bom}-${cvRef.regular}% sugere lote heterogêneo.`
        pontosAtencao.push(`${varName}: alta variação (CV=${stats.cv}%)`)
      } else {
        status = 'Preocupante'
        interpretacao = `Média de ${stats.mean} com variação muito alta (CV=${stats.cv}%).`
        comparacao = `CV% > ${cvRef.regular}% indica problemas de uniformidade.`
        pontosAtencao.push(`${varName}: variação crítica (CV=${stats.cv}%)`)
        variaveis_problematicas++
      }
      fontesUsadas.add(cvRef.fonte)
    }

    analiseNumericas.push({ variavel: varName, interpretacao, comparacaoLiteratura: comparacao, status })
  }

  const analiseCategoricas = []
  if (categoricalStats) {
    for (const [varName, stats] of Object.entries(categoricalStats)) {
      const s = stats as { uniqueValues?: number; mode?: string }
      analiseCategoricas.push({
        variavel: varName,
        interpretacao: `Identificadas ${s.uniqueValues || 0} categorias distintas.`,
        distribuicao: `Categoria mais frequente: ${s.mode || 'N/A'}`
      })
    }
  }

  const recomendacoes = []
  if (variaveis_problematicas > 0) {
    recomendacoes.push({
      prioridade: 1,
      titulo: 'Corrigir Indicadores Críticos',
      descricao: 'Focar nas variáveis identificadas como "Preocupante" na análise.',
      justificativa: `${variaveis_problematicas} indicador(es) estão fora dos padrões recomendados.`
    })
  }
  if (pontosAtencao.some(a => a.toLowerCase().includes('peso') || a.toLowerCase().includes('gpd'))) {
    recomendacoes.push({
      prioridade: 2,
      titulo: 'Revisar Programa Nutricional',
      descricao: 'Avaliar qualidade e quantidade de alimentos fornecidos.',
      justificativa: 'Indicadores de peso/ganho abaixo do esperado sugerem deficiências nutricionais.'
    })
  }
  recomendacoes.push({
    prioridade: recomendacoes.length + 1,
    titulo: 'Estabelecer Protocolo de Monitoramento',
    descricao: 'Realizar avaliações periódicas dos principais indicadores.',
    justificativa: 'Acompanhamento contínuo permite ajustes rápidos.'
  })

  const resumoExecutivo = `Análise técnica de ${totalRows.toLocaleString()} registros do dataset "${datasetName}". Avaliadas ${Object.keys(numericStats).length} variáveis numéricas com base em referências zootécnicas. Resultado: ${variaveis_excelentes} excelente(s), ${variaveis_problematicas} necessita(m) intervenção.`

  const conclusao = variaveis_excelentes > variaveis_problematicas * 2
    ? `O sistema/rebanho avaliado (n=${totalRows}) apresenta desempenho satisfatório. As boas práticas atuais devem ser mantidas.`
    : `O sistema/rebanho avaliado (n=${totalRows}) apresenta indicadores dentro da média. Implementar as recomendações pode resultar em ganhos de produtividade.`

  return {
    resumoExecutivo,
    analiseNumericas,
    analiseCategoricas,
    pontosFortes: pontosFortes.length > 0 ? pontosFortes : ['Dados organizados e analisáveis'],
    pontosAtencao: pontosAtencao.length > 0 ? pontosAtencao : ['Continuar monitoramento dos indicadores'],
    recomendacoesPrioritarias: recomendacoes,
    conclusao,
    fontes: Array.from(fontesUsadas)
  }
}
