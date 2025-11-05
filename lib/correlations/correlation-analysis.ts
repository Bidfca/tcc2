/**
 * Correlation Analysis Service
 * 
 * Automatically detects, calculates, and interprets correlations
 * based on species-specific biological relevance
 */

import { getSpeciesCorrelationConfig, CorrelationPair } from './species-correlations'
import { pearsonCorrelation } from '../statistics'

export interface CorrelationResult {
  var1: string
  var2: string
  coefficient: number
  pValue: number
  significant: boolean
  strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong'
  direction: 'positive' | 'negative' | 'none'
  relevanceScore: number
  category: string
  interpretation: string
  expectedDirection: 'positive' | 'negative' | 'either'
  matchesExpectation: boolean
  dataPoints: Array<{ x: number; y: number }>
  idealRange?: { min: number; max: number }
}

export interface CorrelationAnalysisReport {
  totalCorrelations: number
  significantCorrelations: number
  highRelevanceCorrelations: number
  correlationsByCategory: Record<string, number>
  topCorrelations: CorrelationResult[]
  allCorrelations: CorrelationResult[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Main correlation analysis function
 */
export function analyzeCorrelations(
  data: Record<string, unknown>[],
  species: string,
  options: {
    maxCorrelations?: number
    minRelevanceScore?: number
    minDataPoints?: number
    significanceLevel?: number
  } = {}
): CorrelationAnalysisReport {
  const {
    maxCorrelations = 20,
    minRelevanceScore = 5,
    minDataPoints = 10,
    significanceLevel = 0.05
  } = options

  const config = getSpeciesCorrelationConfig(species)
  if (!config) {
    return {
      totalCorrelations: 0,
      significantCorrelations: 0,
      highRelevanceCorrelations: 0,
      correlationsByCategory: {},
      topCorrelations: [],
      allCorrelations: [],
      warnings: [`Configuração de correlação não encontrada para espécie: ${species}`],
      recommendations: []
    }
  }

  const warnings: string[] = []
  const recommendations: string[] = []
  const allCorrelations: CorrelationResult[] = []

  const numericColumns = getNumericColumns(data)
  
  if (numericColumns.length < 2) {
    warnings.push('Dados insuficientes: são necessárias pelo menos 2 variáveis numéricas')
    return {
      totalCorrelations: 0,
      significantCorrelations: 0,
      highRelevanceCorrelations: 0,
      correlationsByCategory: {},
      topCorrelations: [],
      allCorrelations: [],
      warnings,
      recommendations
    }
  }

  for (const pair of config.correlationPairs) {
    const matchedPair = findMatchingVariables(numericColumns, pair)
    
    if (matchedPair) {
      const { var1, var2 } = matchedPair
      
      const dataPoints = extractDataPoints(data, var1, var2)
      
      if (dataPoints.length >= minDataPoints) {
        try {
          const xValues = dataPoints.map(p => p.x)
          const yValues = dataPoints.map(p => p.y)
          
          const corrResult = pearsonCorrelation(xValues, yValues, significanceLevel)
          
          const matchesExpectation = checkExpectedDirection(
            corrResult.coefficient,
            pair.expectedDirection
          )
          
          const strengthPt = getStrengthLabel(corrResult.strength)
          
          const result: CorrelationResult = {
            var1,
            var2,
            coefficient: corrResult.coefficient,
            pValue: corrResult.pValue,
            significant: corrResult.significant,
            strength: corrResult.strength,
            direction: corrResult.direction,
            relevanceScore: pair.relevanceScore,
            category: pair.category,
            interpretation: pair.interpretation,
            expectedDirection: pair.expectedDirection,
            matchesExpectation,
            dataPoints,
            idealRange: pair.idealRange
          }
          
          allCorrelations.push(result)
          
          if (corrResult.significant && !matchesExpectation) {
            warnings.push(
              `⚠️ Correlação inesperada: ${var1} vs ${var2} - ` +
              `esperado ${pair.expectedDirection}, encontrado ${corrResult.direction}`
            )
          }
          
          if (corrResult.significant && pair.relevanceScore >= 8 && Math.abs(corrResult.coefficient) > 0.6) {
            recommendations.push(
              `✅ ${pair.category}: ${var1} e ${var2} apresentam correlação ${strengthPt} ` +
              `(r = ${corrResult.coefficient.toFixed(3)}). ${pair.interpretation}`
            )
          }
          
        } catch (err) {
          console.warn(`Erro ao calcular correlação ${var1} vs ${var2}:`, err)
        }
      }
    }
  }

  const additionalCorrelations = calculateAdditionalCorrelations(
    data,
    numericColumns,
    allCorrelations,
    minDataPoints,
    significanceLevel
  )
  
  allCorrelations.push(...additionalCorrelations)

  const filteredCorrelations = allCorrelations.filter(
    c => c.relevanceScore >= minRelevanceScore
  )

  const sortedCorrelations = filteredCorrelations.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    return Math.abs(b.coefficient) - Math.abs(a.coefficient)
  })

