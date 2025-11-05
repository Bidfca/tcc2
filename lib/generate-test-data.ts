/**
 * Gerador de Dados de Teste Zootécnicos
 * Cria planilhas CSV com dados realistas para demonstração
 */

export type Species = 'bovino' | 'suino' | 'avicultura' | 'ovino' | 'caprino' | 'piscicultura' | 'forragem'

export interface TestDataConfig {
  rows: number
  species: Species
  includeNumeric: boolean
  includeCategorical: boolean
  includeMissing: boolean
}

const BOVINO_RACAS = ['Nelore', 'Angus', 'Brahman', 'Simental', 'Hereford', 'Gir', 'Guzerá', 'Caracu']
const SUINO_RACAS = ['Landrace', 'Large White', 'Duroc', 'Pietrain', 'Hampshire']
const OVINO_RACAS = ['Santa Inês', 'Dorper', 'Suffolk', 'Texel', 'Ile de France']
const CAPRINO_RACAS = ['Boer', 'Saanen', 'Anglo-Nubiana', 'Parda Alpina', 'Toggenburg']
const AVE_RACAS = ['Cobb', 'Ross', 'Hubbard', 'ISA Brown', 'Lohmann']
const PEIXE_ESPECIES = ['Tilápia', 'Tambaqui', 'Pacu', 'Pintado', 'Matrinxã']
const FORRAGEM_TIPOS = ['Brachiaria brizantha', 'Brachiaria decumbens', 'Panicum maximum', 'Cynodon dactylon', 'Pennisetum purpureum']

