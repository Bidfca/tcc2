'use client'

import { CorrelationResult } from '@/lib/correlations/correlation-analysis'

interface CorrelationMatrixProps {
  correlations: CorrelationResult[]
  title?: string
  maxDisplay?: number
}

/**
 * Correlation Matrix Table Component
 * Displays correlations in a sortable table format
 */
export function CorrelationMatrix({
  correlations,
  title,
  maxDisplay = 20
}: CorrelationMatrixProps) {
  const sortedCorrelations = [...correlations]
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return Math.abs(b.coefficient) - Math.abs(a.coefficient)
    })
    .slice(0, maxDisplay)

  const getStrengthInfo = (strength: string) => {
    const info: Record<string, { label: string; color: string }> = {
      'very strong': { label: 'Muito Forte', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'strong': { label: 'Forte', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'moderate': { label: 'Moderada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'weak': { label: 'Fraca', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'very weak': { label: 'Muito Fraca', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
    }
    return info[strength] || info['weak']
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Crescimento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Morfometria': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Performance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Eficiência': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Produção': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Desenvolvimento': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Qualidade': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      'Condição': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Carcaça': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Reprodução': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Estrutura': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Maturidade': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      'Manejo': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Qualidade Água': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
    return colors[category] || colors['Outros']
  }

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h4>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Variável 1
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Variável 2
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                r
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                p-valor
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Força
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Relevância
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                N
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCorrelations.map((corr, index) => {
              const strengthInfo = getStrengthInfo(corr.strength)
              const categoryColor = getCategoryColor(corr.category)
              const coeffColor = corr.coefficient > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

              return (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {corr.var1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {corr.var2}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${coeffColor}`}>
                      {corr.coefficient.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    {corr.pValue.toFixed(4)}
                    {corr.significant && (
                      <span className="ml-1 text-green-600 dark:text-green-400">*</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${strengthInfo.color}`}>
                      {strengthInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                      {corr.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-sm ${
                              i < corr.relevanceScore
                                ? 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        {corr.relevanceScore}/10
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    {corr.dataPoints.length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        <p>* Correlação estatisticamente significativa (p &lt; 0.05)</p>
        <p className="mt-1">
          <strong>Relevância:</strong> Score de 1-10 baseado em importância biológica para a espécie
        </p>
      </div>
    </div>
  )
}
