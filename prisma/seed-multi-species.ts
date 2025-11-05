// prisma/seed-multi-species.ts
import { PrismaClient } from '@prisma/client'
import { NRC_REFERENCES } from '../lib/references/nrc-data'
import { EMBRAPA_REFERENCES } from '../lib/references/embrapa-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do sistema multi-espécie...')
  
  try {
    // 1. Criar espécies
    const species = await seedSpecies()
    console.log('✅ Espécies criadas:', Object.keys(species).length)
    
    // 2. Criar subtipos
    const subtypes = await seedSubtypes(species)
    console.log('✅ Subtipos criados:', Object.keys(subtypes).length)
    
    // 3. Popular dados de referência NRC
    const nrcCount = await seedNRCReferences(species, subtypes)
    console.log('✅ Referências NRC criadas:', nrcCount)
    
    // 4. Popular dados de forragem EMBRAPA
    const forageCount = await seedForageReferences()
    console.log('✅ Referências de forragem criadas:', forageCount)
    
    // 5. Popular dados de ovinos/caprinos EMBRAPA
    const sgCount = await seedSheepGoatReferences(species, subtypes)
    console.log('✅ Referências ovinos/caprinos criadas:', sgCount)
    
    // 6. Popular dados de piscicultura EMBRAPA
    const aquaCount = await seedAquacultureReferences(species, subtypes)
    console.log('✅ Referências piscicultura criadas:', aquaCount)
    
    console.log('🎉 Seed concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  }
}

async function seedSpecies() {
  const speciesData = [
    { code: 'bovine', name: 'Bovinos', hasSubtypes: true },
    { code: 'swine', name: 'Suínos', hasSubtypes: true },
    { code: 'poultry', name: 'Aves', hasSubtypes: true },
    { code: 'sheep', name: 'Ovinos', hasSubtypes: true },
    { code: 'goat', name: 'Caprinos', hasSubtypes: true },
    { code: 'forage', name: 'Forragem', hasSubtypes: false },
    { code: 'aquaculture', name: 'Piscicultura', hasSubtypes: true }
  ]
  
  const species: Record<string, any> = {}
  
  for (const sp of speciesData) {
    const created = await prisma.animalSpecies.upsert({
      where: { code: sp.code },
      update: { name: sp.name, hasSubtypes: sp.hasSubtypes },
      create: sp
    })
    species[sp.code] = created
    console.log(`  ✓ Espécie: ${sp.name}`)
  }
  
  return species
}

async function seedSubtypes(species: Record<string, any>) {
  const subtypesData = [
    // Bovinos
    { speciesCode: 'bovine', code: 'dairy', name: 'Leite', description: 'Produção leiteira' },
    { speciesCode: 'bovine', code: 'beef', name: 'Corte', description: 'Produção de carne' },
    { speciesCode: 'bovine', code: 'dual', name: 'Dupla Aptidão', description: 'Leite e carne' },
    
    // Aves
    { speciesCode: 'poultry', code: 'broiler', name: 'Frango de Corte', description: 'Produção de carne de frango' },
    { speciesCode: 'poultry', code: 'layer', name: 'Poedeiras', description: 'Produção de ovos' },
    { speciesCode: 'poultry', code: 'breeder', name: 'Matrizes', description: 'Reprodução' },
    
    // Suínos
    { speciesCode: 'swine', code: 'nursery', name: 'Creche', description: '21 a 63 dias' },
    { speciesCode: 'swine', code: 'growing', name: 'Crescimento', description: '63 a 120 dias' },
    { speciesCode: 'swine', code: 'finishing', name: 'Terminação', description: '120 dias ao abate' },
    { speciesCode: 'swine', code: 'breeding', name: 'Reprodução', description: 'Matrizes e reprodutores' },
    
    // Ovinos
    { speciesCode: 'sheep', code: 'meat', name: 'Corte', description: 'Produção de carne ovina' },
    { speciesCode: 'sheep', code: 'wool', name: 'Lã', description: 'Produção de lã' },
    { speciesCode: 'sheep', code: 'milk', name: 'Leite', description: 'Produção de leite ovino' },
    
    // Caprinos
    { speciesCode: 'goat', code: 'meat', name: 'Corte', description: 'Produção de carne caprina' },
    { speciesCode: 'goat', code: 'milk', name: 'Leite', description: 'Produção de leite caprino' },
    { speciesCode: 'goat', code: 'skin', name: 'Pele', description: 'Produção de peles' },
    
    // Piscicultura
    { speciesCode: 'aquaculture', code: 'tilapia', name: 'Tilápia', description: 'Produção de tilápia' },
    { speciesCode: 'aquaculture', code: 'tambaqui', name: 'Tambaqui', description: 'Produção de tambaqui' },
    { speciesCode: 'aquaculture', code: 'pintado', name: 'Pintado', description: 'Produção de pintado' },
    { speciesCode: 'aquaculture', code: 'pacu', name: 'Pacu', description: 'Produção de pacu' }
  ]
  
  const subtypes: Record<string, any> = {}
  
  for (const st of subtypesData) {
    if (!species[st.speciesCode]) {
      console.warn(`  ⚠ Espécie não encontrada: ${st.speciesCode}`)
      continue
    }
    
    // Buscar subtipo existente
    const existing = await prisma.animalSubtype.findFirst({
      where: {
        speciesId: species[st.speciesCode].id,
        code: st.code
      }
    })
    
    if (existing) {
      // Atualizar se existir
      const updated = await prisma.animalSubtype.update({
        where: { id: existing.id },
        data: {
          name: st.name,
          description: st.description
        }
      })
      subtypes[`${st.speciesCode}_${st.code}`] = updated
    } else {
      // Criar novo
      const created = await prisma.animalSubtype.create({
        data: {
          code: st.code,
          name: st.name,
          description: st.description,
          speciesId: species[st.speciesCode].id
        }
      })
      subtypes[`${st.speciesCode}_${st.code}`] = created
    }
    
    console.log(`  ✓ Subtipo: ${st.name} (${st.speciesCode})`)
  }
  
  return subtypes
}

async function seedNRCReferences(species: Record<string, any>, subtypes: Record<string, any>) {
  let count = 0
  
  for (const [speciesCode, speciesData] of Object.entries(NRC_REFERENCES)) {
    if (!species[speciesCode]) continue
    
    for (const [subtypeCode, metrics] of Object.entries(speciesData as any)) {
      const subtypeKey = `${speciesCode}_${subtypeCode}`
      const subtype = subtypes[subtypeKey]
      
      if (!subtype) {
        console.warn(`  ⚠ Subtipo não encontrado: ${subtypeKey}`)
        continue
      }
      
      for (const [metric, values] of Object.entries(metrics as Record<string, {
        min: number
        ideal_min?: number
        ideal_max?: number
        max: number
        unit: string
        source: string
      }>)) {
        // Verificar se já existe
        const existing = await prisma.referenceData.findFirst({
          where: {
            speciesId: species[speciesCode].id,
            subtypeId: subtype.id,
            metric
          }
        })
        
        if (!existing) {
          await prisma.referenceData.create({
            data: {
              speciesId: species[speciesCode].id,
              subtypeId: subtype.id,
              metric,
              minValue: values.min,
              idealMinValue: values.ideal_min ?? null,
              idealMaxValue: values.ideal_max ?? null,
              maxValue: values.max,
              unit: values.unit,
              source: values.source
            }
          })
          count++
        }
      }
    }
  }
  
  return count
}

async function seedForageReferences() {
  let count = 0
  const forageData = EMBRAPA_REFERENCES.forage
  
  for (const [forageType, varieties] of Object.entries(forageData)) {
    for (const [variety, metrics] of Object.entries(varieties as any)) {
      for (const [metric, values] of Object.entries(metrics as Record<string, {
        min: number
        ideal: number
        max: number
        unit: string
        source: string
      }>)) {
        // Verificar se já existe
        const existing = await prisma.forageReference.findFirst({
          where: {
            forageType,
            variety,
            metric,
            season: metric.includes('aguas') ? 'aguas' : 
                    metric.includes('seca') ? 'seca' : null
          }
        })
        
        if (!existing) {
          await prisma.forageReference.create({
            data: {
              forageType,
              variety,
              metric: metric.replace('_aguas', '').replace('_seca', ''),
              minValue: values.min,
              idealValue: values.ideal,
              maxValue: values.max,
              unit: values.unit,
              season: metric.includes('aguas') ? 'aguas' : 
                      metric.includes('seca') ? 'seca' : null,
              source: values.source
            }
          })
          count++
        }
      }
    }
  }
  
  return count
}

async function seedSheepGoatReferences(species: Record<string, any>, subtypes: Record<string, any>) {
  let count = 0
  const sgData = EMBRAPA_REFERENCES.sheep_goat
  
  const sheepMapping: Record<string, string> = {
    'ovinos_corte': 'meat',
    'ovinos_la': 'wool',
    'ovinos_leite': 'milk'
  }
  
  const goatMapping: Record<string, string> = {
    'caprinos_corte': 'meat',
    'caprinos_leite': 'milk',
    'caprinos_pele': 'skin'
  }
  
  // Ovinos
  if (species.sheep) {
    for (const [dataKey, subtypeCode] of Object.entries(sheepMapping)) {
      const metrics = (sgData as any)[dataKey]
      if (!metrics) continue
      
      const subtype = subtypes[`sheep_${subtypeCode}`]
      if (!subtype) {
        console.warn(`  ⚠ Subtipo de ovinos não encontrado: ${subtypeCode}`)
        continue
      }
      
      for (const [metric, values] of Object.entries(metrics as Record<string, {
        min: number
        ideal: number
        max: number
        unit: string
        source: string
      }>)) {
        const existing = await prisma.referenceData.findFirst({
          where: {
            speciesId: species.sheep.id,
            subtypeId: subtype.id,
            metric
          }
        })
        
        if (!existing) {
          await prisma.referenceData.create({
            data: {
              speciesId: species.sheep.id,
              subtypeId: subtype.id,
              metric,
              minValue: values.min,
              idealMinValue: values.ideal ? values.ideal * 0.95 : values.min,
              idealMaxValue: values.ideal ? values.ideal * 1.05 : values.max,
              maxValue: values.max,
              unit: values.unit,
              source: values.source
            }
          })
          count++
        }
      }
    }
  }
  
  // Caprinos
  if (species.goat) {
    for (const [dataKey, subtypeCode] of Object.entries(goatMapping)) {
      const metrics = (sgData as any)[dataKey]
      if (!metrics) continue
      
      const subtype = subtypes[`goat_${subtypeCode}`]
      if (!subtype) {
        console.warn(`  ⚠ Subtipo de caprinos não encontrado: ${subtypeCode}`)
        continue
      }
      
      for (const [metric, values] of Object.entries(metrics as Record<string, {
        min: number
        ideal: number
        max: number
        unit: string
        source: string
      }>)) {
        const existing = await prisma.referenceData.findFirst({
          where: {
            speciesId: species.goat.id,
            subtypeId: subtype.id,
            metric
          }
        })
        
        if (!existing) {
          await prisma.referenceData.create({
            data: {
              speciesId: species.goat.id,
              subtypeId: subtype.id,
              metric,
              minValue: values.min,
              idealMinValue: values.ideal ? values.ideal * 0.95 : values.min,
              idealMaxValue: values.ideal ? values.ideal * 1.05 : values.max,
              maxValue: values.max,
              unit: values.unit,
              source: values.source
            }
          })
          count++
        }
      }
    }
  }
  
  return count
}

async function seedAquacultureReferences(species: Record<string, any>, subtypes: Record<string, any>) {
  let count = 0
  const aquaData = EMBRAPA_REFERENCES.aquaculture
  
  if (!species.aquaculture) return count
  
  for (const [fishType, metrics] of Object.entries(aquaData)) {
    const subtypeKey = `aquaculture_${fishType}`
    const subtype = subtypes[subtypeKey]
    
    if (!subtype) {
      console.warn(`  ⚠ Subtipo de piscicultura não encontrado: ${fishType}`)
      continue
    }
    
    for (const [metric, values] of Object.entries(metrics as Record<string, {
      min: number
      ideal?: number
      max: number
      unit: string
      source: string
    }>)) {
      const existing = await prisma.referenceData.findFirst({
        where: {
          speciesId: species.aquaculture.id,
          subtypeId: subtype.id,
          metric
        }
      })
      
      if (!existing) {
        await prisma.referenceData.create({
          data: {
            speciesId: species.aquaculture.id,
            subtypeId: subtype.id,
            metric,
            minValue: values.min,
            idealMinValue: values.ideal ? values.ideal * 0.95 : values.min,
            idealMaxValue: values.ideal ? values.ideal * 1.05 : values.max,
            maxValue: values.max,
            unit: values.unit,
            source: values.source
          }
        })
        count++
      }
    }
  }
  
  return count
}

// Executar seed
main()
  .catch((e) => {
    console.error('Erro fatal no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
