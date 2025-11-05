import { NRC_REFERENCES } from '../lib/references/nrc-data'
import { EMBRAPA_REFERENCES } from '../lib/references/embrapa-data'

interface CoverageReport {
  species: string
  subtype: string
  metricsCount: number
  metrics: string[]
  sources: Set<string>
  hasIdealRanges: boolean
  missingIdealRanges: string[]
}

interface SpeciesCoverage {
  totalSubtypes: number
  coveredSubtypes: number
  uncoveredSubtypes: string[]
  reports: CoverageReport[]
}

const EXPECTED_SUBTYPES: Record<string, string[]> = {
  bovine: ['dairy', 'beef', 'dual'],
  swine: ['nursery', 'growing', 'finishing', 'breeding'],
  poultry: ['broiler', 'layer', 'breeder'],
  sheep: ['meat', 'wool', 'milk'],
  goat: ['meat', 'milk', 'skin'],
  aquaculture: ['tilapia', 'tambaqui', 'pintado', 'pacu']
}

const CRITICAL_METRICS: Record<string, string[]> = {
  bovine_dairy: ['peso_nascimento', 'producao_leite', 'proteina_leite', 'gordura_leite', 'escore_corporal', 'intervalo_partos'],
  bovine_beef: ['peso_nascimento', 'peso_desmame', 'gpd', 'conversao_alimentar', 'rendimento_carcaca'],
  swine_all: ['gpd', 'conversao', 'mortalidade'],
  poultry_broiler: ['gpd_total', 'conversao_alimentar', 'mortalidade', 'iep'],
  poultry_layer: ['producao_ovos', 'peso_ovo', 'conversao_duzia', 'mortalidade'],
  sheep_meat: ['peso_nascimento', 'gpd_cria', 'peso_abate', 'rendimento_carcaca', 'mortalidade_cria'],
  sheep_wool: ['peso_nascimento', 'producao_la', 'qualidade_la', 'rendimento_la'],
  sheep_milk: ['producao_leite', 'gordura_leite', 'proteina_leite', 'celulas_somaticas'],
  goat_meat: ['peso_nascimento', 'gpd_cria', 'peso_abate', 'rendimento_carcaca'],
  goat_milk: ['producao_leite', 'gordura_leite', 'proteina_leite', 'celulas_somaticas'],
  goat_skin: ['qualidade_pele', 'area_pele', 'espessura_pele'],
  aquaculture_all: ['gpd', 'conversao_alimentar', 'sobrevivencia', 'peso_abate', 'densidade_estocagem']
}

function auditNRCReferences(): Map<string, SpeciesCoverage> {
  const coverage = new Map<string, SpeciesCoverage>()
  
  for (const [speciesCode, speciesData] of Object.entries(NRC_REFERENCES)) {
    const expectedSubtypes = EXPECTED_SUBTYPES[speciesCode] || []
    const reports: CoverageReport[] = []
    const coveredSubtypes = new Set<string>()
    
    for (const [subtypeCode, metrics] of Object.entries(speciesData as any)) {
      coveredSubtypes.add(subtypeCode)
      const metricKeys = Object.keys(metrics)
      const sources = new Set<string>()
      const missingIdealRanges: string[] = []
      
      for (const [metricKey, values] of Object.entries(metrics as any)) {
        sources.add(values.source)
        if (!values.ideal_min || !values.ideal_max) {
          missingIdealRanges.push(metricKey)
        }
      }
      
      reports.push({
        species: speciesCode,
        subtype: subtypeCode,
        metricsCount: metricKeys.length,
        metrics: metricKeys,
        sources,
        hasIdealRanges: missingIdealRanges.length === 0,
        missingIdealRanges
      })
    }
    
    const uncoveredSubtypes = expectedSubtypes.filter(st => !coveredSubtypes.has(st))
    
    coverage.set(speciesCode, {
      totalSubtypes: expectedSubtypes.length,
      coveredSubtypes: coveredSubtypes.size,
      uncoveredSubtypes,
      reports
    })
  }
  
  return coverage
}

function auditEMBRAPAReferences(): Map<string, SpeciesCoverage> {
  const coverage = new Map<string, SpeciesCoverage>()
  
  const sgData = EMBRAPA_REFERENCES.sheep_goat
  if (sgData) {
    if (sgData.ovinos) {
      const metricKeys = Object.keys(sgData.ovinos)
      const sources = new Set<string>()
      for (const values of Object.values(sgData.ovinos as any)) {
        sources.add(values.source)
      }
      
      coverage.set('sheep', {
        totalSubtypes: 3,
        coveredSubtypes: 1,
        uncoveredSubtypes: ['wool', 'milk'],
        reports: [{
          species: 'sheep',
          subtype: 'meat',
          metricsCount: metricKeys.length,
          metrics: metricKeys,
          sources,
          hasIdealRanges: true,
          missingIdealRanges: []
        }]
      })
    }
    
    if (sgData.caprinos) {
      const metricKeys = Object.keys(sgData.caprinos)
      const sources = new Set<string>()
      for (const values of Object.values(sgData.caprinos as any)) {
        sources.add(values.source)
      }
      
      coverage.set('goat', {
        totalSubtypes: 3,
        coveredSubtypes: 1,
        uncoveredSubtypes: ['milk', 'skin'],
        reports: [{
          species: 'goat',
          subtype: 'meat',
          metricsCount: metricKeys.length,
          metrics: metricKeys,
          sources,
          hasIdealRanges: true,
          missingIdealRanges: []
        }]
      })
    }
  }
  
  const aquaData = EMBRAPA_REFERENCES.aquaculture
  if (aquaData) {
    const reports: CoverageReport[] = []
    for (const [fishType, metrics] of Object.entries(aquaData)) {
      const metricKeys = Object.keys(metrics)
      const sources = new Set<string>()
      for (const values of Object.values(metrics as any)) {
        sources.add(values.source)
      }
      
      reports.push({
        species: 'aquaculture',
        subtype: fishType,
        metricsCount: metricKeys.length,
        metrics: metricKeys,
        sources,
        hasIdealRanges: true,
        missingIdealRanges: []
      })
    }
    
    coverage.set('aquaculture', {
      totalSubtypes: 4,
      coveredSubtypes: 4,
      uncoveredSubtypes: [],
      reports
    })
  }
  
  return coverage
}

