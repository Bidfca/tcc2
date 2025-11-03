'use client'

/**
 * Scatter Plot Component for Correlation Visualization
 * 
 * Shows relationship between two variables with:
 * - Individual data points
 * - Optional regression line
 * - Correlation coefficient display
 * - Interactive tooltips
 */

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart
} from 'recharts'
import { pearsonCorrelation, linearRegression } from '@/lib/statistics'

export interface ScatterDataPoint {
  x: number
  y: number
  name?: string
  group?: string
}

interface ScatterPlotProps {
  data: ScatterDataPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  showRegression?: boolean
  showCorrelation?: boolean
  height?: number
  color?: string
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xLabel = 'X',
  yLabel = 'Y',
  showRegression = true,
  showCorrelation = true,
  height = 400
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)
    
    if (xValues.length < 3) {
      return null
    }
    
    try {
      const correlation = pearsonCorrelation(xValues, yValues)
      const regression = linearRegression(xValues, yValues)
      
      // Calculate regression line points
      const minX = Math.min(...xValues)
      const maxX = Math.max(...xValues)
      const regressionLine = [
        { x: minX, y: regression.slope * minX + regression.intercept },
        { x: maxX, y: regression.slope * maxX + regression.intercept }
      ]
      
      return {
        correlation,
        regression,
        regressionLine
      }
    } catch (error) {
      console.error('Error calculating statistics:', error)
      return null
    }
  }, [data])

  // Group data if groups are provided
  const groupedData = useMemo(() => {
    const groups = new Map<string, ScatterDataPoint[]>()
    
    data.forEach(point => {
      const groupName = point.group || 'default'
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(point)
    })
    
    return Array.from(groups.entries())
  }, [data])

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      )}
      
      {showCorrelation && stats && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Correlação (r):</span>{' '}
              <span className={`font-semibold ${
                Math.abs(stats.correlation.coefficient) > 0.7 
                  ? 'text-green-600 dark:text-green-400'
                  : Math.abs(stats.correlation.coefficient) > 0.4
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.correlation.coefficient.toFixed(3)}
              </span>
              <span className="text-muted-foreground ml-2">
                ({stats.correlation.strength})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">R²:</span>{' '}
              <span className="font-semibold text-foreground">
                {stats.regression.rSquared.toFixed(3)}
              </span>
              <span className="text-muted-foreground ml-2">
                ({(stats.regression.rSquared * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          {showRegression && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{stats.regression.equation}</span>
            </p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number"
            dataKey="x"
            name={xLabel}
            label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
            className="text-sm text-muted-foreground"
          />
          <YAxis 
            type="number"
            dataKey="y"
            name={yLabel}
            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
            className="text-sm text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null
              
              const point = payload[0].payload
              
              return (
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                  {point.name && (
                    <p className="font-semibold text-foreground mb-2">{point.name}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {xLabel}: <span className="font-medium text-foreground">{point.x.toFixed(2)}</span>
                    </p>
                    <p className="text-muted-foreground">
                      {yLabel}: <span className="font-medium text-foreground">{point.y.toFixed(2)}</span>
                    </p>
                    {point.group && (
                      <p className="text-muted-foreground">
                        Grupo: <span className="font-medium text-foreground">{point.group}</span>
                      </p>
                    )}
                  </div>
                </div>
              )
            }}
          />
          <Legend />
          
          {/* Data points */}
          {groupedData.map(([groupName, points], index) => (
            <Scatter
              key={groupName}
              name={groupName === 'default' ? 'Dados' : groupName}
              data={points}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
            />
          ))}
          
          {/* Regression line */}
          {showRegression && stats && (
            <Line
              type="monotone"
              dataKey="y"
              data={stats.regressionLine}
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Regressão Linear"
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      {stats && stats.correlation.significant && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          ✓ Correlação estatisticamente significativa (p &lt; 0.05)
        </div>
      )}
    </div>
  )
}

export default ScatterPlot
