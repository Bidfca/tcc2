// lib/references/nrc-data.ts
export const NRC_REFERENCES = {
  // BOVINOS - NRC 2016 (8ª edição)
  bovine: {
    dairy: {
      peso_nascimento: { 
        min: 35, ideal_min: 38, ideal_max: 42, max: 45, 
        unit: 'kg', source: 'NRC Dairy Cattle 2016' 
      },
      producao_leite: { 
        min: 15, ideal_min: 25, ideal_max: 35, max: 45, 
        unit: 'L/dia', source: 'NRC Dairy Cattle 2016' 
      },
      proteina_leite: { 
        min: 2.8, ideal_min: 3.0, ideal_max: 3.4, max: 3.8, 
        unit: '%', source: 'NRC Dairy Cattle 2016' 
      },
      gordura_leite: { 
        min: 3.0, ideal_min: 3.5, ideal_max: 4.0, max: 4.5, 
        unit: '%', source: 'NRC Dairy Cattle 2016' 
      },
      celulas_somaticas: { 
        min: 50000, ideal_min: 100000, ideal_max: 200000, max: 400000, 
        unit: 'cel/mL', source: 'NRC Dairy Cattle 2016' 
      },
      escore_corporal: { 
        min: 2.0, ideal_min: 3.0, ideal_max: 3.5, max: 4.0, 
        unit: 'pontos', source: 'NRC Dairy Cattle 2016' 
      },
      dias_lactacao: { 
        min: 0, ideal_min: 60, ideal_max: 200, max: 305, 
        unit: 'dias', source: 'NRC Dairy Cattle 2016' 
      },
      intervalo_partos: { 
        min: 350, ideal_min: 365, ideal_max: 400, max: 450, 
        unit: 'dias', source: 'NRC Dairy Cattle 2016' 
      }
    },
    beef: {
      peso_nascimento: { 
        min: 28, ideal_min: 32, ideal_max: 38, max: 42, 
        unit: 'kg', source: 'NRC Beef Cattle 2016' 
      },
      peso_desmame: { 
        min: 160, ideal_min: 200, ideal_max: 250, max: 280, 
        unit: 'kg', source: 'NRC Beef Cattle 2016' 
      },
      gpd: { 
        min: 0.8, ideal_min: 1.2, ideal_max: 1.5, max: 1.8, 
        unit: 'kg/dia', source: 'NRC Beef Cattle 2016' 
      },
      rendimento_carcaca: { 
        min: 48, ideal_min: 52, ideal_max: 58, max: 62, 
        unit: '%', source: 'NRC Beef Cattle 2016' 
      },
      area_olho_lombo: { 
        min: 65, ideal_min: 75, ideal_max: 90, max: 100, 
        unit: 'cm²', source: 'NRC Beef Cattle 2016' 
      },
      espessura_gordura: { 
        min: 3, ideal_min: 4, ideal_max: 6, max: 8, 
        unit: 'mm', source: 'NRC Beef Cattle 2016' 
      },
      marmoreiro: { 
        min: 2, ideal_min: 3, ideal_max: 5, max: 7, 
        unit: 'score', source: 'NRC Beef Cattle 2016' 
      },
      conversao_alimentar: { 
        min: 5, ideal_min: 6, ideal_max: 8, max: 10, 
        unit: 'kg/kg', source: 'NRC Beef Cattle 2016' 
      }
    }
  },

  // SUÍNOS - NRC 2012 (11ª edição)
  swine: {
    nursery: {
      peso_desmame: { 
        min: 5.5, ideal_min: 6.5, ideal_max: 7.5, max: 8.5, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      peso_saida_creche: { 
        min: 20, ideal_min: 23, ideal_max: 28, max: 32, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      gpd_creche: { 
        min: 0.35, ideal_min: 0.42, ideal_max: 0.50, max: 0.58, 
        unit: 'kg/dia', source: 'NRC Swine 2012' 
      },
      conversao_creche: { 
        min: 1.3, ideal_min: 1.4, ideal_max: 1.6, max: 1.8, 
        unit: 'kg/kg', source: 'NRC Swine 2012' 
      },
      mortalidade_creche: { 
        min: 0, ideal_min: 1, ideal_max: 2, max: 3, 
        unit: '%', source: 'NRC Swine 2012' 
      }
    },
    growing: {
      peso_inicial: { 
        min: 20, ideal_min: 23, ideal_max: 28, max: 32, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      peso_final: { 
        min: 55, ideal_min: 60, ideal_max: 70, max: 75, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      gpd: { 
        min: 0.6, ideal_min: 0.7, ideal_max: 0.85, max: 0.95, 
        unit: 'kg/dia', source: 'NRC Swine 2012' 
      },
      conversao: { 
        min: 2.0, ideal_min: 2.2, ideal_max: 2.5, max: 2.8, 
        unit: 'kg/kg', source: 'NRC Swine 2012' 
      },
      mortalidade: { 
        min: 0, ideal_min: 1, ideal_max: 2, max: 3, 
        unit: '%', source: 'NRC Swine 2012' 
      }
    },
    finishing: {
      peso_inicial: { 
        min: 55, ideal_min: 60, ideal_max: 70, max: 75, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      peso_abate: { 
        min: 100, ideal_min: 110, ideal_max: 125, max: 135, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      gpd: { 
        min: 0.75, ideal_min: 0.85, ideal_max: 1.0, max: 1.15, 
        unit: 'kg/dia', source: 'NRC Swine 2012' 
      },
      conversao: { 
        min: 2.3, ideal_min: 2.5, ideal_max: 2.8, max: 3.2, 
        unit: 'kg/kg', source: 'NRC Swine 2012' 
      },
      espessura_toucinho: { 
        min: 10, ideal_min: 12, ideal_max: 16, max: 20, 
        unit: 'mm', source: 'NRC Swine 2012' 
      },
      carne_magra: { 
        min: 52, ideal_min: 56, ideal_max: 60, max: 64, 
        unit: '%', source: 'NRC Swine 2012' 
      },
      profundidade_lombo: { 
        min: 45, ideal_min: 50, ideal_max: 60, max: 65, 
        unit: 'mm', source: 'NRC Swine 2012' 
      },
      mortalidade: { 
        min: 0, ideal_min: 1, ideal_max: 2, max: 3, 
        unit: '%', source: 'NRC Swine 2012' 
      }
    },
    breeding: {
      leitoes_nascidos_vivos: { 
        min: 10, ideal_min: 12, ideal_max: 14, max: 16, 
        unit: 'leitões', source: 'NRC Swine 2012' 
      },
      leitoes_desmamados: { 
        min: 9, ideal_min: 11, ideal_max: 13, max: 14, 
        unit: 'leitões', source: 'NRC Swine 2012' 
      },
      peso_medio_nascimento: { 
        min: 1.2, ideal_min: 1.4, ideal_max: 1.6, max: 1.8, 
        unit: 'kg', source: 'NRC Swine 2012' 
      },
      intervalo_desmame_cio: { 
        min: 3, ideal_min: 4, ideal_max: 5, max: 7, 
        unit: 'dias', source: 'NRC Swine 2012' 
      },
      taxa_concepcao: { 
        min: 80, ideal_min: 85, ideal_max: 90, max: 95, 
        unit: '%', source: 'NRC Swine 2012' 
      },
      partos_porca_ano: { 
        min: 2.2, ideal_min: 2.3, ideal_max: 2.5, max: 2.6, 
        unit: 'partos', source: 'NRC Swine 2012' 
      },
      mortalidade_leitoes: { 
        min: 5, ideal_min: 8, ideal_max: 12, max: 15, 
        unit: '%', source: 'NRC Swine 2012' 
      },
      mortalidade_matrizes: { 
        min: 0, ideal_min: 3, ideal_max: 6, max: 10, 
        unit: '%/ano', source: 'NRC Swine 2012' 
      }
    }
  },

  // AVES - NRC 1994 (9ª edição)
  poultry: {
    broiler: {
      peso_7d: { 
        min: 160, ideal_min: 180, ideal_max: 200, max: 220, 
        unit: 'g', source: 'NRC Poultry 1994' 
      },
      peso_21d: { 
        min: 900, ideal_min: 950, ideal_max: 1050, max: 1100, 
        unit: 'g', source: 'NRC Poultry 1994' 
      },
      peso_35d: { 
        min: 2000, ideal_min: 2200, ideal_max: 2400, max: 2600, 
        unit: 'g', source: 'NRC Poultry 1994' 
      },
      peso_42d: { 
        min: 2400, ideal_min: 2600, ideal_max: 2900, max: 3100, 
        unit: 'g', source: 'NRC Poultry 1994' 
      },
      gpd_total: { 
        min: 55, ideal_min: 60, ideal_max: 70, max: 75, 
        unit: 'g/dia', source: 'NRC Poultry 1994' 
      },
      conversao_alimentar: { 
        min: 1.5, ideal_min: 1.6, ideal_max: 1.75, max: 1.9, 
        unit: 'kg/kg', source: 'NRC Poultry 1994' 
      },
      mortalidade: { 
        min: 0, ideal_min: 2, ideal_max: 3.5, max: 5, 
        unit: '%', source: 'NRC Poultry 1994' 
      },
      iep: { 
        min: 280, ideal_min: 320, ideal_max: 380, max: 420, 
        unit: 'pontos', source: 'NRC Poultry 1994' 
      },
      rendimento_carcaca: { 
        min: 70, ideal_min: 73, ideal_max: 76, max: 78, 
        unit: '%', source: 'NRC Poultry 1994' 
      },
      rendimento_peito: { 
        min: 32, ideal_min: 35, ideal_max: 38, max: 40, 
        unit: '%', source: 'NRC Poultry 1994' 
      }
    },
    layer: {
      idade_inicio_postura: { 
        min: 16, ideal_min: 18, ideal_max: 20, max: 22, 
        unit: 'semanas', source: 'NRC Poultry 1994' 
      },
      pico_postura: { 
        min: 90, ideal_min: 94, ideal_max: 96, max: 98, 
        unit: '%', source: 'NRC Poultry 1994' 
      },
      producao_ovos: { 
        min: 75, ideal_min: 85, ideal_max: 92, max: 95, 
        unit: '%', source: 'NRC Poultry 1994' 
      },
      peso_ovo: { 
        min: 55, ideal_min: 58, ideal_max: 63, max: 68, 
        unit: 'g', source: 'NRC Poultry 1994' 
      },
      conversao_duzia: { 
        min: 1.4, ideal_min: 1.5, ideal_max: 1.7, max: 1.9, 
        unit: 'kg/dz', source: 'NRC Poultry 1994' 
      },
      massa_ovos: { 
        min: 45, ideal_min: 50, ideal_max: 55, max: 60, 
        unit: 'g/ave/dia', source: 'NRC Poultry 1994' 
      },
      mortalidade: { 
        min: 0, ideal_min: 0.5, ideal_max: 1, max: 2, 
        unit: '%/mês', source: 'NRC Poultry 1994' 
      }
    }
  }
}

// Type definitions
export interface ReferenceValue {
  min: number
  ideal_min: number
  ideal_max: number
  max: number
  unit: string
  source: string
}

export interface SpeciesReference {
  [subtype: string]: {
    [metric: string]: ReferenceValue
  }
}

export interface NRCReferences {
  [species: string]: SpeciesReference
}
