'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react'

interface DiagnosticCheck {
  id: string
  name: string
  status: 'checking' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export default function ErrorDiagnostic() {
  const { data: session, status } = useSession()
  const [checks, setChecks] = useState<DiagnosticCheck[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticCheck[] = [
      {
        id: 'session',
        name: 'Verificação de Sessão',
        status: 'checking',
        message: 'Verificando status da sessão...'
      },
      {
        id: 'database',
        name: 'Conexão com Banco de Dados',
        status: 'checking',
        message: 'Testando conexão com o banco...'
      },
      {
        id: 'api',
        name: 'APIs Funcionais',
        status: 'checking',
        message: 'Verificando endpoints da API...'
      },
      {
        id: 'auth',
        name: 'Sistema de Autenticação',
        status: 'checking',
        message: 'Testando NextAuth.js...'
      }
    ]

    setChecks([...diagnostics])

    // Verificar sessão
    await new Promise(resolve => setTimeout(resolve, 1000))
    diagnostics[0] = {
      ...diagnostics[0],
      status: status === 'authenticated' ? 'success' : status === 'loading' ? 'warning' : 'error',
      message: status === 'authenticated' 
        ? `Sessão ativa: ${session?.user?.email}` 
        : status === 'loading' 
        ? 'Carregando sessão...' 
        : 'Nenhuma sessão ativa',
      details: status === 'authenticated' ? `Papel: ${session?.user?.role}` : undefined
    }
    setChecks([...diagnostics])

    // Verificar banco de dados
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      const dbResponse = await fetch('/api/test')
      const dbData = await dbResponse.json()
      
      diagnostics[1] = {
        ...diagnostics[1],
        status: dbResponse.ok ? 'success' : 'error',
        message: dbResponse.ok ? 'Banco de dados conectado' : 'Erro na conexão com banco',
        details: dbResponse.ok ? `${dbData.data?.users || 0} usuários, ${dbData.data?.projects || 0} projetos` : dbData.error
      }
    } catch (error) {
      diagnostics[1] = {
        ...diagnostics[1],
        status: 'error',
        message: 'Erro ao conectar com banco de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
    setChecks([...diagnostics])

    // Verificar APIs
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      const apiChecks = [
        '/api/auth/session',
        '/api/analise/resultados',
        '/api/referencias/saved'
      ]
      
      const apiResults = await Promise.allSettled(
        apiChecks.map(endpoint => fetch(endpoint))
      )
      
      const successCount = apiResults.filter(result => 
        result.status === 'fulfilled' && result.value.status < 500
      ).length
      
      diagnostics[2] = {
        ...diagnostics[2],
        status: successCount === apiChecks.length ? 'success' : successCount > 0 ? 'warning' : 'error',
        message: `${successCount}/${apiChecks.length} APIs funcionando`,
        details: apiResults.map((result, index) => 
          `${apiChecks[index]}: ${result.status === 'fulfilled' ? result.value.status : 'erro'}`
        ).join(', ')
      }
    } catch (error) {
      diagnostics[2] = {
        ...diagnostics[2],
        status: 'error',
        message: 'Erro ao verificar APIs',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
    setChecks([...diagnostics])

    // Verificar autenticação
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      const authResponse = await fetch('/api/auth/session')
      await authResponse.json()
      
      diagnostics[3] = {
        ...diagnostics[3],
        status: authResponse.ok ? 'success' : 'error',
        message: authResponse.ok ? 'NextAuth.js funcionando' : 'Erro no NextAuth.js',
        details: authResponse.ok ? 'Sistema de autenticação operacional' : 'Verifique configuração do NextAuth'
      }
    } catch (error) {
      diagnostics[3] = {
        ...diagnostics[3],
        status: 'error',
        message: 'Erro no sistema de autenticação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
    
    setChecks([...diagnostics])
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null // Não mostrar em produção
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium text-gray-900">Diagnóstico do Sistema</h3>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`p-2 border rounded ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(check.status)}
                <span className="ml-2 text-sm font-medium">{check.name}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{check.message}</p>
            {check.details && (
              <p className="text-xs text-gray-500 mt-1 font-mono">{check.details}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Última verificação: {new Date().toLocaleTimeString('pt-BR')}
      </div>
    </div>
  )
}