  const topCorrelations = sortedCorrelations.slice(0, maxCorrelations)

  const significantCorrelations = allCorrelations.filter(c => c.significant).length
  const highRelevanceCorrelations = allCorrelations.filter(c => c.relevanceScore >= 8).length
  
  const correlationsByCategory: Record<string, number> = {}
  for (const corr of allCorrelations) {
    correlationsByCategory[corr.category] = (correlationsByCategory[corr.category] || 0) + 1
  }

  if (significantCorrelations === 0) {
    recommendations.push('⚠️ Nenhuma correlação significativa encontrada. Verifique a qualidade e variabilidade dos dados.')
  } else if (significantCorrelations < 3) {
    recommendations.push('📊 Poucas correlações significativas. Considere coletar mais dados ou variáveis adicionais.')
  }

  return {
    totalCorrelations: allCorrelations.length,
    significantCorrelations,
    highRelevanceCorrelations,
    correlationsByCategory,
    topCorrelations,
    allCorrelations: sortedCorrelations,
    warnings,
    recommendations
  }
}

/**
 * Get numeric columns from dataset
 */
function getNumericColumns(data: Record<string, unknown>[]): string[] {
  if (data.length === 0) return []
  
  const firstRow = data[0]
  return Object.keys(firstRow).filter(key => {
    const value = firstRow[key]
    return typeof value === 'number' && !isNaN(value)
  })
}

/**
 * Find matching variables for a correlation pair
 */
function findMatchingVariables(
  availableColumns: string[],
  pair: CorrelationPair
): { var1: string; var2: string } | null {
  let var1: string | null = null
  let var2: string | null = null

  for (const col of availableColumns) {
    const colLower = col.toLowerCase()
    if (pair.var1Keywords.some(keyword => colLower.includes(keyword.toLowerCase()))) {
      var1 = col
      break
    }
  }

  for (const col of availableColumns) {
    const colLower = col.toLowerCase()
    if (pair.var2Keywords.some(keyword => colLower.includes(keyword.toLowerCase()))) {
      var2 = col
      break
    }
  }

  if (var1 && var2 && var1 !== var2) {
    return { var1, var2 }
  }

  return null
}

/**
 * Extract valid data points for two variables
 */
function extractDataPoints(
  data: Record<string, unknown>[],
  var1: string,
  var2: string
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []

  for (const row of data) {
    const x = parseFloat(row[var1] as string)
    const y = parseFloat(row[var2] as string)

    if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Check if correlation matches expected direction
 */
function checkExpectedDirection(
  coefficient: number,
  expected: 'positive' | 'negative' | 'either'
): boolean {
  if (expected === 'either') return true
  if (expected === 'positive') return coefficient > 0
  if (expected === 'negative') return coefficient < 0
  return true
}

/**
 * Get strength label in Portuguese
 */
function getStrengthLabel(strength: string): string {
  const labels: Record<string, string> = {
    'very weak': 'muito fraca',
    'weak': 'fraca',
    'moderate': 'moderada',
    'strong': 'forte',
    'very strong': 'muito forte'
  }
  return labels[strength] || strength
}

/**
 * Calculate additional correlations for pairs not in the config
 */
function calculateAdditionalCorrelations(
  data: Record<string, unknown>[],
  numericColumns: string[],
  existingCorrelations: CorrelationResult[],
  minDataPoints: number,
  significanceLevel: number
): CorrelationResult[] {
  const additionalCorrelations: CorrelationResult[] = []
  const existingPairs = new Set(
    existingCorrelations.map(c => `${c.var1}|${c.var2}`)
  )

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const var1 = numericColumns[i]
      const var2 = numericColumns[j]
      const pairKey = `${var1}|${var2}`

      if (existingPairs.has(pairKey)) continue

      const dataPoints = extractDataPoints(data, var1, var2)

      if (dataPoints.length >= minDataPoints) {
        try {
          const xValues = dataPoints.map(p => p.x)
          const yValues = dataPoints.map(p => p.y)

          const corrResult = pearsonCorrelation(xValues, yValues, significanceLevel)

          if (Math.abs(corrResult.coefficient) >= 0.4) {
            additionalCorrelations.push({
              var1,
              var2,
              coefficient: corrResult.coefficient,
              pValue: corrResult.pValue,
              significant: corrResult.significant,
              strength: corrResult.strength,
              direction: corrResult.direction,
              relevanceScore: 3,
              category: 'Outros',
              interpretation: 'Correlação detectada automaticamente entre variáveis',
              expectedDirection: 'either',
              matchesExpectation: true,
              dataPoints
            })
          }
        } catch {
          continue
        }
      }
    }
  }

  return additionalCorrelations
}