const SEXO = ['Macho', 'Fêmea']
const ESTADOS = ['MT', 'MS', 'GO', 'SP', 'MG', 'RS', 'PR', 'BA']
const BOVINO_CATEGORIAS = ['Bezerro', 'Recria', 'Terminação', 'Reprodução']
const SUINO_CATEGORIAS = ['Leitão', 'Crescimento', 'Terminação', 'Reprodução']
const AVE_CATEGORIAS = ['Inicial', 'Crescimento', 'Terminação', 'Postura']
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Função para gerar número aleatório dentro de um range
function randomBetween(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

// Função para escolher item aleatório de array
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Função para gerar data aleatória
// function randomDate(start: Date, end: Date): string {
//   const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
//   return date.toISOString().split('T')[0]
// }

// Adicionar missing values de forma aleatória
function possiblyNull<T>(value: T, probability: number = 0.05): T | '' {
  return Math.random() < probability ? '' : value
}

/**
 * Gera dataset de teste com dados zootécnicos realistas
 */
export function generateTestData(config: TestDataConfig = {
  rows: 100,
  species: 'bovino',
  includeNumeric: true,
  includeCategorical: true,
  includeMissing: false
}): Record<string, unknown>[] {
  
  switch (config.species) {
    case 'bovino':
      return generateBovinoData(config)
    case 'suino':
      return generateSuinoData(config)
    case 'avicultura':
      return generateAviculturaData(config)
    case 'ovino':
      return generateOvinoData(config)
    case 'caprino':
      return generateCaprinoData(config)
    case 'piscicultura':
      return generatePisciculturaData(config)
    case 'forragem':
      return generateForragemData(config)
    default:
      return generateBovinoData(config)
  }
}

function generateBovinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(BOVINO_RACAS)
    const categoria = randomChoice(BOVINO_CATEGORIAS)
    
    let pesoNasc, pesoDesmame, pesoAtual
    
    if (categoria === 'Bezerro') {
      pesoNasc = randomBetween(28, 38, 1)
      pesoDesmame = randomBetween(160, 200, 1)
      pesoAtual = randomBetween(200, 280, 1)
    } else if (categoria === 'Recria') {
      pesoNasc = randomBetween(28, 38, 1)
      pesoDesmame = randomBetween(180, 220, 1)
      pesoAtual = randomBetween(280, 380, 1)
    } else if (categoria === 'Terminação') {
      pesoNasc = randomBetween(30, 40, 1)
      pesoDesmame = randomBetween(190, 230, 1)
      pesoAtual = randomBetween(450, 550, 1)
    } else {
      pesoNasc = randomBetween(30, 38, 1)
      pesoDesmame = randomBetween(180, 220, 1)
      pesoAtual = sexo === 'Macho' ? randomBetween(700, 900, 1) : randomBetween(450, 550, 1)
    }

    const idadeMeses = categoria === 'Bezerro' ? randomBetween(3, 8, 0) :
                       categoria === 'Recria' ? randomBetween(8, 18, 0) :
                       categoria === 'Terminação' ? randomBetween(18, 30, 0) :
                       randomBetween(30, 72, 0)

    const row: Record<string, unknown> = {
      ID: `BOV${String(i).padStart(5, '0')}`,
      ANIMAL: `BOV${String(i).padStart(4, '0')}`
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_NASCIMENTO_KG = possiblyNull(pesoNasc, missingProb)
      row.PESO_DESMAME_KG = possiblyNull(pesoDesmame, missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_MESES = possiblyNull(idadeMeses, missingProb)
      row.GPD = possiblyNull(randomBetween(0.6, 1.3, 3), missingProb)
      row.CA = possiblyNull(randomBetween(6, 10, 2), missingProb)
      row.RENDIMENTO_CARCACA = possiblyNull(randomBetween(48, 56, 1), missingProb)
      row.ESCORE_CORPORAL = possiblyNull(randomBetween(2.5, 4.5, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateSuinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(SUINO_RACAS)
    const categoria = randomChoice(SUINO_CATEGORIAS)
    
    let pesoAtual, idadeDias
    
    if (categoria === 'Leitão') {
      pesoAtual = randomBetween(1.2, 1.8, 2)
      idadeDias = randomBetween(1, 21, 0)
    } else if (categoria === 'Crescimento') {
      pesoAtual = randomBetween(25, 60, 1)
      idadeDias = randomBetween(60, 100, 0)
    } else if (categoria === 'Terminação') {
      pesoAtual = randomBetween(100, 130, 1)
      idadeDias = randomBetween(150, 180, 0)
    } else {
      pesoAtual = sexo === 'Macho' ? randomBetween(250, 350, 1) : randomBetween(180, 250, 1)
      idadeDias = randomBetween(200, 400, 0)
    }

    const row: Record<string, unknown> = {
      ID: `SUI${String(i).padStart(5, '0')}`,
      ANIMAL: `SUI${String(i).padStart(4, '0')}`
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_DIAS = possiblyNull(idadeDias, missingProb)
      row.GPD = possiblyNull(randomBetween(0.7, 1.1, 3), missingProb)
      row.CA = possiblyNull(randomBetween(2.2, 3.5, 2), missingProb)
      row.RENDIMENTO_CARCACA = possiblyNull(randomBetween(75, 82, 1), missingProb)
      row.ESPESSURA_TOUCINHO_MM = possiblyNull(randomBetween(10, 20, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateAviculturaData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(AVE_RACAS)
    const categoria = randomChoice(AVE_CATEGORIAS)
    
    let pesoAtual, idadeDias
    
    if (categoria === 'Inicial') {
      pesoAtual = randomBetween(0.04, 0.15, 3)
      idadeDias = randomBetween(1, 7, 0)
    } else if (categoria === 'Crescimento') {
      pesoAtual = randomBetween(0.8, 1.5, 2)
      idadeDias = randomBetween(21, 35, 0)
    } else if (categoria === 'Terminação') {
      pesoAtual = randomBetween(2.5, 3.2, 2)
      idadeDias = randomBetween(42, 49, 0)
    } else {
      pesoAtual = randomBetween(1.8, 2.2, 2)
      idadeDias = randomBetween(120, 500, 0)
    }

    const row: Record<string, unknown> = {
      ID: `AVE${String(i).padStart(5, '0')}`,
      LOTE: `L${String(Math.ceil(i / 100)).padStart(3, '0')}`
    }

    if (config.includeCategorical) {
      row.LINHAGEM = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_DIAS = possiblyNull(idadeDias, missingProb)
      row.GPD = possiblyNull(randomBetween(0.05, 0.08, 3), missingProb)
      row.CA = possiblyNull(randomBetween(1.6, 2.2, 2), missingProb)
      row.MORTALIDADE_PERCENT = possiblyNull(randomBetween(1, 5, 1), missingProb)
      if (categoria === 'Postura') {
        row.PRODUCAO_OVOS_DIA = possiblyNull(randomBetween(0.85, 0.95, 2), missingProb)
      }
    }

    data.push(row)
  }

  return data
}

function generateOvinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(OVINO_RACAS)
    
    const pesoAtual = sexo === 'Macho' ? randomBetween(60, 100, 1) : randomBetween(40, 70, 1)
    const idadeMeses = randomBetween(6, 36, 0)

    const row: Record<string, unknown> = {
      ID: `OVI${String(i).padStart(5, '0')}`,
      ANIMAL: `OVI${String(i).padStart(4, '0')}`
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_MESES = possiblyNull(idadeMeses, missingProb)
      row.GPD = possiblyNull(randomBetween(0.15, 0.35, 3), missingProb)
      row.RENDIMENTO_CARCACA = possiblyNull(randomBetween(45, 52, 1), missingProb)
      row.ESCORE_CORPORAL = possiblyNull(randomBetween(2.0, 4.0, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateCaprinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(CAPRINO_RACAS)
    
    const pesoAtual = sexo === 'Macho' ? randomBetween(50, 80, 1) : randomBetween(35, 60, 1)
    const idadeMeses = randomBetween(6, 36, 0)

    const row: Record<string, unknown> = {
      ID: `CAP${String(i).padStart(5, '0')}`,
      ANIMAL: `CAP${String(i).padStart(4, '0')}`
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_MESES = possiblyNull(idadeMeses, missingProb)
      row.GPD = possiblyNull(randomBetween(0.12, 0.30, 3), missingProb)
      row.RENDIMENTO_CARCACA = possiblyNull(randomBetween(42, 50, 1), missingProb)
      row.PRODUCAO_LEITE_DIA_L = possiblyNull(randomBetween(1.5, 4.0, 2), missingProb)
    }

    data.push(row)
  }

  return data
}

function generatePisciculturaData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const especie = randomChoice(PEIXE_ESPECIES)
    
    const pesoAtual = randomBetween(0.5, 2.5, 2)
    const idadeDias = randomBetween(90, 240, 0)

    const row: Record<string, unknown> = {
      ID: `PEI${String(i).padStart(5, '0')}`,
      TANQUE: `T${String(Math.ceil(i / 50)).padStart(3, '0')}`
    }

    if (config.includeCategorical) {
      row.ESPECIE = possiblyNull(especie, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_DIAS = possiblyNull(idadeDias, missingProb)
      row.GPD = possiblyNull(randomBetween(0.008, 0.015, 4), missingProb)
      row.CA = possiblyNull(randomBetween(1.2, 2.0, 2), missingProb)
      row.TEMPERATURA_AGUA_C = possiblyNull(randomBetween(24, 30, 1), missingProb)
      row.OXIGENIO_DISSOLVIDO_MG_L = possiblyNull(randomBetween(4.5, 7.5, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateForragemData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const tipo = randomChoice(FORRAGEM_TIPOS)
    const parcela = `P${String(i).padStart(3, '0')}`

    const row: Record<string, unknown> = {
      ID: `FOR${String(i).padStart(5, '0')}`,
      PARCELA: parcela
    }

    if (config.includeCategorical) {
      row.TIPO_FORRAGEM = possiblyNull(tipo, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
      row.ESTACAO = possiblyNull(randomChoice(['Águas', 'Seca']), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.BIOMASSA_SECA_KG_HA = possiblyNull(randomBetween(2000, 7000, 0), missingProb)
      row.ALTURA_CM = possiblyNull(randomBetween(20, 80, 1), missingProb)
      row.PROTEINA_BRUTA_PERCENT = possiblyNull(randomBetween(7, 15, 1), missingProb)
      row.FDN_PERCENT = possiblyNull(randomBetween(55, 75, 1), missingProb)
      row.DIGESTIBILIDADE_PERCENT = possiblyNull(randomBetween(50, 70, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

/**
 * Converte array de objetos para CSV
 */
export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  // Headers
  const headers = Object.keys(data[0])
  let csv = headers.join(',') + '\n'

  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Se valor tem vírgula ou aspas, envolve em aspas
      if (value === null || value === undefined || value === '') return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csv += values.join(',') + '\n'
  }

  return csv
}

/**
 * Faz download do CSV gerado
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Função principal para gerar e baixar dados de teste
 */
export function generateAndDownloadTestData(rows: number = 100, species: Species = 'bovino'): void {
  const data = generateTestData({
    rows,
    species,
    includeNumeric: true,
    includeCategorical: true,
    includeMissing: true
  })

  const csv = convertToCSV(data)
  const speciesLabel = {
    'bovino': 'bovinos',
    'suino': 'suinos',
    'avicultura': 'aves',
    'ovino': 'ovinos',
    'caprino': 'caprinos',
    'piscicultura': 'peixes',
    'forragem': 'forragem'
  }[species]
  
  const filename = `dados_teste_${speciesLabel}_${rows}_registros_${new Date().toISOString().split('T')[0]}.csv`
  
  downloadCSV(filename, csv)
}
