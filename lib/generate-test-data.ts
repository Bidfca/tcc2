/**
 * Gerador de Dados de Teste Zootécnicos
 * Cria planilhas CSV com dados realistas para demonstração
 */

export interface TestDataConfig {
  rows: number
  includeNumeric: boolean
  includeCategorical: boolean
  includeMissing: boolean
}

const RACAS = ['Nelore', 'Angus', 'Brahman', 'Simental', 'Hereford', 'Gir', 'Guzerá', 'Caracu']
const SEXO = ['Macho', 'Fêmea']
const ESTADOS = ['MT', 'MS', 'GO', 'SP', 'MG', 'RS', 'PR', 'BA']
const CATEGORIAS = ['Bezerro', 'Recria', 'Terminação', 'Reprodução']
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
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

// Adicionar missing values de forma aleatória
function possiblyNull(value: any, probability: number = 0.05): any {
  return Math.random() < probability ? '' : value
}

/**
 * Gera dataset de teste com dados zootécnicos realistas
 */
export function generateTestData(config: TestDataConfig = {
  rows: 100,
  includeNumeric: true,
  includeCategorical: true,
  includeMissing: false
}): any[] {
  
  const data: any[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(RACAS)
    const categoria = randomChoice(CATEGORIAS)
    
    // Pesos realistas baseados na categoria
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
    } else { // Reprodução
      pesoNasc = randomBetween(30, 38, 1)
      pesoDesmame = randomBetween(180, 220, 1)
      pesoAtual = sexo === 'Macho' ? randomBetween(700, 900, 1) : randomBetween(450, 550, 1)
    }

    const idadeMeses = categoria === 'Bezerro' ? randomBetween(3, 8, 0) :
                       categoria === 'Recria' ? randomBetween(8, 18, 0) :
                       categoria === 'Terminação' ? randomBetween(18, 30, 0) :
                       randomBetween(30, 72, 0)

    const gpd = randomBetween(0.6, 1.3, 3)
    const ca = randomBetween(6, 10, 2)
    const rendimentoCarcaca = randomBetween(48, 56, 1)
    
    const row: any = {
      ID: `A${String(i).padStart(5, '0')}`,
      ANIMAL: `BOV${String(i).padStart(4, '0')}`
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
      row.TRIMESTRE = possiblyNull(`Q${Math.ceil(Math.random() * 4)}`, missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.PESO_NASCIMENTO_KG = possiblyNull(pesoNasc, missingProb)
      row.PESO_DESMAME_KG = possiblyNull(pesoDesmame, missingProb)
      row.PESO_ATUAL_KG = possiblyNull(pesoAtual, missingProb)
      row.IDADE_MESES = possiblyNull(idadeMeses, missingProb)
      row.GPD = possiblyNull(gpd, missingProb)
      row.CA = possiblyNull(ca, missingProb)
      row.RENDIMENTO_CARCACA = possiblyNull(rendimentoCarcaca, missingProb)
      row.ESCORE_CORPORAL = possiblyNull(randomBetween(2.5, 4.5, 1), missingProb)
      row.ALTURA_GARUPA_CM = possiblyNull(randomBetween(120, 150, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

/**
 * Converte array de objetos para CSV
 */
export function convertToCSV(data: any[]): string {
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
export function generateAndDownloadTestData(rows: number = 100): void {
  const data = generateTestData({
    rows,
    includeNumeric: true,
    includeCategorical: true,
    includeMissing: true
  })

  const csv = convertToCSV(data)
  const filename = `dados_teste_${rows}_registros_${new Date().toISOString().split('T')[0]}.csv`
  
  downloadCSV(filename, csv)
}
