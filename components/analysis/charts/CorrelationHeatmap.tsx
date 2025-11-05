'use client'

interface CorrelationHeatmapProps {
  correlations: Array<{
    var1: string
    var2: string
    coefficient: number
    significant: boolean
    relevanceScore: number
  }>
  title?: string
}

/**
 * Correlation Heatmap Component
 * Displays correlation matrix as a color-coded heatmap
 */
export function CorrelationHeatmap({ correlations, title }: CorrelationHeatmapProps) {
  const variables = Array.from(
    new Set([
      ...correlations.map(c => c.var1),
      ...correlations.map(c => c.var2)
    ])
  ).sort()

  const matrix: Record<string, Record<string, number>> = {}
  for (const v of variables) {
    matrix[v] = {}
    for (const w of variables) {
      if (v === w) {
        matrix[v][w] = 1.0
      } else {
        matrix[v][w] = 0
      }
    }
  }

  for (const corr of correlations) {
    matrix[corr.var1][corr.var2] = corr.coefficient
    matrix[corr.var2][corr.var1] = corr.coefficient
  }

  const getColor = (value: number, significant: boolean = true) => {
    if (value === 1.0) return '#E5E7EB' // Diagonal (self-correlation)
    
    const absValue = Math.abs(value)
    
    if (!significant) {
      return '#F3F4F6' // Light gray for non-significant
    }
    
    if (value > 0) {
      if (absValue >= 0.7) return '#065F46' // Dark green
      if (absValue >= 0.5) return '#059669' // Green
      if (absValue >= 0.3) return '#10B981' // Light green
      return '#6EE7B7' // Very light green
    } else {
      if (absValue >= 0.7) return '#991B1B' // Dark red
      if (absValue >= 0.5) return '#DC2626' // Red
      if (absValue >= 0.3) return '#EF4444' // Light red
      return '#FCA5A5' // Very light red
    }
  }

  const isSignificant = (var1: string, var2: string): boolean => {
    const corr = correlations.find(
      c => (c.var1 === var1 && c.var2 === var2) || (c.var1 === var2 && c.var2 === var1)
    )
    return corr?.significant || false
  }

  const cellSize = Math.min(60, Math.max(30, 600 / variables.length))

  return (
    <div className="w-full">
      {title && <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h4>}
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-1"></th>
                {variables.map((v, i) => (
                  <th
                    key={i}
                    className="p-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    style={{ 
                      width: cellSize,
                      maxWidth: cellSize,
                      minWidth: cellSize
                    }}
                  >
                    <div
                      className="transform -rotate-45 origin-left whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: cellSize * 1.5 }}
                      title={v}
                    >
                      {v.length > 12 ? v.substring(0, 12) + '...' : v}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variables.map((rowVar, i) => (
                <tr key={i}>
                  <td className="p-1 text-xs font-medium text-gray-700 dark:text-gray-300 text-right pr-2 whitespace-nowrap">
                    <div className="overflow-hidden text-ellipsis" title={rowVar}>
                      {rowVar.length > 15 ? rowVar.substring(0, 15) + '...' : rowVar}
                    </div>
                  </td>
                  {variables.map((colVar, j) => {
                    const value = matrix[rowVar][colVar]
                    const significant = isSignificant(rowVar, colVar)
                    const color = getColor(value, significant)
                    
                    return (
                      <td
                        key={j}
                        className="p-0 border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: color,
                          width: cellSize,
                          height: cellSize,
                          minWidth: cellSize,
                          minHeight: cellSize
                        }}
                        title={`${rowVar} vs ${colVar}\nr = ${value.toFixed(3)}${significant ? ' *' : ''}`}
                      >
                        <div className="flex items-center justify-center h-full text-xs font-medium text-white">
                          {value !== 0 && value !== 1 ? value.toFixed(2) : ''}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: '#065F46' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Forte Positiva (r &gt; 0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Moderada Positiva</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: '#F3F4F6' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Fraca/Não Sig.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: '#EF4444' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Moderada Negativa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: '#991B1B' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Forte Negativa (r &lt; -0.7)</span>
        </div>
      </div>
    </div>
  )
}