function generateMarkdownReport(): string {
  const nrcCoverage = auditNRCReferences()
  const embrapaCoverage = auditEMBRAPAReferences()
  
  let report = '# Reference Data Coverage Report\n\n'
  report += `Generated: ${new Date().toISOString()}\n\n`
  report += '## Summary\n\n'
  
  let totalSubtypes = 0
  let coveredSubtypes = 0
  let totalMetrics = 0
  
  const allCoverage = new Map([...nrcCoverage, ...embrapaCoverage])
  
  for (const [species, coverage] of allCoverage) {
    totalSubtypes += coverage.totalSubtypes
    coveredSubtypes += coverage.coveredSubtypes
    totalMetrics += coverage.reports.reduce((sum, r) => sum + r.metricsCount, 0)
  }
  
  report += `- **Total Species**: ${allCoverage.size}\n`
  report += `- **Total Subtypes Expected**: ${totalSubtypes}\n`
  report += `- **Subtypes with Data**: ${coveredSubtypes}\n`
  report += `- **Coverage**: ${((coveredSubtypes / totalSubtypes) * 100).toFixed(1)}%\n`
  report += `- **Total Metrics**: ${totalMetrics}\n\n`
  
  report += '## Detailed Coverage by Species\n\n'
  
  for (const [species, coverage] of allCoverage) {
    const speciesName = species.charAt(0).toUpperCase() + species.slice(1)
    report += `### ${speciesName}\n\n`
    report += `- **Coverage**: ${coverage.coveredSubtypes}/${coverage.totalSubtypes} subtypes\n`
    
    if (coverage.uncoveredSubtypes.length > 0) {
      report += `- **⚠️ Missing Subtypes**: ${coverage.uncoveredSubtypes.join(', ')}\n`
    }
    
    report += '\n'
    
    for (const subReport of coverage.reports) {
      report += `#### ${subReport.subtype}\n\n`
      report += `- **Metrics Count**: ${subReport.metricsCount}\n`
      report += `- **Sources**: ${Array.from(subReport.sources).join(', ')}\n`
      
      if (!subReport.hasIdealRanges) {
        report += `- **⚠️ Missing Ideal Ranges**: ${subReport.missingIdealRanges.join(', ')}\n`
      }
      
      const criticalKey = `${species}_${subReport.subtype}`
      const criticalMetrics = CRITICAL_METRICS[criticalKey] || CRITICAL_METRICS[`${species}_all`] || []
      const missingCritical = criticalMetrics.filter(m => !subReport.metrics.includes(m))
      
      if (missingCritical.length > 0) {
        report += `- **❌ Missing Critical Metrics**: ${missingCritical.join(', ')}\n`
      }
      
      report += `- **Metrics**: ${subReport.metrics.join(', ')}\n\n`
    }
  }
  
  report += '## Gaps and Recommendations\n\n'
  report += '### High Priority\n\n'
  
  const highPriorityGaps: string[] = []
  
  for (const [species, coverage] of allCoverage) {
    if (coverage.uncoveredSubtypes.length > 0) {
      highPriorityGaps.push(`**${species}**: Add data for ${coverage.uncoveredSubtypes.join(', ')} subtypes`)
    }
    
    for (const subReport of coverage.reports) {
      const criticalKey = `${species}_${subReport.subtype}`
      const criticalMetrics = CRITICAL_METRICS[criticalKey] || CRITICAL_METRICS[`${species}_all`] || []
      const missingCritical = criticalMetrics.filter(m => !subReport.metrics.includes(m))
      
      if (missingCritical.length > 0) {
        highPriorityGaps.push(`**${species}/${subReport.subtype}**: Add critical metrics: ${missingCritical.join(', ')}`)
      }
      
      if (subReport.metricsCount < 5) {
        highPriorityGaps.push(`**${species}/${subReport.subtype}**: Only ${subReport.metricsCount} metrics (expand to at least 7-10)`)
      }
    }
  }
  
  if (highPriorityGaps.length > 0) {
    highPriorityGaps.forEach(gap => report += `- ${gap}\n`)
  } else {
    report += '- No high priority gaps identified\n'
  }
  
  report += '\n### Medium Priority\n\n'
  report += '- Add phase-specific metrics (cria, recria, terminação) for sheep and goat\n'
  report += '- Expand water quality metrics for aquaculture\n'
  report += '- Add seasonal variations for forage data\n'
  
  report += '\n### Low Priority\n\n'
  report += '- Add secondary quality metrics (marbling, tenderness, etc.)\n'
  report += '- Expand reproductive metrics for all species\n'
  report += '- Add economic indicators (feed cost, market price ranges)\n'
  
  return report
}

const report = generateMarkdownReport()
console.log(report)
