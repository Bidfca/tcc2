/**
 * EN: Data Analysis Library - Statistical analysis and variable type detection for zootechnical data
 * PT-BR: Biblioteca de Análise de Dados - Análise estatística e detecção de tipo de variável para dados zootécnicos
 * 
 * EN: This module provides comprehensive statistical analysis functions for agricultural datasets,
 *     including automatic variable type detection, descriptive statistics, and zootechnical variable identification.
 * PT-BR: Este módulo fornece funções abrangentes de análise estatística para conjuntos de dados agrícolas,
 *        incluindo detecção automática de tipo de variável, estatísticas descritivas e identificação de variáveis zootécnicas.
 */

/**
 * EN: Variable type enumeration for classification
 * PT-BR: Enumeração de tipo de variável para classificação
 */
export enum VariableType {
  QUANTITATIVE_CONTINUOUS = 'QUANTITATIVE_CONTINUOUS', // EN: Continuous numeric values (weight, height) | PT-BR: Valores numéricos contínuos (peso, altura)
  QUANTITATIVE_DISCRETE = 'QUANTITATIVE_DISCRETE',     // EN: Discrete numeric values (count) | PT-BR: Valores numéricos discretos (contagem)
  QUALITATIVE_NOMINAL = 'QUALITATIVE_NOMINAL',         // EN: Categorical without order (breed, sex) | PT-BR: Categóricos sem ordem (raça, sexo)
  QUALITATIVE_ORDINAL = 'QUALITATIVE_ORDINAL',         // EN: Categorical with order (score) | PT-BR: Categóricos com ordem (escore)
  TEMPORAL = 'TEMPORAL',                               // EN: Date/time | PT-BR: Data/tempo
  IDENTIFIER = 'IDENTIFIER'                            // EN: IDs, codes | PT-BR: IDs, códigos
}

export interface VariableInfo {
  name: string
  type: VariableType
  rawType: 'numeric' | 'string' | 'date' | 'mixed'
  isZootechnical: boolean
  description?: string
  unit?: string
}

export interface NumericStats {
  count: number
  validCount: number
  missingCount: number
  mean: number
  median: number
  mode?: number
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
  cv: number // Coeficiente de variação
  skewness?: number
  outliers: number[]
}

export interface CategoricalStats {
  count: number
  validCount: number
  missingCount: number
  uniqueValues: number
  distribution: Record<string, number>
  frequencies: Record<string, number> // Porcentagens
  mostCommon: string
  leastCommon: string
  entropy?: number
}

// Palavras-chave expandidas para detecção zootécnica
const ZOOTECHNICAL_KEYWORDS = {
  // Identificação e classificação
  raca: ['raca', 'raça', 'breed', 'race'],
  sexo: ['sexo', 'genero', 'gênero', 'sex', 'gender'],
  idade: ['idade', 'era', 'age', 'meses', 'months', 'dias', 'days'],
  
  // Pesos e medidas
  peso: ['peso', 'weight', 'kg', 'quilos', 'kilos'],
  altura: ['altura', 'height', 'cm', 'centimetros'],
  perimetro: ['perimetro', 'perímetro', 'perimeter', 'toracico', 'torácico'],
  
  // Performance e ganho
  gpd: ['gpd', 'gmd', 'ganho', 'gain', 'diario', 'diário', 'daily'],
  conversao: ['conversao', 'conversão', 'alimentar', 'feed', 'conversion'],
  
  // Carcaça e qualidade
  rendimento: ['rendimento', 'yield', 'carcaca', 'carcaça', 'carcass'],
  aol: ['aol', 'olho', 'lombo', 'ribeye', 'eye'],
  escore: ['escore', 'score', 'corporal', 'body', 'condicao', 'condição'],
  gordura: ['gordura', 'fat', 'acabamento', 'finishing', 'marbling'],
  classificacao: ['classificacao', 'classificação', 'classification', 'grade'],
  
  // Sanidade
  vacinacao: ['vacinacao', 'vacinação', 'vaccination', 'vaccine'],
  vermifugacao: ['vermifugacao', 'vermifugação', 'deworming'],
  
  // Produção e manejo
  sistema: ['sistema', 'system', 'producao', 'produção', 'production'],
  dieta: ['dieta', 'diet', 'alimentacao', 'alimentação', 'feed'],
  consumo: ['consumo', 'consumption', 'intake'],
  
  // Econômico
  valor: ['valor', 'value', 'preco', 'preço', 'price', 'custo', 'cost'],
  arroba: ['arroba', '@'],
  
  // Temporal
  ano: ['ano', 'year'],
  mes: ['mes', 'mês', 'month'],
  trimestre: ['trimestre', 'quarter'],
  
  // Geográfico
  estado: ['estado', 'state', 'uf'],
  regiao: ['regiao', 'região', 'region'],
  
  // Outros
  quantidade: ['quantidade', 'quantity', 'numero', 'número', 'number', 'animais', 'animals']
}