/**
 * Generate detailed interpretation for a correlation
 */
export function generateCorrelationInterpretation(
  correlation: CorrelationResult
): string {
  const { coefficient, significant, strength, category, interpretation, matchesExpectation } = correlation
  
  const absCoeff = Math.abs(coefficient)
  const direction = coefficient > 0 ? 'positiva' : 'negativa'
  const strengthPt = getStrengthLabel(strength)

  let text = `**${correlation.var1} vs ${correlation.var2}** (${category})\n\n`
  
  text += `📊 **Coeficiente de Pearson:** r = ${coefficient.toFixed(3)}\n`
  text += `📈 **Força:** ${strengthPt} ${direction}\n`
  text += `🎯 **Relevância Biológica:** ${correlation.relevanceScore}/10\n`
  text += `📉 **Significância:** ${significant ? 'Sim' : 'Não'} (p = ${correlation.pValue.toFixed(4)})\n\n`

  if (!matchesExpectation) {
    text += `⚠️ **Atenção:** Esta correlação não corresponde ao padrão esperado (${correlation.expectedDirection}). `
    text += `Isso pode indicar problemas nos dados ou condições atípicas no manejo.\n\n`
  }

  text += `**Interpretação Zootécnica:**\n${interpretation}\n\n`

  if (significant && absCoeff > 0.6) {
    text += `**Recomendações:**\n`
    
    if (category === 'Crescimento') {
      text += `- Utilize esta correlação forte para predição de desempenho\n`
      text += `- Considere para seleção genética e melhoramento\n`
    } else if (category === 'Eficiência') {
      text += `- Monitore estas variáveis para otimização econômica\n`
      text += `- Ajuste manejo nutricional baseado nesta relação\n`
    } else if (category === 'Qualidade') {
      text += `- Use como indicador de qualidade do produto\n`
      text += `- Considere para estratificação de preços\n`
    } else if (category === 'Produção') {
      text += `- Importante para planejamento produtivo\n`
      text += `- Considere para estimativas de produção\n`
    }
  } else if (!significant) {
    text += `**Nota:** Correlação não significativa estatisticamente. `
    text += `Pode ser necessário mais dados ou as variáveis podem ser independentes.\n`
  }

  return text
}

/**
 * Propose correlations to analyze based on available data
 */
export function proposeCorrelations(
  availableColumns: string[],
  species: string
): Array<{ var1: string; var2: string; reason: string; priority: number }> {
  const config = getSpeciesCorrelationConfig(species)
  if (!config) return []

  const proposals: Array<{ var1: string; var2: string; reason: string; priority: number }> = []

  for (const pair of config.correlationPairs) {
    const matched = findMatchingVariables(availableColumns, pair)
    
    if (matched) {
      proposals.push({
        var1: matched.var1,
        var2: matched.var2,
        reason: `${pair.category}: ${pair.interpretation}`,
        priority: pair.relevanceScore
      })
    }
  }

  return proposals.sort((a, b) => b.priority - a.priority)
}

/**
 * Get missing important variables for correlation analysis
 */
export function getMissingVariables(
  availableColumns: string[],
  species: string
): Array<{ variable: string; importance: string; reason: string }> {
  const config = getSpeciesCorrelationConfig(species)
  if (!config) return []

  const missing: Array<{ variable: string; importance: string; reason: string }> = []
  const availableLower = availableColumns.map(c => c.toLowerCase())

  const highPriorityPairs = config.correlationPairs.filter(p => p.relevanceScore >= 8)
  
  for (const pair of highPriorityPairs) {
    const hasVar1 = pair.var1Keywords.some(keyword => 
      availableLower.some(col => col.includes(keyword.toLowerCase()))
    )
    
    if (!hasVar1) {
      missing.push({
        variable: pair.var1Keywords[0],
        importance: 'Alta',
        reason: `Necessário para análise de ${pair.category}: ${pair.interpretation}`
      })
    }

    const hasVar2 = pair.var2Keywords.some(keyword => 
      availableLower.some(col => col.includes(keyword.toLowerCase()))
    )
    
    if (!hasVar2) {
      missing.push({
        variable: pair.var2Keywords[0],
        importance: 'Alta',
        reason: `Necessário para análise de ${pair.category}: ${pair.interpretation}`
      })
    }
  }

  const uniqueMissing = Array.from(
    new Map(missing.map(item => [item.variable, item])).values()
  )

  return uniqueMissing.slice(0, 10) // Return top 10 missing variables
}
