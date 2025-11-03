'use client'

import { Table } from 'lucide-react'

interface CSVPreviewProps {
  data: Record<string, unknown>[]
  filename: string
}

export function CSVPreview({ data }: CSVPreviewProps) {
  if (!data || data.length === 0) {
    return null
  }

  // Pegar primeiras 10 linhas
  const previewData = data.slice(0, 10)
  
  // Pegar todas as colunas
  const columns = Object.keys(previewData[0] || {})
  
  // Detectar tipos de colunas
  const columnTypes = columns.map(col => {
    const values = previewData.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '')
    if (values.length === 0) return 'empty'
    
    const numericValues = values.filter(v => !isNaN(Number(v)))
    if (numericValues.length === values.length) return 'numeric'
    
    return 'text'
  })

  return (
    <div className="mt-4 bg-card rounded-lg border border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Table className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Preview do Arquivo</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando 10 de {data.length.toLocaleString()} linhas
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4 text-sm">
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{columns.length}</span> colunas detectadas
        </div>
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{data.length.toLocaleString()}</span> linhas totais
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-foreground border-r border">#</th>
              {columns.map((col, idx) => (
                <th key={col} className="px-4 py-2 text-left font-medium text-foreground border-r border last:border-r-0">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px]" title={col}>{col}</span>
                    <span className={`text-xs font-normal ${
                      columnTypes[idx] === 'numeric' ? 'text-blue-600 dark:text-blue-400' : 
                      columnTypes[idx] === 'text' ? 'text-purple-600 dark:text-purple-400' :
                      'text-gray-400'
                    }`}>
                      {columnTypes[idx] === 'numeric' ? '123' : 
                       columnTypes[idx] === 'text' ? 'ABC' : 
                       '∅'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2 text-muted-foreground font-medium border-r border">{rowIdx + 1}</td>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-foreground/80 border-r border last:border-r-0">
                    <div className="truncate max-w-[200px]" title={String(row[col])}>
                      {row[col] !== null && row[col] !== undefined && row[col] !== '' 
                        ? String(row[col]) 
                        : <span className="text-muted-foreground italic">vazio</span>
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="mt-3 text-center text-sm text-muted-foreground">
          + {(data.length - 10).toLocaleString()} linhas não mostradas
        </div>
      )}
    </div>
  )
}