/**
 * EN: Detect variable type based on column name and data values
 * PT-BR: Detectar tipo de variável baseado no nome da coluna e valores de dados
 * 
 * EN: Uses heuristics to classify variables as quantitative, qualitative, temporal, or identifier.
 *     Also identifies zootechnical variables using keyword matching.
 * PT-BR: Usa heurísticas para classificar variáveis como quantitativas, qualitativas, temporais ou identificador.
 *        Também identifica variáveis zootécnicas usando correspondência de palavras-chave.
 * 
 * @param columnName - EN: Column header name | PT-BR: Nome do cabeçalho da coluna
 * @param values - EN: Array of column values | PT-BR: Array de valores da coluna
 * @returns EN: Variable information with type and metadata | PT-BR: Informações da variável com tipo e metadados
 */
export function detectVariableType(
  columnName: string,
  values: unknown[]
): VariableInfo {
  const cleanValues = values.filter(v => v !== null && v !== undefined && v !== '')
  const columnNameLower = columnName.toLowerCase()
  
  // Verificar se é zootécnico
  const isZootechnical = Object.values(ZOOTECHNICAL_KEYWORDS)
    .flat()
    .some(keyword => columnNameLower.includes(keyword))
  
  // Detectar tipo bruto
  let numericCount = 0
  // let stringCount = 0
  let dateCount = 0
  
  const numericValues: number[] = []
  
  cleanValues.forEach(value => {
    const numValue = parseFloat(String(value).replace(',', '.'))
    if (!isNaN(numValue)) {
      numericCount++
      numericValues.push(numValue)
    } else if (isDateString(String(value))) {
      dateCount++
    } // else {
      // stringCount++
    // }
  })
  
  const total = cleanValues.length
  const numericRatio = numericCount / total
  
  // Determinar tipo
  let type: VariableType
  let rawType: 'numeric' | 'string' | 'date' | 'mixed'
  
  // Temporal
  if (dateCount / total > 0.8 || 
      ['ano', 'year', 'data', 'date'].some(kw => columnNameLower.includes(kw))) {
    type = VariableType.TEMPORAL
    rawType = 'date'
  }
  // Identificador
  else if (
    columnNameLower.includes('id') || 
    columnNameLower.includes('codigo') ||
    columnNameLower.includes('código') ||
    (cleanValues.length === new Set(cleanValues).size && numericRatio < 0.5)
  ) {
    type = VariableType.IDENTIFIER
    rawType = 'string'
  }
  // Numérico
  else if (numericRatio > 0.9) {
    rawType = 'numeric'
    
    // Verificar se é discreto ou contínuo
    const uniqueValues = new Set(numericValues)
    const uniqueRatio = uniqueValues.size / numericValues.length
    const hasDecimals = numericValues.some(v => v % 1 !== 0)
    
    // Heurística: se tem poucos valores únicos e sem decimais, é discreto
    if (uniqueRatio < 0.1 && !hasDecimals) {
      type = VariableType.QUANTITATIVE_DISCRETE
    } else {
      type = VariableType.QUANTITATIVE_CONTINUOUS
    }
  }
  // Categórico
  else {
    rawType = 'string'
    
    // Verificar se é ordinal (escore, classificação)
    const ordinalKeywords = ['escore', 'score', 'classificacao', 'classification', 'grade', 'nivel', 'level']
    const isOrdinal = ordinalKeywords.some(kw => columnNameLower.includes(kw))
    
    type = isOrdinal ? VariableType.QUALITATIVE_ORDINAL : VariableType.QUALITATIVE_NOMINAL
  }
  
  return {
    name: columnName,
    type,
    rawType,
    isZootechnical,
    description: getVariableDescription(columnNameLower),
    unit: getVariableUnit(columnNameLower)
  }
}

