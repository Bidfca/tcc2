'use client'

/**
 * Box Plot Component for Distribution Analysis
 * 
 * Visualizes data distribution showing:
 * - Median (middle line)
 * - Quartiles (box boundaries)
 * - Min/Max (whiskers)
 * - Outliers (individual points)
 * 
 * Perfect for comparing distributions across groups
 */

import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'

export interface BoxPlotData {
  name: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers?: number[]
  mean?: number
}

interface BoxPlotProps {
  data: BoxPlotData[]
  title?: string
  yAxisLabel?: string
  height?: number
  color?: string
}

/**
 * Calculate box plot statistics from raw data
 */
export function calculateBoxPlotStats(values: number[]): Omit<BoxPlotData, 'name'> {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  const q1 = sorted[Math.floor(n * 0.25)]
  const median = sorted[Math.floor(n * 0.5)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1
  
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr
  
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence)
  const withinFence = sorted.filter(v => v >= lowerFence && v <= upperFence)
  
  const min = withinFence[0]
  const max = withinFence[withinFence.length - 1]
  const mean = values.reduce((sum, v) => sum + v, 0) / n
  
  return { min, q1, median, q3, max, outliers, mean }
}

export const BoxPlot: React.FC<BoxPlotProps> = ({
  data,
  title,
  yAxisLabel,
  height = 400,
  color = '#3b82f6'
}) => {
  // Transform data for visualization
  const chartData = data.map(item => ({
    name: item.name,
    // Whiskers
    whiskerLower: [item.min, item.q1],
    whiskerUpper: [item.q3, item.max],
    // Box
    boxLower: item.q1,
    boxHeight: item.q3 - item.q1,
    // Median line
    median: item.median,
    // Mean marker
    mean: item.mean,
  }))

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-sm text-muted-foreground"
          />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            className="text-sm text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null
              
              const dataPoint = data[payload[0].payload.name]
              if (!dataPoint) return null
              
              return (
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                  <p className="font-semibold text-foreground mb-2">{payload[0].payload.name}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Máximo: <span className="font-medium text-foreground">{dataPoint.max.toFixed(2)}</span></p>
                    <p className="text-muted-foreground">Q3 (75%): <span className="font-medium text-foreground">{dataPoint.q3.toFixed(2)}</span></p>
                    <p className="text-muted-foreground">Mediana: <span className="font-semibold text-foreground">{dataPoint.median.toFixed(2)}</span></p>
                    <p className="text-muted-foreground">Q1 (25%): <span className="font-medium text-foreground">{dataPoint.q1.toFixed(2)}</span></p>
                    <p className="text-muted-foreground">Mínimo: <span className="font-medium text-foreground">{dataPoint.min.toFixed(2)}</span></p>
                    {dataPoint.mean && (
                      <p className="text-muted-foreground mt-2">Média: <span className="font-medium text-foreground">{dataPoint.mean.toFixed(2)}</span></p>
                    )}
                    {dataPoint.outliers && dataPoint.outliers.length > 0 && (
                      <p className="text-amber-600 dark:text-amber-400 mt-2">
                        {dataPoint.outliers.length} outlier(s)
                      </p>
                    )}
                  </div>
                </div>
              )
            }}
          />
          <Legend />
          
          {/* Box (interquartile range) */}
          <Bar
            dataKey="boxHeight"
            fill={color}
            fillOpacity={0.6}
            stackId="box"
            name="IQR (Q1-Q3)"
          />
          
          {/* Median line */}
          <ReferenceLine
            y={0}
            stroke="#ef4444"
            strokeWidth={2}
            label="Mediana"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Box Plot:</strong> A caixa representa 50% dos dados (Q1 a Q3). 
          A linha dentro da caixa é a mediana. Os whiskers mostram o alcance dos dados (excluindo outliers).
        </p>
      </div>
    </div>
  )
}

export default BoxPlot
