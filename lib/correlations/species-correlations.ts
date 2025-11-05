/**
 * Species-Specific Correlation Configurations
 * 
 * Defines biologically relevant correlations for each animal species
 * with prioritization scores and interpretation guidelines
 */

export interface CorrelationPair {
  var1Keywords: string[]
  var2Keywords: string[]
  category: string
  relevanceScore: number
  expectedDirection: 'positive' | 'negative' | 'either'
  interpretation: string
  idealRange?: { min: number; max: number }
}

export interface SpeciesCorrelationConfig {
  species: string
  expectedFields: string[]
  correlationPairs: CorrelationPair[]
  additionalMetrics?: string[]
}

/**
 * Bovine (Cattle) Correlation Configuration
 */
export const BOVINE_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'bovine',
  expectedFields: [
    'peso_nascimento', 'peso_desmame', 'peso_atual', 'peso_final',
    'idade', 'idade_meses', 'idade_dias',
    'gpd', 'gmd', 'ganho_peso_diario',
    'altura_cernelha', 'perimetro_toracico', 'comprimento_corporal',
    'consumo_ms', 'consumo_diario', 'conversao_alimentar',
    'producao_leite', 'gordura_leite', 'proteina_leite',
    'ecc', 'escore_corporal', 'bcs'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_nascimento', 'birth_weight', 'peso_nasc'],
      var2Keywords: ['peso_desmame', 'weaning_weight', 'peso_desm'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Animais mais pesados ao nascer tendem a ter maior peso ao desmame, indicando vigor e viabilidade',
      idealRange: { min: 0.4, max: 0.8 }
    },
    {
      var1Keywords: ['peso_desmame', 'weaning_weight', 'peso_desm'],
      var2Keywords: ['peso_atual', 'current_weight', 'peso_final'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Continuidade do crescimento - animais com melhor desempenho ao desmame mantêm vantagem',
      idealRange: { min: 0.5, max: 0.85 }
    },
    {
      var1Keywords: ['peso_nascimento', 'birth_weight'],
      var2Keywords: ['peso_atual', 'current_weight', 'peso_final'],
      category: 'Crescimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Persistência do peso inicial ao longo do crescimento',
      idealRange: { min: 0.3, max: 0.7 }
    },
    
    {
      var1Keywords: ['peso', 'weight', 'peso_atual'],
      var2Keywords: ['altura_cernelha', 'height', 'cernelha'],
      category: 'Morfometria',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Proporcionalidade corporal - indica conformação adequada e desenvolvimento harmônico',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['peso', 'weight', 'peso_atual'],
      var2Keywords: ['perimetro_toracico', 'perimeter', 'toracico', 'chest'],
      category: 'Morfometria',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Capacidade cardiorrespiratória e desenvolvimento muscular',
      idealRange: { min: 0.7, max: 0.9 }
    },
    {
      var1Keywords: ['altura_cernelha', 'height'],
      var2Keywords: ['perimetro_toracico', 'perimeter'],
      category: 'Morfometria',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Harmonia corporal e tipo racial',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['peso', 'weight'],
      var2Keywords: ['comprimento_corporal', 'body_length', 'comprimento'],
      category: 'Morfometria',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Desenvolvimento longitudinal proporcional ao peso',
      idealRange: { min: 0.6, max: 0.85 }
    },
    
    {
      var1Keywords: ['gpd', 'gmd', 'ganho', 'gain', 'ganho_peso'],
      var2Keywords: ['peso', 'weight', 'peso_atual'],
      category: 'Performance',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Eficiência de crescimento - animais mais pesados tendem a ganhar mais peso',
      idealRange: { min: 0.4, max: 0.75 }
    },
    {
      var1Keywords: ['consumo', 'intake', 'feed', 'consumo_ms'],
      var2Keywords: ['ganho', 'gain', 'gpd', 'gmd'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Relação fundamental para conversão alimentar - maior consumo deve resultar em maior ganho',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['conversao_alimentar', 'conversion', 'ca', 'feed_conversion'],
      var2Keywords: ['ganho', 'gain', 'gpd'],
      category: 'Eficiência',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Menor conversão alimentar (melhor eficiência) com maior ganho de peso',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['consumo', 'intake', 'consumo_ms'],
      var2Keywords: ['peso', 'weight', 'peso_atual'],
      category: 'Eficiência',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Animais mais pesados consomem mais matéria seca',
      idealRange: { min: 0.6, max: 0.9 }
    },
    
    {
      var1Keywords: ['producao_leite', 'milk_production', 'leite'],
      var2Keywords: ['peso', 'weight', 'peso_atual'],
      category: 'Produção',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Vacas mais pesadas tendem a produzir mais leite (maior capacidade corporal)',
      idealRange: { min: 0.3, max: 0.7 }
    },
    {
      var1Keywords: ['gordura', 'fat', 'gordura_leite'],
      var2Keywords: ['proteina', 'protein', 'proteina_leite'],
      category: 'Qualidade',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Componentes do leite geralmente variam juntos, indicando qualidade nutricional',
      idealRange: { min: 0.4, max: 0.75 }
    },
    {
      var1Keywords: ['producao_leite', 'milk_production'],
      var2Keywords: ['consumo', 'intake', 'consumo_ms'],
      category: 'Produção',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Maior produção requer maior consumo para atender demandas energéticas',
      idealRange: { min: 0.6, max: 0.85 }
    },
    
    {
      var1Keywords: ['idade', 'age', 'meses', 'months', 'idade_meses'],
      var2Keywords: ['peso', 'weight', 'peso_atual'],
      category: 'Desenvolvimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento - peso aumenta com a idade',
      idealRange: { min: 0.7, max: 0.95 }
    },
    {
      var1Keywords: ['idade', 'age', 'meses'],
      var2Keywords: ['altura', 'height', 'altura_cernelha'],
      category: 'Desenvolvimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Desenvolvimento esquelético ao longo do tempo',
      idealRange: { min: 0.6, max: 0.9 }
    },
    
    {
      var1Keywords: ['ecc', 'escore_corporal', 'bcs', 'body_condition'],
      var2Keywords: ['peso', 'weight'],
      category: 'Condição',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Escore corporal reflete reservas energéticas e peso',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['ecc', 'escore_corporal', 'bcs'],
      var2Keywords: ['producao_leite', 'milk_production'],
      category: 'Produção',
      relevanceScore: 7,
      expectedDirection: 'negative',
      interpretation: 'Vacas em alta produção podem ter menor ECC devido à mobilização de reservas',
      idealRange: { min: -0.5, max: -0.2 }
    }
  ],
  additionalMetrics: [
    'taxa_prenhez', 'intervalo_partos', 'numero_partos',
    'idade_primeiro_parto', 'dias_lactacao'
  ]
}

/**
 * Swine (Suínos) Correlation Configuration
 */
export const SWINE_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'swine',
  expectedFields: [
    'peso_nascimento', 'peso_desmame', 'peso_final',
    'idade_dias', 'idade_abate',
    'gpd', 'ganho_peso_diario',
    'consumo_racao', 'conversao_alimentar',
    'espessura_toucinho', 'profundidade_lombo',
    'rendimento_carcaca', 'percentual_carne_magra',
    'mortalidade', 'numero_leitoes'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_nascimento', 'birth_weight'],
      var2Keywords: ['peso_desmame', 'weaning_weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Leitões mais pesados ao nascer têm melhor desempenho ao desmame',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['peso_desmame', 'weaning_weight'],
      var2Keywords: ['peso_final', 'final_weight', 'peso_abate'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Peso ao desmame prediz desempenho na fase de terminação',
      idealRange: { min: 0.4, max: 0.75 }
    },
    {
      var1Keywords: ['idade', 'age', 'dias', 'idade_dias'],
      var2Keywords: ['peso', 'weight', 'peso_final'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento suína - peso aumenta linearmente com idade',
      idealRange: { min: 0.8, max: 0.95 }
    },
    
    {
      var1Keywords: ['consumo', 'feed', 'consumo_racao'],
      var2Keywords: ['ganho', 'gain', 'gpd'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Base da conversão alimentar - consumo deve resultar em ganho',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['conversao_alimentar', 'ca', 'feed_conversion'],
      var2Keywords: ['gpd', 'ganho', 'gain'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'negative',
      interpretation: 'Melhor conversão (menor CA) com maior ganho de peso',
      idealRange: { min: -0.7, max: -0.4 }
    },
    {
      var1Keywords: ['consumo', 'feed', 'consumo_racao'],
      var2Keywords: ['peso', 'weight'],
      category: 'Eficiência',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Animais mais pesados consomem mais ração',
      idealRange: { min: 0.7, max: 0.9 }
    },
    
    {
      var1Keywords: ['espessura_toucinho', 'backfat', 'toucinho'],
      var2Keywords: ['peso', 'weight', 'peso_final'],
      category: 'Carcaça',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Animais mais pesados tendem a ter maior deposição de gordura',
      idealRange: { min: 0.4, max: 0.7 }
    },
    {
      var1Keywords: ['profundidade_lombo', 'loin_depth', 'lombo'],
      var2Keywords: ['peso', 'weight'],
      category: 'Carcaça',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Desenvolvimento muscular proporcional ao peso',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['espessura_toucinho', 'backfat'],
      var2Keywords: ['percentual_carne_magra', 'lean_meat', 'carne_magra'],
      category: 'Carcaça',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Maior toucinho resulta em menor percentual de carne magra',
      idealRange: { min: -0.8, max: -0.5 }
    },
    {
      var1Keywords: ['rendimento_carcaca', 'carcass_yield', 'rendimento'],
      var2Keywords: ['peso', 'weight', 'peso_final'],
      category: 'Carcaça',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Animais mais pesados tendem a ter melhor rendimento de carcaça',
      idealRange: { min: 0.3, max: 0.6 }
    },
    
    {
      var1Keywords: ['gpd', 'ganho', 'gain'],
      var2Keywords: ['idade_abate', 'days_to_market', 'dias_abate'],
      category: 'Performance',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Maior ganho diário reduz idade ao abate (precocidade)',
      idealRange: { min: -0.7, max: -0.4 }
    },
    
    {
      var1Keywords: ['numero_leitoes', 'litter_size', 'tamanho_leitegada'],
      var2Keywords: ['peso_nascimento', 'birth_weight'],
      category: 'Reprodução',
      relevanceScore: 7,
      expectedDirection: 'negative',
      interpretation: 'Leitegadas maiores tendem a ter leitões mais leves ao nascer',
      idealRange: { min: -0.6, max: -0.3 }
    }
  ],
  additionalMetrics: [
    'taxa_sobrevivencia', 'uniformidade_lote', 'idade_primeiro_cio'
  ]
}

/**
 * Poultry (Aves) Correlation Configuration
 */
export const POULTRY_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'poultry',
  expectedFields: [
    'peso_inicial', 'peso_7d', 'peso_14d', 'peso_21d', 'peso_final',
    'idade_dias', 'idade_abate',
    'gpd', 'ganho_peso',
    'consumo_racao', 'conversao_alimentar',
    'mortalidade', 'viabilidade',
    'iep', 'eficiencia_produtiva',
    'producao_ovos', 'peso_ovos', 'massa_ovos'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_7d', 'peso_7', 'weight_7d'],
      var2Keywords: ['peso_14d', 'peso_14', 'weight_14d'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Continuidade do crescimento - desempenho na primeira semana prediz segunda semana',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['peso_14d', 'peso_14', 'weight_14d'],
      var2Keywords: ['peso_21d', 'peso_21', 'weight_21d'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Persistência do crescimento nas primeiras três semanas',
      idealRange: { min: 0.7, max: 0.9 }
    },
    {
      var1Keywords: ['peso_inicial', 'initial_weight', 'peso_1d'],
      var2Keywords: ['peso_final', 'final_weight', 'peso_abate'],
      category: 'Crescimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Peso inicial influencia peso final em frangos de corte',
      idealRange: { min: 0.4, max: 0.7 }
    },
    {
      var1Keywords: ['idade', 'age', 'dias', 'idade_dias'],
      var2Keywords: ['peso', 'weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento aviária - crescimento rápido e linear',
      idealRange: { min: 0.85, max: 0.98 }
    },
    
    {
      var1Keywords: ['consumo', 'feed', 'consumo_racao'],
      var2Keywords: ['ganho', 'gain', 'gpd', 'peso_ganho'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Relação consumo-ganho fundamental para CA',
      idealRange: { min: 0.7, max: 0.9 }
    },
    {
      var1Keywords: ['conversao_alimentar', 'ca', 'feed_conversion'],
      var2Keywords: ['gpd', 'ganho', 'gain'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'negative',
      interpretation: 'Melhor conversão com maior ganho de peso',
      idealRange: { min: -0.8, max: -0.5 }
    },
    {
      var1Keywords: ['consumo', 'feed'],
      var2Keywords: ['peso', 'weight'],
      category: 'Eficiência',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Aves mais pesadas consomem mais ração',
      idealRange: { min: 0.8, max: 0.95 }
    },
    
    {
      var1Keywords: ['iep', 'eficiencia_produtiva', 'production_efficiency'],
      var2Keywords: ['conversao_alimentar', 'ca'],
      category: 'Performance',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Melhor IEP com menor conversão alimentar',
      idealRange: { min: -0.7, max: -0.4 }
    },
    {
      var1Keywords: ['iep', 'eficiencia_produtiva'],
      var2Keywords: ['viabilidade', 'viability', 'sobrevivencia'],
      category: 'Performance',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'IEP aumenta com maior viabilidade do lote',
      idealRange: { min: 0.6, max: 0.9 }
    },
    {
      var1Keywords: ['iep', 'eficiencia_produtiva'],
      var2Keywords: ['peso', 'weight', 'peso_final'],
      category: 'Performance',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Maior peso final contribui para melhor IEP',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['mortalidade', 'mortality'],
      var2Keywords: ['iep', 'eficiencia_produtiva'],
      category: 'Performance',
      relevanceScore: 10,
      expectedDirection: 'negative',
      interpretation: 'Maior mortalidade reduz drasticamente o IEP',
      idealRange: { min: -0.8, max: -0.5 }
    },
    
    {
      var1Keywords: ['producao_ovos', 'egg_production', 'ovos'],
      var2Keywords: ['peso_ovos', 'egg_weight'],
      category: 'Produção',
      relevanceScore: 7,
      expectedDirection: 'either',
      interpretation: 'Relação entre quantidade e peso dos ovos (pode ser inversa)',
      idealRange: { min: -0.4, max: 0.4 }
    },
    {
      var1Keywords: ['peso_ovos', 'egg_weight'],
      var2Keywords: ['peso', 'weight', 'peso_corporal'],
      category: 'Produção',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Aves mais pesadas tendem a produzir ovos maiores',
      idealRange: { min: 0.4, max: 0.7 }
    },
    {
      var1Keywords: ['massa_ovos', 'egg_mass'],
      var2Keywords: ['consumo', 'feed', 'consumo_racao'],
      category: 'Produção',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Maior produção de massa de ovos requer maior consumo',
      idealRange: { min: 0.6, max: 0.85 }
    }
  ],
  additionalMetrics: [
    'uniformidade_lote', 'taxa_eclosao', 'fertilidade',
    'conversao_alimentar_residual', 'ganho_compensatorio'
  ]
}

/**
 * Sheep (Ovinos) Correlation Configuration
 */
export const SHEEP_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'sheep',
  expectedFields: [
    'peso_nascimento', 'peso_desmame', 'peso_atual',
    'idade_meses', 'idade_dias',
    'gpd', 'ganho_peso',
    'altura_cernelha', 'perimetro_toracico',
    'ecc', 'escore_corporal',
    'producao_la', 'diametro_fibra',
    'numero_cordeiros', 'tipo_parto'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_nascimento', 'birth_weight'],
      var2Keywords: ['peso_desmame', 'weaning_weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Cordeiros mais pesados ao nascer têm melhor desempenho ao desmame',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['peso_desmame', 'weaning_weight'],
      var2Keywords: ['peso_atual', 'current_weight'],
      category: 'Crescimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Continuidade do crescimento pós-desmame',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['idade', 'age', 'meses', 'idade_meses'],
      var2Keywords: ['peso', 'weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento ovina',
      idealRange: { min: 0.7, max: 0.9 }
    },
    
    {
      var1Keywords: ['peso', 'weight'],
      var2Keywords: ['altura_cernelha', 'height'],
      category: 'Morfometria',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Proporcionalidade corporal em ovinos',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['peso', 'weight'],
      var2Keywords: ['perimetro_toracico', 'chest_girth'],
      category: 'Morfometria',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Perímetro torácico é excelente preditor de peso em ovinos',
      idealRange: { min: 0.75, max: 0.95 }
    },
    
    {
      var1Keywords: ['ecc', 'escore_corporal', 'bcs'],
      var2Keywords: ['peso', 'weight'],
      category: 'Condição',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'ECC reflete reservas corporais e peso',
      idealRange: { min: 0.6, max: 0.85 }
    },
    
    {
      var1Keywords: ['producao_la', 'wool_production', 'la'],
      var2Keywords: ['peso', 'weight'],
      category: 'Produção',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Animais maiores tendem a produzir mais lã',
      idealRange: { min: 0.4, max: 0.7 }
    },
    {
      var1Keywords: ['diametro_fibra', 'fiber_diameter', 'finura'],
      var2Keywords: ['producao_la', 'wool_production'],
      category: 'Qualidade',
      relevanceScore: 6,
      expectedDirection: 'negative',
      interpretation: 'Fibras mais finas (menor diâmetro) podem ter menor produção total',
      idealRange: { min: -0.5, max: -0.2 }
    },
    
    {
      var1Keywords: ['numero_cordeiros', 'litter_size', 'prolificidade'],
      var2Keywords: ['peso_nascimento', 'birth_weight'],
      category: 'Reprodução',
      relevanceScore: 7,
      expectedDirection: 'negative',
      interpretation: 'Partos múltiplos resultam em cordeiros mais leves',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['ecc', 'escore_corporal'],
      var2Keywords: ['numero_cordeiros', 'prolificidade'],
      category: 'Reprodução',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Melhor condição corporal favorece prolificidade',
      idealRange: { min: 0.3, max: 0.6 }
    }
  ],
  additionalMetrics: [
    'taxa_desmame', 'intervalo_partos', 'peso_velo'
  ]
}

/**
 * Goat (Caprinos) Correlation Configuration
 */
export const GOAT_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'goat',
  expectedFields: [
    'peso_nascimento', 'peso_desmame', 'peso_atual',
    'idade_meses', 'idade_dias',
    'gpd', 'ganho_peso',
    'altura_cernelha', 'perimetro_toracico',
    'producao_leite', 'gordura_leite', 'proteina_leite',
    'ecc', 'escore_corporal',
    'numero_cabritos'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_nascimento', 'birth_weight'],
      var2Keywords: ['peso_desmame', 'weaning_weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Cabritos mais pesados ao nascer têm melhor desempenho',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['peso_desmame', 'weaning_weight'],
      var2Keywords: ['peso_atual', 'current_weight'],
      category: 'Crescimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Continuidade do crescimento em caprinos',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['idade', 'age', 'meses'],
      var2Keywords: ['peso', 'weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento caprina',
      idealRange: { min: 0.7, max: 0.9 }
    },
    
    {
      var1Keywords: ['peso', 'weight'],
      var2Keywords: ['altura_cernelha', 'height'],
      category: 'Morfometria',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Proporcionalidade corporal em caprinos',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['peso', 'weight'],
      var2Keywords: ['perimetro_toracico', 'chest_girth'],
      category: 'Morfometria',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Perímetro torácico prediz peso em caprinos',
      idealRange: { min: 0.75, max: 0.95 }
    },
    
    {
      var1Keywords: ['producao_leite', 'milk_production'],
      var2Keywords: ['peso', 'weight'],
      category: 'Produção',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Cabras maiores tendem a produzir mais leite',
      idealRange: { min: 0.4, max: 0.7 }
    },
    {
      var1Keywords: ['gordura_leite', 'milk_fat'],
      var2Keywords: ['proteina_leite', 'milk_protein'],
      category: 'Qualidade',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Componentes do leite variam juntos',
      idealRange: { min: 0.4, max: 0.75 }
    },
    {
      var1Keywords: ['producao_leite', 'milk_production'],
      var2Keywords: ['ecc', 'escore_corporal'],
      category: 'Produção',
      relevanceScore: 8,
      expectedDirection: 'negative',
      interpretation: 'Alta produção pode reduzir ECC por mobilização de reservas',
      idealRange: { min: -0.5, max: -0.2 }
    },
    
    {
      var1Keywords: ['ecc', 'escore_corporal', 'bcs'],
      var2Keywords: ['peso', 'weight'],
      category: 'Condição',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'ECC reflete condição nutricional e peso',
      idealRange: { min: 0.6, max: 0.85 }
    },
    
    {
      var1Keywords: ['numero_cabritos', 'litter_size', 'prolificidade'],
      var2Keywords: ['peso_nascimento', 'birth_weight'],
      category: 'Reprodução',
      relevanceScore: 7,
      expectedDirection: 'negative',
      interpretation: 'Partos múltiplos resultam em cabritos mais leves',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['ecc', 'escore_corporal'],
      var2Keywords: ['numero_cabritos', 'prolificidade'],
      category: 'Reprodução',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Melhor condição corporal favorece prolificidade',
      idealRange: { min: 0.3, max: 0.6 }
    }
  ],
  additionalMetrics: [
    'taxa_desmame', 'intervalo_partos', 'dias_lactacao'
  ]
}

/**
 * Forage (Forragem) Correlation Configuration
 */
export const FORAGE_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'forage',
  expectedFields: [
    'altura_planta', 'massa_verde', 'massa_seca',
    'proteina_bruta', 'fdn', 'fda',
    'digestibilidade', 'energia_metabolizavel',
    'densidade_forragem', 'taxa_acumulo',
    'cobertura_solo', 'numero_perfilhos'
  ],
  correlationPairs: [
    {
      var1Keywords: ['altura', 'height', 'altura_planta'],
      var2Keywords: ['massa_verde', 'green_mass', 'producao'],
      category: 'Produção',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Maior altura geralmente indica maior produção de massa',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['massa_verde', 'green_mass'],
      var2Keywords: ['massa_seca', 'dry_matter', 'ms'],
      category: 'Produção',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Massa verde e seca são altamente correlacionadas',
      idealRange: { min: 0.8, max: 0.95 }
    },
    {
      var1Keywords: ['densidade', 'density', 'densidade_forragem'],
      var2Keywords: ['massa', 'mass', 'producao'],
      category: 'Produção',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Maior densidade resulta em maior produção por área',
      idealRange: { min: 0.7, max: 0.9 }
    },
    
    {
      var1Keywords: ['proteina', 'protein', 'proteina_bruta', 'pb'],
      var2Keywords: ['digestibilidade', 'digestibility', 'divms'],
      category: 'Qualidade',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Maior teor proteico geralmente associado a melhor digestibilidade',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['fdn', 'ndf', 'fibra_detergente_neutro'],
      var2Keywords: ['digestibilidade', 'digestibility'],
      category: 'Qualidade',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Maior FDN reduz digestibilidade da forragem',
      idealRange: { min: -0.8, max: -0.5 }
    },
    {
      var1Keywords: ['fda', 'adf', 'fibra_detergente_acido'],
      var2Keywords: ['digestibilidade', 'digestibility'],
      category: 'Qualidade',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'FDA é inversamente relacionada à digestibilidade',
      idealRange: { min: -0.85, max: -0.6 }
    },
    {
      var1Keywords: ['fdn', 'ndf'],
      var2Keywords: ['fda', 'adf'],
      category: 'Qualidade',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Frações fibrosas são correlacionadas',
      idealRange: { min: 0.7, max: 0.9 }
    },
    {
      var1Keywords: ['proteina', 'protein', 'pb'],
      var2Keywords: ['energia', 'energy', 'energia_metabolizavel'],
      category: 'Qualidade',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Forragens com mais proteína tendem a ter mais energia',
      idealRange: { min: 0.5, max: 0.8 }
    },
    
    {
      var1Keywords: ['altura', 'height'],
      var2Keywords: ['cobertura', 'coverage', 'cobertura_solo'],
      category: 'Estrutura',
      relevanceScore: 7,
      expectedDirection: 'positive',
      interpretation: 'Maior altura associada a melhor cobertura do solo',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['numero_perfilhos', 'tiller_number', 'perfilhos'],
      var2Keywords: ['massa', 'mass', 'producao'],
      category: 'Estrutura',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Maior perfilhamento resulta em maior produção',
      idealRange: { min: 0.6, max: 0.85 }
    },
    {
      var1Keywords: ['taxa_acumulo', 'accumulation_rate', 'acumulo'],
      var2Keywords: ['massa', 'mass', 'producao'],
      category: 'Produção',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Taxa de acúmulo determina produção de forragem',
      idealRange: { min: 0.7, max: 0.9 }
    },
    
    {
      var1Keywords: ['altura', 'height', 'idade'],
      var2Keywords: ['proteina', 'protein', 'pb'],
      category: 'Maturidade',
      relevanceScore: 7,
      expectedDirection: 'negative',
      interpretation: 'Forragens mais maduras (altas) têm menor teor proteico',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['altura', 'height', 'idade'],
      var2Keywords: ['fdn', 'ndf', 'fibra'],
      category: 'Maturidade',
      relevanceScore: 8,
      expectedDirection: 'positive',
      interpretation: 'Maturidade aumenta teor de fibra',
      idealRange: { min: 0.5, max: 0.8 }
    }
  ],
  additionalMetrics: [
    'relacao_folha_colmo', 'material_morto', 'taxa_crescimento',
    'capacidade_suporte', 'lotacao_animal'
  ]
}

/**
 * Aquaculture (Aquicultura) Correlation Configuration
 */
export const AQUACULTURE_CORRELATIONS: SpeciesCorrelationConfig = {
  species: 'aquaculture',
  expectedFields: [
    'peso_inicial', 'peso_final',
    'comprimento_total', 'comprimento_padrao',
    'idade_dias', 'tempo_cultivo',
    'gpd', 'ganho_peso',
    'consumo_racao', 'conversao_alimentar',
    'densidade_estocagem', 'biomassa',
    'temperatura_agua', 'oxigenio_dissolvido', 'ph',
    'sobrevivencia', 'mortalidade'
  ],
  correlationPairs: [
    {
      var1Keywords: ['peso_inicial', 'initial_weight'],
      var2Keywords: ['peso_final', 'final_weight'],
      category: 'Crescimento',
      relevanceScore: 9,
      expectedDirection: 'positive',
      interpretation: 'Peixes maiores no início tendem a manter vantagem',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['idade', 'age', 'dias', 'tempo_cultivo'],
      var2Keywords: ['peso', 'weight'],
      category: 'Crescimento',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Curva de crescimento em aquicultura',
      idealRange: { min: 0.8, max: 0.95 }
    },
    {
      var1Keywords: ['comprimento', 'length', 'comprimento_total'],
      var2Keywords: ['peso', 'weight'],
      category: 'Morfometria',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Relação peso-comprimento fundamental em peixes',
      idealRange: { min: 0.85, max: 0.98 }
    },
    
    {
      var1Keywords: ['consumo', 'feed', 'consumo_racao'],
      var2Keywords: ['ganho', 'gain', 'gpd'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Base da conversão alimentar em aquicultura',
      idealRange: { min: 0.7, max: 0.9 }
    },
    {
      var1Keywords: ['conversao_alimentar', 'ca', 'fcr'],
      var2Keywords: ['gpd', 'ganho', 'gain'],
      category: 'Eficiência',
      relevanceScore: 10,
      expectedDirection: 'negative',
      interpretation: 'Melhor conversão com maior ganho de peso',
      idealRange: { min: -0.7, max: -0.4 }
    },
    
    {
      var1Keywords: ['densidade', 'density', 'densidade_estocagem'],
      var2Keywords: ['peso', 'weight', 'peso_final'],
      category: 'Manejo',
      relevanceScore: 8,
      expectedDirection: 'negative',
      interpretation: 'Maior densidade pode reduzir crescimento individual',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['densidade', 'density'],
      var2Keywords: ['sobrevivencia', 'survival', 'viabilidade'],
      category: 'Manejo',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Alta densidade pode aumentar mortalidade',
      idealRange: { min: -0.7, max: -0.4 }
    },
    {
      var1Keywords: ['biomassa', 'biomass'],
      var2Keywords: ['oxigenio', 'oxygen', 'oxigenio_dissolvido'],
      category: 'Qualidade Água',
      relevanceScore: 9,
      expectedDirection: 'negative',
      interpretation: 'Maior biomassa consome mais oxigênio',
      idealRange: { min: -0.6, max: -0.3 }
    },
    
    {
      var1Keywords: ['temperatura', 'temperature', 'temperatura_agua'],
      var2Keywords: ['gpd', 'ganho', 'crescimento'],
      category: 'Qualidade Água',
      relevanceScore: 8,
      expectedDirection: 'either',
      interpretation: 'Temperatura ótima maximiza crescimento (relação não-linear)',
      idealRange: { min: -0.5, max: 0.7 }
    },
    {
      var1Keywords: ['oxigenio', 'oxygen', 'oxigenio_dissolvido'],
      var2Keywords: ['sobrevivencia', 'survival'],
      category: 'Qualidade Água',
      relevanceScore: 10,
      expectedDirection: 'positive',
      interpretation: 'Oxigênio adequado é crítico para sobrevivência',
      idealRange: { min: 0.5, max: 0.8 }
    },
    {
      var1Keywords: ['oxigenio', 'oxygen'],
      var2Keywords: ['conversao_alimentar', 'ca', 'fcr'],
      category: 'Qualidade Água',
      relevanceScore: 8,
      expectedDirection: 'negative',
      interpretation: 'Melhor oxigenação melhora conversão alimentar',
      idealRange: { min: -0.6, max: -0.3 }
    },
    {
      var1Keywords: ['ph'],
      var2Keywords: ['sobrevivencia', 'survival'],
      category: 'Qualidade Água',
      relevanceScore: 7,
      expectedDirection: 'either',
      interpretation: 'pH fora da faixa ideal reduz sobrevivência',
      idealRange: { min: -0.5, max: 0.5 }
    },
    
    {
      var1Keywords: ['gpd', 'ganho', 'gain'],
      var2Keywords: ['tempo_cultivo', 'culture_time', 'dias'],
      category: 'Performance',
      relevanceScore: 8,
      expectedDirection: 'negative',
      interpretation: 'Maior ganho diário reduz tempo de cultivo',
      idealRange: { min: -0.7, max: -0.4 }
    }
  ],
  additionalMetrics: [
    'fator_condicao', 'uniformidade_lote', 'taxa_alimentacao',
    'amonia', 'nitrito', 'alcalinidade'
  ]
}

/**
 * Get correlation configuration for a specific species
 */
export function getSpeciesCorrelationConfig(species: string): SpeciesCorrelationConfig | null {
  const configs: Record<string, SpeciesCorrelationConfig> = {
    'bovine': BOVINE_CORRELATIONS,
    'swine': SWINE_CORRELATIONS,
    'poultry': POULTRY_CORRELATIONS,
    'sheep': SHEEP_CORRELATIONS,
    'goat': GOAT_CORRELATIONS,
    'forage': FORAGE_CORRELATIONS,
    'aquaculture': AQUACULTURE_CORRELATIONS
  }
  
  return configs[species.toLowerCase()] || null
}

/**
 * Get all species correlation configurations
 */
export function getAllSpeciesCorrelationConfigs(): Record<string, SpeciesCorrelationConfig> {
  return {
    'bovine': BOVINE_CORRELATIONS,
    'swine': SWINE_CORRELATIONS,
    'poultry': POULTRY_CORRELATIONS,
    'sheep': SHEEP_CORRELATIONS,
    'goat': GOAT_CORRELATIONS,
    'forage': FORAGE_CORRELATIONS,
    'aquaculture': AQUACULTURE_CORRELATIONS
  }
}