/**
 * EN: Calculate descriptive statistics for numeric variables
 * PT-BR: Calcular estatísticas descritivas para variáveis numéricas
 * 
 * EN: Computes mean, median, mode, standard deviation, quartiles, outliers, and other statistics
 * PT-BR: Calcula média, mediana, moda, desvio padrão, quartis, outliers e outras estatísticas
 * 
 * @param values - EN: Array of numeric values | PT-BR: Array de valores numéricos
 * @returns EN: Comprehensive numeric statistics | PT-BR: Estatísticas numéricas abrangentes
 */
export function calculateNumericStats(values: unknown[]): NumericStats {
  const numericValues = values
    .map(v => {
      if (typeof v === 'number') return v
      const parsed = parseFloat(String(v).replace(',', '.'))
      return isNaN(parsed) ? null : parsed
    })
    .filter((v): v is number => v !== null)
  
  if (numericValues.length === 0) {
    throw new Error('Nenhum valor numérico válido')
  }
  
  const sorted = [...numericValues].sort((a, b) => a - b)
  const n = numericValues.length
  
  // Básicas
  const sum = numericValues.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min
  
  // Mediana
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]
  
  // Moda
  const frequency: Record<number, number> = {}
  numericValues.forEach(v => {
    frequency[v] = (frequency[v] || 0) + 1
  })
  const maxFreq = Math.max(...Object.values(frequency))
  const modes = Object.keys(frequency)
    .filter(k => frequency[Number(k)] === maxFreq)
    .map(Number)
  const mode = modes.length === numericValues.length ? undefined : modes[0]
  
  // Variância e desvio padrão
  const variance = numericValues.reduce((acc, val) => 
    acc + Math.pow(val - mean, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  
  // Coeficiente de variação (%)
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0
  
  // Quartis
  const q1 = calculatePercentile(sorted, 25)
  const q3 = calculatePercentile(sorted, 75)
  const iqr = q3 - q1
  
  // Outliers (método IQR)
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr
  const outliers = numericValues.filter(v => v < lowerBound || v > upperBound)
  
  // Assimetria (skewness)
  const skewness = n > 2 ? calculateSkewness(numericValues, mean, stdDev) : undefined
  
  return {
    count: values.length,
    validCount: n,
    missingCount: values.length - n,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    mode,
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number(range.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4)),
    cv: Number(cv.toFixed(2)),
    skewness: skewness !== undefined ? Number(skewness.toFixed(4)) : undefined,
    outliers
  }
}

/**
 * EN: Calculate statistics for categorical variables
 * PT-BR: Calcular estatísticas para variáveis categóricas
 * 
 * EN: Computes frequency distributions, entropy, and identifies most/least common values
 * PT-BR: Calcula distribuições de frequência, entropia e identifica valores mais/menos comuns
 * 
 * @param values - EN: Array of categorical values | PT-BR: Array de valores categóricos
 * @returns EN: Categorical statistics with distributions | PT-BR: Estatísticas categóricas com distribuições
 */
export function calculateCategoricalStats(values: unknown[]): CategoricalStats {
  const cleanValues = values
    .map(v => String(v).trim())
    .filter(v => v !== '' && v !== 'null' && v !== 'undefined')
  
  const n = cleanValues.length
  
  // Contagem de frequências
  const distribution: Record<string, number> = {}
  cleanValues.forEach(v => {
    distribution[v] = (distribution[v] || 0) + 1
  })
  
  // Frequências relativas (%)
  const frequencies: Record<string, number> = {}
  Object.entries(distribution).forEach(([key, count]) => {
    frequencies[key] = Number(((count / n) * 100).toFixed(2))
  })
  
  // Mais e menos comuns
  const sortedEntries = Object.entries(distribution).sort((a, b) => b[1] - a[1])
  const mostCommon = sortedEntries[0]?.[0] || ''
  const leastCommon = sortedEntries[sortedEntries.length - 1]?.[0] || ''
  
  // Entropia (medida de diversidade)
  let entropy = 0
  Object.values(frequencies).forEach(freq => {
    const p = freq / 100
    if (p > 0) {
      entropy -= p * Math.log2(p)
    }
  })
  
  return {
    count: values.length,
    validCount: n,
    missingCount: values.length - n,
    uniqueValues: Object.keys(distribution).length,
    distribution,
    frequencies,
    mostCommon,
    leastCommon,
    entropy: Number(entropy.toFixed(4))
  }
}

