# Reference Data Coverage Report

Generated: 2025-11-05T15:49:07.823Z

## Summary

- **Total Species**: 6
- **Total Subtypes Expected**: 20
- **Subtypes with Data**: 14
- **Coverage**: 70.0%
- **Total Metrics**: 96

## Detailed Coverage by Species

### Bovine

- **Coverage**: 2/3 subtypes
- **⚠️ Missing Subtypes**: dual

#### dairy

- **Metrics Count**: 8
- **Sources**: NRC Dairy Cattle 2016
- **Metrics**: peso_nascimento, producao_leite, proteina_leite, gordura_leite, celulas_somaticas, escore_corporal, dias_lactacao, intervalo_partos

#### beef

- **Metrics Count**: 8
- **Sources**: NRC Beef Cattle 2016
- **Metrics**: peso_nascimento, peso_desmame, gpd, rendimento_carcaca, area_olho_lombo, espessura_gordura, marmoreiro, conversao_alimentar

### Swine

- **Coverage**: 4/4 subtypes

#### nursery

- **Metrics Count**: 5
- **Sources**: NRC Swine 2012
- **❌ Missing Critical Metrics**: gpd, conversao, mortalidade
- **Metrics**: peso_desmame, peso_saida_creche, gpd_creche, conversao_creche, mortalidade_creche

#### growing

- **Metrics Count**: 4
- **Sources**: NRC Swine 2012
- **❌ Missing Critical Metrics**: mortalidade
- **Metrics**: peso_inicial, peso_final, gpd, conversao

#### finishing

- **Metrics Count**: 7
- **Sources**: NRC Swine 2012
- **❌ Missing Critical Metrics**: mortalidade
- **Metrics**: peso_inicial, peso_abate, gpd, conversao, espessura_toucinho, carne_magra, profundidade_lombo

#### breeding

- **Metrics Count**: 6
- **Sources**: NRC Swine 2012
- **❌ Missing Critical Metrics**: gpd, conversao, mortalidade
- **Metrics**: leitoes_nascidos_vivos, leitoes_desmamados, peso_medio_nascimento, intervalo_desmame_cio, taxa_concepcao, partos_porca_ano

### Poultry

- **Coverage**: 2/3 subtypes
- **⚠️ Missing Subtypes**: breeder

#### broiler

- **Metrics Count**: 10
- **Sources**: NRC Poultry 1994
- **Metrics**: peso_7d, peso_21d, peso_35d, peso_42d, gpd_total, conversao_alimentar, mortalidade, iep, rendimento_carcaca, rendimento_peito

#### layer

- **Metrics Count**: 7
- **Sources**: NRC Poultry 1994
- **Metrics**: idade_inicio_postura, pico_postura, producao_ovos, peso_ovo, conversao_duzia, massa_ovos, mortalidade

### Sheep

- **Coverage**: 1/3 subtypes
- **⚠️ Missing Subtypes**: wool, milk

#### meat

- **Metrics Count**: 9
- **Sources**: EMBRAPA Caprinos e Ovinos 2023
- **Metrics**: peso_nascimento, gpd_cria, peso_desmame, peso_abate, rendimento_carcaca, prolificidade, intervalo_partos, mortalidade_cria, escore_corporal

### Goat

- **Coverage**: 1/3 subtypes
- **⚠️ Missing Subtypes**: milk, skin

#### meat

- **Metrics Count**: 9
- **Sources**: EMBRAPA Caprinos e Ovinos 2023
- **❌ Missing Critical Metrics**: rendimento_carcaca
- **Metrics**: peso_nascimento, gpd_cria, peso_desmame, peso_abate, producao_leite, gordura_leite, proteina_leite, prolificidade, intervalo_partos

### Aquaculture

- **Coverage**: 4/4 subtypes

#### tilapia

- **Metrics Count**: 10
- **Sources**: EMBRAPA Pesca e Aquicultura 2023
- **❌ Missing Critical Metrics**: densidade_estocagem
- **Metrics**: densidade_estocagem_intensivo, densidade_estocagem_semi, conversao_alimentar, oxigenio_dissolvido, temperatura, ph, amonia_total, gpd, peso_abate, sobrevivencia

#### tambaqui

- **Metrics Count**: 7
- **Sources**: EMBRAPA Pesca e Aquicultura 2023
- **Metrics**: densidade_estocagem, conversao_alimentar, gpd, peso_abate, temperatura, oxigenio_dissolvido, sobrevivencia

#### pintado

- **Metrics Count**: 3
- **Sources**: EMBRAPA Pesca e Aquicultura 2023
- **❌ Missing Critical Metrics**: gpd, sobrevivencia
- **Metrics**: densidade_estocagem, conversao_alimentar, peso_abate

#### pacu

- **Metrics Count**: 3
- **Sources**: EMBRAPA Pesca e Aquicultura 2023
- **❌ Missing Critical Metrics**: gpd, sobrevivencia
- **Metrics**: densidade_estocagem, conversao_alimentar, peso_abate

## Gaps and Recommendations

### High Priority

- **bovine**: Add data for dual subtypes
- **swine/nursery**: Add critical metrics: gpd, conversao, mortalidade
- **swine/growing**: Add critical metrics: mortalidade
- **swine/growing**: Only 4 metrics (expand to at least 7-10)
- **swine/finishing**: Add critical metrics: mortalidade
- **swine/breeding**: Add critical metrics: gpd, conversao, mortalidade
- **poultry**: Add data for breeder subtypes
- **sheep**: Add data for wool, milk subtypes
- **goat**: Add data for milk, skin subtypes
- **goat/meat**: Add critical metrics: rendimento_carcaca
- **aquaculture/tilapia**: Add critical metrics: densidade_estocagem
- **aquaculture/pintado**: Add critical metrics: gpd, sobrevivencia
- **aquaculture/pintado**: Only 3 metrics (expand to at least 7-10)
- **aquaculture/pacu**: Add critical metrics: gpd, sobrevivencia
- **aquaculture/pacu**: Only 3 metrics (expand to at least 7-10)

### Medium Priority

- Add phase-specific metrics (cria, recria, terminação) for sheep and goat
- Expand water quality metrics for aquaculture
- Add seasonal variations for forage data

### Low Priority

- Add secondary quality metrics (marbling, tenderness, etc.)
- Expand reproductive metrics for all species
- Add economic indicators (feed cost, market price ranges)

