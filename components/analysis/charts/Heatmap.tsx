'use client'

/**
 * Heatmap Component for Correlation Matrices
 * 
 * Visualizes correlation matrices with:
 * - Color-coded correlation values
 * - Interactive cells with tooltips
 * - Annotations with correlation coefficients
 * - Color scale legend
 */

import React, { useMemo } from 'react'
import { pearsonCorrelation } from '@/lib/statistics'

export interface HeatmapData {
  variables: string[]
  matrix: number[][] // Correlation matrix
}

interface HeatmapProps {
  data: Record<string, number[]> // Variable name -> values
  title?: string
  height?: number
  showValues?: boolean
}

/**
 * Calculate correlation matrix from multiple variables
 */
function calculateCorrelationMatrix(data: Record<string, number[]>): HeatmapData {
  const variables = Object.keys(data)
  const n = variables.length
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1 // Perfect correlation with itself
      } else {
        try {
          const result = pearsonCorrelation(data[variables[i]], data[variables[j]])
          matrix[i][j] = result.coefficient
        } catch {
          matrix[i][j] = 0
        }
      }
    }
  }
  
  return { variables, matrix }
}

/**
 * Get color based on correlation value
 */
function getCorrelationColor(value: number): string {
  if (value >= 0) {
    // Positive correlation: white to blue
    const intensity = Math.floor(value * 255)
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`
  } else {
    // Negative correlation: white to red
    const intensity = Math.floor(Math.abs(value) * 255)
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`
  }
}

/**
 * Get text color for readability
 */
function getTextColor(value: number): string {
  return Math.abs(value) > 0.5 ? 'white' : 'black'
}

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  title,
  showValues = true
}) => {
  const heatmapData = useMemo(() => calculateCorrelationMatrix(data), [data])
  
  const { variables, matrix } = heatmapData
  const cellSize = Math.min(80, 600 / variables.length)

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      
      {/* Color Legend */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="text-muted-foreground font-medium">Correlação:</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 rounded" style={{ background: 'linear-gradient(to right, rgb(255,100,100), rgb(255,255,255), rgb(100,100,255))' }}></div>
          <span className="text-muted-foreground">-1.0</span>
          <span className="text-muted-foreground mx-2">0</span>
          <span className="text-muted-foreground">+1.0</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2"></th>
                {variables.map((variable, i) => (
                  <th 
                    key={i}
                    className="p-2 text-xs font-medium text-muted-foreground"
                    style={{ 
                      width: cellSize,
                      maxWidth: cellSize,
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'left bottom'
                    }}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={variable}>
                      {variable}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variables.map((rowVar, i) => (
                <tr key={i}>
                  <td className="p-2 text-xs font-medium text-muted-foreground sticky left-0 bg-background">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" title={rowVar}>
                      {rowVar}
                    </div>
                  </td>
                  {variables.map((colVar, j) => {
                    const value = matrix[i][j]
                    const bgColor = getCorrelationColor(value)
                    const textColor = getTextColor(value)
                    
                    return (
                      <td
                        key={j}
                        className="border border-border text-center transition-all hover:ring-2 hover:ring-primary cursor-pointer"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                        title={`${rowVar} × ${colVar}: ${value.toFixed(3)}`}
                      >
                        {showValues && (
                          <div className="text-xs font-semibold">
                            {value.toFixed(2)}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Correlação de Pearson:</strong> Valores próximos de +1 indicam forte correlação positiva, 
          valores próximos de -1 indicam forte correlação negativa, e valores próximos de 0 indicam correlação fraca.
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(100,100,255)' }}></div>
            <span>Forte positiva (&gt; 0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(180,180,255)' }}></div>
            <span>Moderada positiva (0.4 - 0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-border"></div>
            <span>Fraca (0 - 0.4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255,180,180)' }}></div>
            <span>Moderada negativa (-0.4 - -0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255,100,100)' }}></div>
            <span>Forte negativa (&lt; -0.7)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Heatmap
