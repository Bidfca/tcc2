// lib/references/embrapa-data.ts
export const EMBRAPA_REFERENCES = {
  // FORRAGEM - EMBRAPA Gado de Corte
  forage: {
    brachiaria: {
      brizantha: {
        biomassa_seca_aguas: { 
          min: 2000, ideal: 4500, max: 7000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        biomassa_seca_seca: { 
          min: 800, ideal: 1800, max: 3000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 7, ideal: 10, max: 13, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fdn: { 
          min: 55, ideal: 62, max: 70, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fda: { 
          min: 28, ideal: 32, max: 38, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 55, ideal: 65, max: 72, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_pastejo_entrada: { 
          min: 25, ideal: 30, max: 35, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_pastejo_saida: { 
          min: 10, ideal: 15, max: 20, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        },
        taxa_lotacao_aguas: { 
          min: 2, ideal: 4, max: 6, 
          unit: 'UA/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        taxa_lotacao_seca: { 
          min: 0.5, ideal: 1.5, max: 2.5, 
          unit: 'UA/ha', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      decumbens: {
        biomassa_seca_aguas: { 
          min: 1800, ideal: 3800, max: 5500, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        biomassa_seca_seca: { 
          min: 700, ideal: 1500, max: 2500, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 6, ideal: 9, max: 12, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fdn: { 
          min: 58, ideal: 65, max: 72, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fda: { 
          min: 30, ideal: 34, max: 40, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 53, ideal: 62, max: 70, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      ruziziensis: {
        biomassa_seca_aguas: { 
          min: 1500, ideal: 3200, max: 4800, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 8, ideal: 11, max: 14, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 58, ideal: 68, max: 75, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      humidicola: {
        biomassa_seca_aguas: { 
          min: 1200, ideal: 2800, max: 4000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 5, ideal: 8, max: 11, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 50, ideal: 58, max: 65, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        }
      }
    },
    panicum: {
      maximum: {
        biomassa_seca_aguas: { 
          min: 3000, ideal: 6000, max: 9000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        biomassa_seca_seca: { 
          min: 1200, ideal: 2500, max: 4000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 8, ideal: 11, max: 14, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fdn: { 
          min: 60, ideal: 67, max: 73, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        fda: { 
          min: 32, ideal: 36, max: 42, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 58, ideal: 66, max: 72, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_entrada: { 
          min: 70, ideal: 90, max: 110, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_saida: { 
          min: 30, ideal: 40, max: 50, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      mombaca: {
        biomassa_seca_aguas: { 
          min: 3500, ideal: 6500, max: 10000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 9, ideal: 12, max: 15, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_entrada: { 
          min: 80, ideal: 90, max: 100, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      tanzania: {
        biomassa_seca_aguas: { 
          min: 2800, ideal: 5500, max: 8000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 9, ideal: 12, max: 15, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        digestibilidade: { 
          min: 60, ideal: 68, max: 74, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_entrada: { 
          min: 60, ideal: 70, max: 80, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        }
      },
      massai: {
        biomassa_seca_aguas: { 
          min: 2000, ideal: 4000, max: 6000, 
          unit: 'kg/ha', source: 'EMBRAPA Gado de Corte 2023' 
        },
        proteina_bruta: { 
          min: 10, ideal: 13, max: 16, 
          unit: '%', source: 'EMBRAPA Gado de Corte 2023' 
        },
        altura_entrada: { 
          min: 45, ideal: 55, max: 65, 
          unit: 'cm', source: 'EMBRAPA Gado de Corte 2023' 
        }
      }
    },
    leguminosas: {
      stylosanthes: {
        proteina_bruta: { 
          min: 12, ideal: 16, max: 20, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        },
        fixacao_n: { 
          min: 80, ideal: 120, max: 180, 
          unit: 'kg/ha/ano', source: 'EMBRAPA Cerrados 2022' 
        },
        digestibilidade: { 
          min: 55, ideal: 62, max: 68, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        }
      },
      leucena: {
        proteina_bruta: { 
          min: 18, ideal: 22, max: 26, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        },
        tanino: { 
          min: 1, ideal: 2, max: 4, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        },
        digestibilidade: { 
          min: 58, ideal: 65, max: 70, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        }
      },
      gliricidea: {
        proteina_bruta: { 
          min: 20, ideal: 24, max: 28, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        },
        digestibilidade: { 
          min: 60, ideal: 68, max: 75, 
          unit: '%', source: 'EMBRAPA Cerrados 2022' 
        }
      }
    }
  },

  // OVINOS E CAPRINOS - EMBRAPA Caprinos e Ovinos
  sheep_goat: {
    ovinos_corte: {
      peso_nascimento: { 
        min: 3, ideal: 4, max: 5, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      gpd_cria: { 
        min: 0.15, ideal: 0.25, max: 0.35, 
        unit: 'kg/dia', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_desmame: { 
        min: 15, ideal: 20, max: 25, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_abate: { 
        min: 35, ideal: 40, max: 45, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      rendimento_carcaca: { 
        min: 42, ideal: 46, max: 50, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.2, ideal: 1.5, max: 1.8, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 240, ideal: 270, max: 300, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      mortalidade_cria: { 
        min: 3, ideal: 5, max: 10, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      escore_corporal: { 
        min: 2.0, ideal: 3.0, max: 4.0, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    },
    ovinos_la: {
      peso_nascimento: { 
        min: 3.5, ideal: 4.5, max: 5.5, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_vivo_adulto: { 
        min: 50, ideal: 65, max: 80, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      producao_la_anual: { 
        min: 2.5, ideal: 4.0, max: 6.0, 
        unit: 'kg/ano', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      diametro_fibra: { 
        min: 18, ideal: 22, max: 28, 
        unit: 'microns', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      comprimento_mecha: { 
        min: 6, ideal: 8, max: 12, 
        unit: 'cm', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      rendimento_la_limpa: { 
        min: 55, ideal: 65, max: 75, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.0, ideal: 1.3, max: 1.6, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 300, ideal: 365, max: 400, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      escore_corporal: { 
        min: 2.5, ideal: 3.0, max: 3.5, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    },
    ovinos_leite: {
      peso_nascimento: { 
        min: 3.0, ideal: 4.0, max: 5.0, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      producao_leite_dia: { 
        min: 0.8, ideal: 1.5, max: 2.5, 
        unit: 'L/dia', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      producao_leite_lactacao: { 
        min: 120, ideal: 200, max: 300, 
        unit: 'L', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      gordura_leite: { 
        min: 5.0, ideal: 6.5, max: 8.0, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      proteina_leite: { 
        min: 4.5, ideal: 5.5, max: 6.5, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      celulas_somaticas: { 
        min: 200000, ideal: 400000, max: 800000, 
        unit: 'cel/mL', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      duracao_lactacao: { 
        min: 120, ideal: 180, max: 240, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.3, ideal: 1.6, max: 2.0, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 240, ideal: 300, max: 365, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      escore_corporal: { 
        min: 2.5, ideal: 3.0, max: 3.5, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    },
    caprinos_corte: {
      peso_nascimento: { 
        min: 2.5, ideal: 3.5, max: 4.5, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      gpd_cria: { 
        min: 0.10, ideal: 0.18, max: 0.25, 
        unit: 'kg/dia', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_desmame: { 
        min: 12, ideal: 16, max: 20, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_abate: { 
        min: 30, ideal: 35, max: 40, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      rendimento_carcaca: { 
        min: 40, ideal: 45, max: 50, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.4, ideal: 1.7, max: 2.0, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 240, ideal: 280, max: 320, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      mortalidade_cria: { 
        min: 3, ideal: 5, max: 10, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      escore_corporal: { 
        min: 2.0, ideal: 2.5, max: 3.0, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    },
    caprinos_leite: {
      peso_nascimento: { 
        min: 2.5, ideal: 3.5, max: 4.5, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      producao_leite_dia: { 
        min: 1.5, ideal: 2.5, max: 4.0, 
        unit: 'L/dia', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      producao_leite_lactacao: { 
        min: 250, ideal: 400, max: 600, 
        unit: 'L', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      gordura_leite: { 
        min: 3.0, ideal: 3.8, max: 5.0, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      proteina_leite: { 
        min: 2.8, ideal: 3.4, max: 4.2, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      celulas_somaticas: { 
        min: 300000, ideal: 500000, max: 1000000, 
        unit: 'cel/mL', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      duracao_lactacao: { 
        min: 180, ideal: 240, max: 305, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.5, ideal: 1.8, max: 2.2, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 240, ideal: 300, max: 365, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      escore_corporal: { 
        min: 2.5, ideal: 3.0, max: 3.5, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    },
    caprinos_pele: {
      peso_nascimento: { 
        min: 2.5, ideal: 3.5, max: 4.5, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      peso_abate: { 
        min: 25, ideal: 30, max: 35, 
        unit: 'kg', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      area_pele: { 
        min: 0.6, ideal: 0.8, max: 1.0, 
        unit: 'm²', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      espessura_pele: { 
        min: 0.8, ideal: 1.2, max: 1.6, 
        unit: 'mm', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      qualidade_pele: { 
        min: 6, ideal: 8, max: 10, 
        unit: 'pontos', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      rendimento_pele: { 
        min: 8, ideal: 10, max: 12, 
        unit: '%', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      defeitos_pele: { 
        min: 0, ideal: 2, max: 5, 
        unit: 'defeitos/pele', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      prolificidade: { 
        min: 1.3, ideal: 1.6, max: 1.9, 
        unit: 'crias/parto', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      },
      intervalo_partos: { 
        min: 240, ideal: 280, max: 320, 
        unit: 'dias', source: 'EMBRAPA Caprinos e Ovinos 2023' 
      }
    }
  },

  // PISCICULTURA - EMBRAPA Pesca e Aquicultura
  aquaculture: {
    tilapia: {
      densidade_estocagem_intensivo: { 
        min: 3, ideal: 5, max: 8, 
        unit: 'peixes/m³', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      densidade_estocagem_semi: { 
        min: 1, ideal: 3, max: 5, 
        unit: 'peixes/m²', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      conversao_alimentar: { 
        min: 1.2, ideal: 1.5, max: 1.8, 
        unit: 'kg/kg', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      oxigenio_dissolvido: { 
        min: 4, ideal: 6, max: 8, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      temperatura: { 
        min: 25, ideal: 28, max: 32, 
        unit: '°C', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      ph: { 
        min: 6.5, ideal: 7.5, max: 8.5, 
        unit: '', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      amonia_total: { 
        min: 0, ideal: 0.5, max: 1.0, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      gpd: { 
        min: 2, ideal: 4, max: 6, 
        unit: 'g/dia', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      peso_abate: { 
        min: 400, ideal: 600, max: 800, 
        unit: 'g', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      sobrevivencia: { 
        min: 85, ideal: 92, max: 98, 
        unit: '%', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      }
    },
    tambaqui: {
      densidade_estocagem: { 
        min: 0.5, ideal: 1.5, max: 2.5, 
        unit: 'peixes/m²', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      conversao_alimentar: { 
        min: 1.5, ideal: 1.8, max: 2.2, 
        unit: 'kg/kg', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      gpd: { 
        min: 3, ideal: 5, max: 8, 
        unit: 'g/dia', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      peso_abate: { 
        min: 1500, ideal: 2500, max: 3500, 
        unit: 'g', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      temperatura: { 
        min: 26, ideal: 29, max: 32, 
        unit: '°C', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      oxigenio_dissolvido: { 
        min: 4, ideal: 6, max: 8, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      sobrevivencia: { 
        min: 80, ideal: 90, max: 95, 
        unit: '%', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      }
    },
    pintado: {
      densidade_estocagem: { 
        min: 0.3, ideal: 0.8, max: 1.2, 
        unit: 'peixes/m²', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      conversao_alimentar: { 
        min: 1.8, ideal: 2.2, max: 2.6, 
        unit: 'kg/kg', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      gpd: { 
        min: 2.5, ideal: 4.0, max: 6.0, 
        unit: 'g/dia', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      peso_abate: { 
        min: 1000, ideal: 1800, max: 2500, 
        unit: 'g', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      sobrevivencia: { 
        min: 75, ideal: 85, max: 92, 
        unit: '%', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      temperatura: { 
        min: 24, ideal: 28, max: 30, 
        unit: '°C', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      oxigenio_dissolvido: { 
        min: 4, ideal: 6, max: 8, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      ph: { 
        min: 6.5, ideal: 7.5, max: 8.5, 
        unit: '', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      amonia_total: { 
        min: 0, ideal: 0.5, max: 1.0, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      }
    },
    pacu: {
      densidade_estocagem: { 
        min: 0.5, ideal: 1.2, max: 2.0, 
        unit: 'peixes/m²', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      conversao_alimentar: { 
        min: 1.6, ideal: 2.0, max: 2.4, 
        unit: 'kg/kg', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      gpd: { 
        min: 2.0, ideal: 3.5, max: 5.5, 
        unit: 'g/dia', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      peso_abate: { 
        min: 800, ideal: 1200, max: 1600, 
        unit: 'g', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      sobrevivencia: { 
        min: 80, ideal: 88, max: 95, 
        unit: '%', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      temperatura: { 
        min: 25, ideal: 28, max: 32, 
        unit: '°C', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      oxigenio_dissolvido: { 
        min: 4, ideal: 6, max: 8, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      ph: { 
        min: 6.5, ideal: 7.5, max: 8.5, 
        unit: '', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      },
      amonia_total: { 
        min: 0, ideal: 0.5, max: 1.0, 
        unit: 'mg/L', source: 'EMBRAPA Pesca e Aquicultura 2023' 
      }
    }
  }
}

// Type definitions
export interface EMBRAPAReferenceValue {
  min: number
  ideal: number
  max: number
  unit: string
  source: string
}

export interface EMBRAPASpeciesReference {
  [category: string]: {
    [metric: string]: EMBRAPAReferenceValue
  }
}

export interface EMBRAPAReferences {
  [domain: string]: {
    [species: string]: EMBRAPASpeciesReference | {
      [subtype: string]: {
        [metric: string]: EMBRAPAReferenceValue
      }
    }
  }
}
