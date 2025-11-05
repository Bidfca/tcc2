import { ReferenceDataService } from '@/lib/references/species-references'

describe('ReferenceDataService', () => {
  describe('validateMetric', () => {
    describe('Swine - Nursery Phase', () => {
      it('should classify value in ideal range as excellent', () => {
        const result = ReferenceDataService.validateMetric(0.45, 'swine', 'gpd_creche', 'nursery')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('excellent')
        expect(result.reference).toBeDefined()
      })

      it('should classify value between min and ideal_min as good', () => {
        const result = ReferenceDataService.validateMetric(0.37, 'swine', 'gpd_creche', 'nursery')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('good')
      })

      it('should classify value below minimum as below_minimum', () => {
        const result = ReferenceDataService.validateMetric(0.25, 'swine', 'gpd_creche', 'nursery')
        
        expect(result.valid).toBe(false)
        expect(result.status).toBe('below_minimum')
      })

      it('should classify value above maximum as above_maximum', () => {
        const result = ReferenceDataService.validateMetric(0.75, 'swine', 'gpd_creche', 'nursery')
        
        expect(result.valid).toBe(false)
        expect(result.status).toBe('above_maximum')
      })

      it('should validate mortality metric correctly', () => {
        const goodResult = ReferenceDataService.validateMetric(2, 'swine', 'mortalidade_creche', 'nursery')
        expect(goodResult.valid).toBe(true)
        expect(goodResult.status).toBe('excellent')

        const badResult = ReferenceDataService.validateMetric(8, 'swine', 'mortalidade_creche', 'nursery')
        expect(badResult.valid).toBe(false)
        expect(badResult.status).toBe('above_maximum')
      })
    })

    describe('Sheep - Wool Production', () => {
      it('should validate wool production metrics', () => {
        const result = ReferenceDataService.validateMetric(4.0, 'sheep', 'producao_la_anual', 'wool')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('excellent')
        expect(result.reference).toBeDefined()
        expect(result.reference?.unit).toBe('kg/ano')
      })

      it('should validate fiber diameter correctly', () => {
        const excellentResult = ReferenceDataService.validateMetric(22, 'sheep', 'diametro_fibra', 'wool')
        expect(excellentResult.status).toBe('excellent')

        const poorResult = ReferenceDataService.validateMetric(30, 'sheep', 'diametro_fibra', 'wool')
        expect(poorResult.valid).toBe(false)
        expect(poorResult.status).toBe('above_maximum')
      })
    })

    describe('Sheep - Milk Production', () => {
      it('should validate milk production metrics', () => {
        const result = ReferenceDataService.validateMetric(1.5, 'sheep', 'producao_leite_dia', 'milk')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('excellent')
        expect(result.reference?.unit).toBe('L/dia')
      })

      it('should validate milk quality metrics', () => {
        const fatResult = ReferenceDataService.validateMetric(6.5, 'sheep', 'gordura_leite', 'milk')
        expect(fatResult.status).toBe('excellent')

        const proteinResult = ReferenceDataService.validateMetric(5.5, 'sheep', 'proteina_leite', 'milk')
        expect(proteinResult.status).toBe('excellent')
      })
    })

    describe('Goat - Milk Production', () => {
      it('should validate goat milk production', () => {
        const result = ReferenceDataService.validateMetric(2.5, 'goat', 'producao_leite_dia', 'milk')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('excellent')
      })

      it('should validate somatic cell count', () => {
        const goodResult = ReferenceDataService.validateMetric(500000, 'goat', 'celulas_somaticas', 'milk')
        expect(goodResult.status).toBe('excellent')

        const badResult = ReferenceDataService.validateMetric(1200000, 'goat', 'celulas_somaticas', 'milk')
        expect(badResult.valid).toBe(false)
        expect(badResult.status).toBe('above_maximum')
      })
    })

    describe('Goat - Skin Production', () => {
      it('should validate skin quality metrics', () => {
        const result = ReferenceDataService.validateMetric(8, 'goat', 'qualidade_pele', 'skin')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('excellent')
      })

      it('should validate skin area', () => {
        const result = ReferenceDataService.validateMetric(0.8, 'goat', 'area_pele', 'skin')
        expect(result.status).toBe('excellent')
      })

      it('should validate skin thickness', () => {
        const result = ReferenceDataService.validateMetric(1.2, 'goat', 'espessura_pele', 'skin')
        expect(result.status).toBe('excellent')
      })
    })

    describe('Aquaculture - Pintado', () => {
      it('should validate pintado growth metrics', () => {
        const gpdResult = ReferenceDataService.validateMetric(4.0, 'aquaculture', 'gpd', 'pintado')
        expect(gpdResult.status).toBe('excellent')

        const survivalResult = ReferenceDataService.validateMetric(85, 'aquaculture', 'sobrevivencia', 'pintado')
        expect(survivalResult.status).toBe('excellent')
      })

      it('should validate water quality parameters', () => {
        const tempResult = ReferenceDataService.validateMetric(28, 'aquaculture', 'temperatura', 'pintado')
        expect(tempResult.status).toBe('excellent')

        const oxygenResult = ReferenceDataService.validateMetric(6, 'aquaculture', 'oxigenio_dissolvido', 'pintado')
        expect(oxygenResult.status).toBe('excellent')

        const phResult = ReferenceDataService.validateMetric(7.5, 'aquaculture', 'ph', 'pintado')
        expect(phResult.status).toBe('excellent')
      })
    })

    describe('Aquaculture - Pacu', () => {
      it('should validate pacu growth metrics', () => {
        const gpdResult = ReferenceDataService.validateMetric(3.5, 'aquaculture', 'gpd', 'pacu')
        expect(gpdResult.status).toBe('excellent')

        const survivalResult = ReferenceDataService.validateMetric(88, 'aquaculture', 'sobrevivencia', 'pacu')
        expect(survivalResult.status).toBe('excellent')
      })
    })

    describe('No Reference Data', () => {
      it('should return no_reference status for unknown metrics', () => {
        const result = ReferenceDataService.validateMetric(100, 'swine', 'unknown_metric', 'nursery')
        
        expect(result.valid).toBe(true)
        expect(result.status).toBe('no_reference')
        expect(result.reference).toBeUndefined()
      })
    })
  })

  describe('compareMultipleMetrics', () => {
    it('should correctly aggregate multiple metric comparisons for swine', () => {
      const data = {
        gpd_creche: 0.45,
        conversao_creche: 1.4,
        mortalidade_creche: 2
      }

      const result = ReferenceDataService.compareMultipleMetrics(data, 'swine', 'nursery')

      expect(result.comparisons).toHaveLength(3)
      expect(result.summary.excellent).toBeGreaterThan(0)
      expect(result.overallStatus).toBe('excellent')
    })

    it('should detect attention status when metrics are out of range', () => {
      const data = {
        gpd_creche: 0.25,
        conversao_creche: 2.0,
        mortalidade_creche: 10
      }

      const result = ReferenceDataService.compareMultipleMetrics(data, 'swine', 'nursery')

      expect(result.summary.attention).toBeGreaterThan(0)
      expect(result.overallStatus).toBe('attention')
    })

    it('should correctly aggregate sheep wool production metrics', () => {
      const data = {
        producao_la_anual: 4.0,
        diametro_fibra: 22,
        rendimento_la_limpa: 65
      }

      const result = ReferenceDataService.compareMultipleMetrics(data, 'sheep', 'wool')

      expect(result.comparisons).toHaveLength(3)
      expect(result.overallStatus).toBe('excellent')
    })

    it('should correctly aggregate goat milk production metrics', () => {
      const data = {
        producao_leite_dia: 2.5,
        gordura_leite: 3.8,
        proteina_leite: 3.4
      }

      const result = ReferenceDataService.compareMultipleMetrics(data, 'goat', 'milk')

      expect(result.comparisons).toHaveLength(3)
      expect(result.overallStatus).toBe('excellent')
    })

    it('should correctly aggregate aquaculture metrics for pintado', () => {
      const data = {
        gpd: 4.0,
        sobrevivencia: 85,
        temperatura: 28,
        oxigenio_dissolvido: 6
      }

      const result = ReferenceDataService.compareMultipleMetrics(data, 'aquaculture', 'pintado')

      expect(result.comparisons).toHaveLength(4)
      expect(result.overallStatus).toBe('excellent')
    })
  })

  describe('getReference', () => {
    it('should retrieve sheep wool references', () => {
      const references = ReferenceDataService.getReference('sheep', 'wool')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('producao_la_anual')
      expect(references).toHaveProperty('diametro_fibra')
      expect(references).toHaveProperty('rendimento_la_limpa')
    })

    it('should retrieve sheep milk references', () => {
      const references = ReferenceDataService.getReference('sheep', 'milk')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('producao_leite_dia')
      expect(references).toHaveProperty('gordura_leite')
      expect(references).toHaveProperty('proteina_leite')
    })

    it('should retrieve goat milk references', () => {
      const references = ReferenceDataService.getReference('goat', 'milk')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('producao_leite_dia')
      expect(references).toHaveProperty('celulas_somaticas')
    })

    it('should retrieve goat skin references', () => {
      const references = ReferenceDataService.getReference('goat', 'skin')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('qualidade_pele')
      expect(references).toHaveProperty('area_pele')
      expect(references).toHaveProperty('espessura_pele')
    })

    it('should retrieve pintado references with expanded metrics', () => {
      const references = ReferenceDataService.getReference('aquaculture', 'pintado')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('gpd')
      expect(references).toHaveProperty('sobrevivencia')
      expect(references).toHaveProperty('temperatura')
      expect(references).toHaveProperty('oxigenio_dissolvido')
    })

    it('should retrieve pacu references with expanded metrics', () => {
      const references = ReferenceDataService.getReference('aquaculture', 'pacu')
      
      expect(references).toBeDefined()
      expect(references).toHaveProperty('gpd')
      expect(references).toHaveProperty('sobrevivencia')
    })

    it('should retrieve swine mortality metrics', () => {
      const nurseryRefs = ReferenceDataService.getReference('swine', 'nursery')
      expect(nurseryRefs).toHaveProperty('mortalidade_creche')

      const growingRefs = ReferenceDataService.getReference('swine', 'growing')
      expect(growingRefs).toHaveProperty('mortalidade')

      const finishingRefs = ReferenceDataService.getReference('swine', 'finishing')
      expect(finishingRefs).toHaveProperty('mortalidade')

      const breedingRefs = ReferenceDataService.getReference('swine', 'breeding')
      expect(breedingRefs).toHaveProperty('mortalidade_leitoes')
      expect(breedingRefs).toHaveProperty('mortalidade_matrizes')
    })
  })

  describe('Edge Cases', () => {
    it('should handle values exactly at boundaries', () => {
      const minResult = ReferenceDataService.validateMetric(0.3, 'swine', 'gpd', 'nursery')
      expect(minResult.valid).toBe(true)

      const maxResult = ReferenceDataService.validateMetric(0.65, 'swine', 'gpd', 'nursery')
      expect(maxResult.valid).toBe(true)
    })

    it('should handle decimal precision correctly', () => {
      const result = ReferenceDataService.validateMetric(0.449999, 'swine', 'gpd', 'nursery')
      expect(result.valid).toBe(true)
    })
  })
})
