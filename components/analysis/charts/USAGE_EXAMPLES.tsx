/**
 * Usage Examples for Advanced Chart Components
 * 
 * This file contains practical examples of how to use each chart component
 * with agricultural/zootechnical data.
 */

import React from 'react'
import { BoxPlot, calculateBoxPlotStats, ScatterPlot, Heatmap, ViolinPlot } from './index'
import { independentTTest, oneWayANOVA } from '@/lib/statistics'

// ============================================================================
// EXAMPLE 1: Box Plot - Compare weight distributions across breeds
// ============================================================================

export function BoxPlotExample() {
  // Sample data: Animal weights by breed
  const neloreWeights = [380, 395, 410, 425, 430, 445, 450, 465, 480, 495]
  const angusWeights = [420, 435, 450, 455, 470, 485, 490, 505, 520, 535]
  const brafordWeights = [400, 415, 430, 435, 450, 465, 470, 485, 500, 515]

  const boxPlotData = [
    {
      name: 'Nelore',
      ...calculateBoxPlotStats(neloreWeights)
    },
    {
      name: 'Angus',
      ...calculateBoxPlotStats(angusWeights)
    },
    {
      name: 'Braford',
      ...calculateBoxPlotStats(brafordWeights)
    }
  ]

  // Statistical comparison
  const tTest = independentTTest(neloreWeights, angusWeights)
  
  return (
    <div className="space-y-6">
      <BoxPlot 
        data={boxPlotData}
        title="Comparação de Peso ao Abate entre Raças"
        yAxisLabel="Peso (kg)"
        height={400}
      />
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold mb-2">Análise Estatística:</h4>
        <p className="text-sm text-muted-foreground">{tTest.interpretation}</p>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Scatter Plot - Feed intake vs weight gain correlation
// ============================================================================

export function ScatterPlotExample() {
  // Sample data: Feed consumption and weight gain
  const animalData = [
    { id: 'A001', feedIntake: 8.2, weightGain: 1.1, breed: 'Nelore' },
    { id: 'A002', feedIntake: 8.5, weightGain: 1.2, breed: 'Nelore' },
    { id: 'A003', feedIntake: 7.9, weightGain: 1.0, breed: 'Nelore' },
    { id: 'A004', feedIntake: 9.1, weightGain: 1.4, breed: 'Nelore' },
    { id: 'A005', feedIntake: 8.8, weightGain: 1.3, breed: 'Nelore' },
    { id: 'B001', feedIntake: 9.2, weightGain: 1.5, breed: 'Angus' },
    { id: 'B002', feedIntake: 9.5, weightGain: 1.6, breed: 'Angus' },
    { id: 'B003', feedIntake: 8.9, weightGain: 1.4, breed: 'Angus' },
    { id: 'B004', feedIntake: 10.1, weightGain: 1.8, breed: 'Angus' },
    { id: 'B005', feedIntake: 9.8, weightGain: 1.7, breed: 'Angus' },
  ]

  const scatterData = animalData.map(animal => ({
    x: animal.feedIntake,
    y: animal.weightGain,
    name: animal.id,
    group: animal.breed
  }))

  return (
    <div>
      <ScatterPlot 
        data={scatterData}
        title="Relação entre Consumo de Ração e Ganho de Peso"
        xLabel="Consumo de Ração (kg/dia)"
        yLabel="Ganho de Peso (kg/dia)"
        showRegression={true}
        showCorrelation={true}
        height={500}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Heatmap - Correlation matrix of zootechnical variables
// ============================================================================

export function HeatmapExample() {
  // Sample data: Multiple zootechnical measurements
  const measurements = {
    'Peso Nascimento': [32, 35, 33, 36, 34, 35, 37, 33, 36, 34],
    'Peso Desmame': [180, 195, 185, 200, 190, 195, 205, 185, 200, 190],
    'Ganho Diário': [0.85, 0.95, 0.88, 1.00, 0.92, 0.95, 1.05, 0.88, 1.00, 0.92],
    'Altura Cernelha': [120, 125, 122, 128, 124, 125, 130, 122, 128, 124],
    'Perímetro Torácico': [145, 152, 148, 155, 150, 152, 158, 148, 155, 150],
  }

  return (
    <div>
      <Heatmap 
        data={measurements}
        title="Matriz de Correlação entre Características Zootécnicas"
        showValues={true}
        height={500}
      />
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold mb-2">Como Interpretar:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Células azuis: correlação positiva (variáveis aumentam juntas)</li>
          <li>Células vermelhas: correlação negativa (uma aumenta, outra diminui)</li>
          <li>Células brancas: correlação fraca ou nula</li>
          <li>Valores próximos de ±1 indicam correlação forte</li>
        </ul>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Violin Plot - Detailed distribution comparison
// ============================================================================

export function ViolinPlotExample() {
  // Sample data: Weight measurements under different treatments
  const controlWeights = [
    380, 385, 390, 395, 400, 405, 410, 415, 420, 425,
    390, 395, 400, 405, 410, 415, 420, 425, 430, 435
  ]
  
  const treatment1Weights = [
    400, 410, 415, 420, 425, 430, 435, 440, 445, 450,
    410, 415, 420, 425, 430, 435, 440, 445, 450, 455
  ]
  
  const treatment2Weights = [
    420, 430, 435, 440, 445, 450, 455, 460, 465, 470,
    430, 435, 440, 445, 450, 455, 460, 465, 470, 475
  ]

  const violinData = [
    { name: 'Controle', values: controlWeights },
    { name: 'Tratamento 1', values: treatment1Weights },
    { name: 'Tratamento 2', values: treatment2Weights },
  ]

  // Statistical comparison
  const anovaResult = oneWayANOVA([
    { name: 'Controle', values: controlWeights },
    { name: 'Tratamento 1', values: treatment1Weights },
    { name: 'Tratamento 2', values: treatment2Weights }
  ])

  return (
    <div className="space-y-6">
      <ViolinPlot 
        data={violinData}
        title="Distribuição de Peso por Tratamento Nutricional"
        yAxisLabel="Peso Vivo (kg)"
        height={500}
      />
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold mb-2">Análise de Variância (ANOVA):</h4>
        <p className="text-sm text-muted-foreground">{anovaResult.interpretation}</p>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          {anovaResult.groups.map((group, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{group.name}</p>
              <p className="text-muted-foreground">
                Média: {group.mean.toFixed(2)} kg<br />
                DP: {group.stdDev.toFixed(2)} kg<br />
                N: {group.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Combined Analysis Dashboard
// ============================================================================

export function CompleteDashboardExample() {
  const data = {
    weights: [380, 395, 410, 425, 430, 445, 450, 465, 480, 495],
    heights: [120, 122, 125, 127, 129, 131, 133, 135, 137, 140],
    feedIntake: [8.2, 8.5, 8.8, 9.1, 9.3, 9.5, 9.8, 10.1, 10.3, 10.5],
    weightGain: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9]
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Análise Completa de Desempenho</h2>
        <p className="text-muted-foreground mb-8">
          Dashboard integrado com visualizações e testes estatísticos
        </p>
      </div>

      {/* Row 1: Box Plot and Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg shadow">
          <BoxPlot 
            data={[
              { name: 'Lote 1', ...calculateBoxPlotStats(data.weights) }
            ]}
            title="Distribuição de Peso"
            yAxisLabel="Peso (kg)"
          />
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <ScatterPlot 
            data={data.feedIntake.map((feed, i) => ({
              x: feed,
              y: data.weightGain[i]
            }))}
            xLabel="Consumo (kg)"
            yLabel="Ganho (kg)"
            showRegression={true}
          />
        </div>
      </div>

      {/* Row 2: Correlation Heatmap */}
      <div className="bg-card p-6 rounded-lg shadow">
        <Heatmap 
          data={{
            'Peso': data.weights,
            'Altura': data.heights,
            'Consumo': data.feedIntake,
            'Ganho': data.weightGain
          }}
          title="Matriz de Correlação"
        />
      </div>

      {/* Statistical Summary */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resumo Estatístico</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Peso Médio</p>
            <p className="text-2xl font-bold">{(data.weights.reduce((a,b) => a+b, 0) / data.weights.length).toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ganho Médio Diário</p>
            <p className="text-2xl font-bold">{(data.weightGain.reduce((a,b) => a+b, 0) / data.weightGain.length).toFixed(2)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Consumo Médio</p>
            <p className="text-2xl font-bold">{(data.feedIntake.reduce((a,b) => a+b, 0) / data.feedIntake.length).toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Altura Média</p>
            <p className="text-2xl font-bold">{(data.heights.reduce((a,b) => a+b, 0) / data.heights.length).toFixed(1)} cm</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// How to use these examples in your pages:
// ============================================================================

/*

// In your page component (e.g., app/dashboard/analise/page.tsx):

import { BoxPlotExample, ScatterPlotExample, HeatmapExample, ViolinPlotExample } from '@/components/analysis/charts/USAGE_EXAMPLES'

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <BoxPlotExample />
      <ScatterPlotExample />
      <HeatmapExample />
      <ViolinPlotExample />
    </div>
  )
}

// Or use individual charts with your own data:

import { BoxPlot, calculateBoxPlotStats } from '@/components/analysis/charts'

const myData = [
  { name: 'Group A', ...calculateBoxPlotStats(groupAValues) },
  { name: 'Group B', ...calculateBoxPlotStats(groupBValues) }
]

<BoxPlot data={myData} title="My Analysis" />

*/
