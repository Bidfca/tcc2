'use client'

/**
 * Violin Plot Component for Detailed Distribution Visualization
 * 
 * Combines box plot with kernel density estimation showing:
 * - Full distribution shape
 * - Quartiles and median
 * - Data density at different values
 * - Comparison across groups
 */

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

export interface ViolinPlotData {
  name: string
  values: number[]
  color?: string
}

interface ViolinPlotProps {
  data: ViolinPlotData[]
  title?: string
  yAxisLabel?: string
  height?: number
}

/**
 * Calculate kernel density estimation for smooth distribution curve
 */
function calculateKDE(values: number[], bandwidth?: number): { x: number; density: number }[] {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const range = max - min
  
  // Auto-calculate bandwidth if not provided (Silverman's rule of thumb)
  if (!bandwidth) {
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - values.reduce((s, x) => s + x, 0) / n, 2), 0) / n
    )
    bandwidth = 1.06 * stdDev * Math.pow(n, -1/5)
  }
  
  // Generate points along the range
  const points = 50
  const step = range / (points - 1)
  const kde: { x: number; density: number }[] = []
  
  for (let i = 0; i < points; i++) {
    const x = min + i * step
    let density = 0
    
    // Gaussian kernel
    for (const value of values) {
      const u = (x - value) / bandwidth
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
    }
    
    density = density / (n * bandwidth)
    kde.push({ x, density })
  }
  
  return kde
}

/**
 * Calculate statistics for violin plot
 */
function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  return {
    min: sorted[0],
    q1: sorted[Math.floor(n * 0.25)],
    median: sorted[Math.floor(n * 0.5)],
    q3: sorted[Math.floor(n * 0.75)],
    max: sorted[n - 1],
    mean: values.reduce((sum, v) => sum + v, 0) / n
  }
}

export const ViolinPlot: React.FC<ViolinPlotProps> = ({
  data,
  title,
  yAxisLabel,
  height = 500
}) => {
  // Process data for each group
  const processedData = useMemo(() => {
    return data.map((group, index) => {
      const kde = calculateKDE(group.values)
      const stats = calculateStats(group.values)
      
      // Normalize density to width
      const maxDensity = Math.max(...kde.map(d => d.density))
      const normalizedKDE = kde.map(d => ({
        ...d,
        densityLeft: -d.density / maxDensity * 0.4,
        densityRight: d.density / maxDensity * 0.4
      }))
      
      return {
        name: group.name,
        kde: normalizedKDE,
        stats,
        color: group.color || `hsl(${index * 360 / data.length}, 70%, 50%)`
      }
    })
  }, [data])

  // Prepare chart data
  const chartData = useMemo(() => {
    const allKDEPoints = processedData.flatMap(g => g.kde.map(k => k.x))
    const minY = Math.min(...allKDEPoints)
    const maxY = Math.max(...allKDEPoints)
    const points = 100
    const step = (maxY - minY) / (points - 1)
    
    const result: Array<Record<string, number>> = []
    for (let i = 0; i < points; i++) {
      const y = minY + i * step
      const point: Record<string, number> = { y }
      
      processedData.forEach((group, index) => {
        // Find closest KDE point
        const closest = group.kde.reduce((prev, curr) => 
          Math.abs(curr.x - y) < Math.abs(prev.x - y) ? curr : prev
        )
        point[`${group.name}_left`] = closest.densityLeft + index
        point[`${group.name}_right`] = closest.densityRight + index
        point[`${group.name}_median`] = index
      })
      
      result.push(point)
    }
    
    return result
  }, [processedData])

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      
      {/* Statistics summary */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {processedData.map((group, index) => (
          <div key={index} className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">{group.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Mediana:</span>
                <div className="font-semibold text-foreground">{group.stats.median.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Média:</span>
                <div className="font-semibold text-foreground">{group.stats.mean.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Q1:</span>
                <div className="font-medium text-foreground">{group.stats.q1.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Q3:</span>
                <div className="font-medium text-foreground">{group.stats.q3.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number"
            domain={[0, data.length]}
            ticks={data.map((_, i) => i + 0.5)}
            tickFormatter={(value) => {
              const index = Math.floor(value)
              return index >= 0 && index < data.length ? data[index].name : ''
            }}
            className="text-sm text-muted-foreground"
          />
          <YAxis 
            type="number"
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            className="text-sm text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null
              
              const y = payload[0].payload.y
              
              return (
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                  <p className="font-semibold text-foreground mb-2">Valor: {y.toFixed(2)}</p>
                  <div className="space-y-1 text-sm">
                    {processedData.map((group, index) => {
                      const kde = group.kde.find(k => Math.abs(k.x - y) < 0.5)
                      if (!kde) return null
                      
                      return (
                        <p key={index} className="text-muted-foreground">
                          {group.name}:{' '}
                          <span className="font-medium text-foreground">
                            densidade {(kde.density * 100).toFixed(1)}%
                          </span>
                        </p>
                      )
                    })}
                  </div>
                </div>
              )
            }}
          />
          <Legend />
          
          {/* Violin shapes */}
          {processedData.map((group, index) => (
            <Area
              key={`violin-${index}`}
              type="monotone"
              dataKey={`${group.name}_right`}
              fill={colors[index % colors.length]}
              fillOpacity={0.4}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={group.name}
            />
          ))}
          
          {/* Median lines */}
          {processedData.map((group, index) => (
            <Line
              key={`median-${index}`}
              type="monotone"
              dataKey={`${group.name}_median`}
              stroke="#000"
              strokeWidth={2}
              dot={false}
              name={`${group.name} mediana`}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Violin Plot:</strong> A largura de cada &quot;violino&quot; representa a densidade dos dados naquela região. 
          Regiões mais largas indicam onde há mais observações. A linha preta central marca a mediana.
        </p>
      </div>
    </div>
  )
}

export default ViolinPlot
