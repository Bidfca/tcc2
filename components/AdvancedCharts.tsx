'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import { NumericStats, CategoricalStats } from '@/lib/dataAnalysis'

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
]

interface BoxPlotData {
  name: string
  fullName: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
  outliers?: number[]
}

/**
 * Gráfico BoxPlot para variáveis numéricas
 */
export function BoxPlotChart({ 
  data, 
  title 
}: { 
  data: Record<string, NumericStats>
  title?: string 
}) {
  const boxPlotData: BoxPlotData[] = Object.entries(data).map(([name, stats]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    min: stats.min,
    q1: stats.q1,
    median: stats.median,
    q3: stats.q3,
    max: stats.max,
    mean: stats.mean,
    outliers: stats.outliers
  }))

  return (
    <div>
      {title && <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={boxPlotData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload as BoxPlotData
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-gray-600">Máximo: {data.max}</p>
                    <p className="text-sm text-gray-600">Q3 (75%): {data.q3}</p>
                    <p className="text-sm text-gray-600">Mediana: {data.median}</p>
                    <p className="text-sm text-green-600 font-medium">Média: {data.mean}</p>
                    <p className="text-sm text-gray-600">Q1 (25%): {data.q1}</p>
                    <p className="text-sm text-gray-600">Mínimo: {data.min}</p>
                    {data.outliers && data.outliers.length > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Outliers: {data.outliers.length}
                      </p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          {/* Representa o box plot usando áreas empilhadas */}
          <Bar dataKey="min" stackId="a" fill="#E5E7EB" name="Mínimo" />
          <Bar dataKey={(d: BoxPlotData) => d.q1 - d.min} stackId="a" fill="#93C5FD" name="Q1" />
          <Bar dataKey={(d: BoxPlotData) => d.median - d.q1} stackId="a" fill="#3B82F6" name="Mediana" />
          <Bar dataKey={(d: BoxPlotData) => d.q3 - d.median} stackId="a" fill="#93C5FD" name="Q3" />
          <Bar dataKey={(d: BoxPlotData) => d.max - d.q3} stackId="a" fill="#E5E7EB" name="Máximo" />
          <Line type="monotone" dataKey="mean" stroke="#10B981" strokeWidth={3} name="Média" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Pizza para variáveis categóricas
 */
export function PieChartComponent({ 
  data, 
  title,
  maxSlices = 8
}: { 
  data: CategoricalStats
  title?: string
  maxSlices?: number
}) {
  const sortedData = Object.entries(data.distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSlices)
  
  const others = Object.entries(data.distribution)
    .slice(maxSlices)
    .reduce((sum, [_, count]) => sum + count, 0)
  
  const chartData = sortedData.map(([name, value]) => ({ name, value }))
  
  if (others > 0) {
    chartData.push({ name: 'Outros', value: others })
  }

  return (
    <div>
      {title && <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Dispersão (Scatter) para correlação entre duas variáveis
 */
export function ScatterPlotChart({ 
  data,
  xKey,
  yKey,
  title
}: { 
  data: any[]
  xKey: string
  yKey: string
  title?: string
}) {
  const scatterData = data
    .map(row => ({
      x: parseFloat(row[xKey]),
      y: parseFloat(row[yKey])
    }))
    .filter(point => !isNaN(point.x) && !isNaN(point.y))

  return (
    <div>
      {title && <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={xKey} />
          <YAxis type="number" dataKey="y" name={yKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name={`${xKey} vs ${yKey}`} data={scatterData} fill="#10B981" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Histograma para distribuição de variável numérica
 */
export function HistogramChart({
  data,
  variableName,
  title,
  bins = 10
}: {
  data: number[]
  variableName: string
  title?: string
  bins?: number
}) {
  const cleanData = data.filter(v => !isNaN(v) && v !== null)
  const min = Math.min(...cleanData)
  const max = Math.max(...cleanData)
  const binWidth = (max - min) / bins

  const histogram: { bin: string; count: number; range: string }[] = []
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    const count = cleanData.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length
    
    histogram.push({
      bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      range: `${binStart.toFixed(2)} a ${binEnd.toFixed(2)}`,
      count
    })
  }

  return (
    <div>
      {title && <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bin" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold text-gray-900">{data.range}</p>
                    <p className="text-sm text-gray-600">Frequência: {data.count}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#10B981" name={variableName} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de Barras Horizontal para estatísticas comparativas
 */
export function HorizontalBarChart({
  data,
  title
}: {
  data: { name: string; value: number; unit?: string }[]
  title?: string
}) {
  return (
    <div>
      {title && <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Card de Estatística Resumida
 */
export function StatCard({
  title,
  value,
  unit,
  description,
  color = 'gray'
}: {
  title: string
  value: number | string
  unit?: string
  description?: string
  color?: 'gray' | 'green' | 'blue' | 'red' | 'yellow'
}) {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-900',
    green: 'bg-green-50 text-green-900',
    blue: 'bg-blue-50 text-blue-900',
    red: 'bg-red-50 text-red-900',
    yellow: 'bg-yellow-50 text-yellow-900'
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {value} {unit && <span className="text-lg">{unit}</span>}
      </div>
      {description && (
        <div className="text-xs mt-1 opacity-75">{description}</div>
      )}
    </div>
  )
}

/**
 * Tabela de Estatísticas Detalhadas
 */
export function StatsTable({
  stats,
  title
}: {
  stats: Record<string, NumericStats>
  title?: string
}) {
  return (
    <div>
      {title && <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Variável</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">N</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Média</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mediana</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">DP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CV%</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Min</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Max</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Q1</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Q3</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {Object.entries(stats).map(([variable, stat]) => (
              <tr key={variable} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{variable}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.validCount}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.mean}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.median}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.stdDev}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.cv}%</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.min}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.max}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.q1}</td>
                <td className="px-4 py-3 text-sm text-foreground/80">{stat.q3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