/**
 * EN: Analyze complete dataset with all columns
 * PT-BR: Analisar conjunto de dados completo com todas as colunas
 * 
 * EN: Performs comprehensive analysis including variable type detection and statistics calculation for all columns
 * PT-BR: Realiza análise abrangente incluindo detecção de tipo de variável e cálculo de estatísticas para todas as colunas
 * 
 * @param data - EN: Array of data rows | PT-BR: Array de linhas de dados
 * @returns EN: Complete analysis results | PT-BR: Resultados de análise completos
 */
export function analyzeDataset(data: Record<string, unknown>[]) {
  if (data.length === 0) {
    throw new Error('Dataset vazio')
  }
  
  const headers = Object.keys(data[0])
  const variablesInfo: Record<string, VariableInfo> = {}
  const numericStats: Record<string, NumericStats> = {}
  const categoricalStats: Record<string, CategoricalStats> = {}
  
  headers.forEach(header => {
    const values = data.map(row => row[header])
    const varInfo = detectVariableType(header, values)
    variablesInfo[header] = varInfo
    
    try {
      if (varInfo.type === VariableType.QUANTITATIVE_CONTINUOUS ||
          varInfo.type === VariableType.QUANTITATIVE_DISCRETE) {
        numericStats[header] = calculateNumericStats(values)
      } else if (varInfo.type === VariableType.QUALITATIVE_NOMINAL ||
                 varInfo.type === VariableType.QUALITATIVE_ORDINAL) {
        categoricalStats[header] = calculateCategoricalStats(values)
      }
    } catch (error) {
      console.error(`Erro ao analisar coluna ${header}:`, error)
    }
  })
  
  return {
    variablesInfo,
    numericStats,
    categoricalStats,
    totalRows: data.length,
    totalColumns: headers.length
  }
}

// Funções auxiliares

function isDateString(str: string): boolean {
  // Detecta formatos comuns de data
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,         // DD/MM/YYYY
    /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
    /^\d{2}-\d{2}-\d{4}$/,           // DD-MM-YYYY
  ]
  return datePatterns.some(pattern => pattern.test(str))
}

function calculatePercentile(sortedArray: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedArray.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  
  if (lower === upper) {
    return sortedArray[lower]
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
}

function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  const n = values.length
  if (stdDev === 0) return 0
  
  const sum = values.reduce((acc, val) => 
    acc + Math.pow((val - mean) / stdDev, 3), 0)
  
  return (n / ((n - 1) * (n - 2))) * sum
}

function getVariableDescription(columnName: string): string {
  const descriptions: Record<string, string> = {
    peso: 'Peso do animal',
    weight: 'Peso do animal',
    idade: 'Idade do animal',
    age: 'Idade do animal',
    altura: 'Altura do animal',
    height: 'Altura do animal',
    rendimento: 'Rendimento de carcaça',
    yield: 'Rendimento de carcaça',
    gpd: 'Ganho de peso diário',
    gmd: 'Ganho médio diário',
    conversao: 'Conversão alimentar',
    raca: 'Raça do animal',
    breed: 'Raça do animal',
    sexo: 'Sexo do animal',
    sex: 'Sexo do animal'
  }
  
  for (const [key, desc] of Object.entries(descriptions)) {
    if (columnName.includes(key)) {
      return desc
    }
  }
  
  return ''
}

function getVariableUnit(columnName: string): string {
  const units: Record<string, string> = {
    peso: 'kg',
    weight: 'kg',
    altura: 'cm',
    height: 'cm',
    rendimento: '%',
    yield: '%',
    gpd: 'kg/dia',
    gmd: 'kg/dia',
    temperatura: '°C',
    temperature: '°C',
    valor: 'R$',
    preco: 'R$',
    price: 'R$',
    custo: 'R$',
    cost: 'R$'
  }
  
  for (const [key, unit] of Object.entries(units)) {
    if (columnName.includes(key)) {
      return unit
    }
  }
  
  if (columnName.includes('%') || columnName.includes('percent')) {
    return '%'
  }
  
  return ''
}
