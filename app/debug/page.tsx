'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  Sprout, 
  ArrowLeft, 
  Database, 
  User, 
  Key, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: string;
    message: string;
    details: unknown;
  }>>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const results = []

    // Teste 1: Verificar banco de dados
    try {
      const dbResponse = await fetch('/api/test')
      const dbData = await dbResponse.json()
      results.push({
        test: 'Conexão com Banco de Dados',
        status: dbResponse.ok ? 'success' : 'error',
        message: dbResponse.ok ? 'Conectado' : 'Erro na conexão',
        details: dbData
      })
    } catch (error) {
      results.push({
        test: 'Conexão com Banco de Dados',
        status: 'error',
        message: 'Falha na conexão',
        details: error
      })
    }

    // Teste 2: Verificar autenticação
    try {
      const authResponse = await fetch('/api/auth/session')
      const authData = await authResponse.json()
      results.push({
        test: 'Sistema de Autenticação',
        status: authResponse.ok ? 'success' : 'error',
        message: authResponse.ok ? 'Funcionando' : 'Erro no NextAuth',
        details: authData
      })
    } catch (error) {
      results.push({
        test: 'Sistema de Autenticação',
        status: 'error',
        message: 'Falha no NextAuth',
        details: error
      })
    }

    // Teste 3: Verificar APIs principais
    const apiEndpoints = [
      '/api/analise/resultados',
      '/api/referencias/saved',
      '/api/referencias/search'
    ]

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: endpoint.includes('search') ? 'POST' : 'GET',
          headers: endpoint.includes('search') ? { 'Content-Type': 'application/json' } : {},
          body: endpoint.includes('search') ? JSON.stringify({ query: 'test', source: 'all' }) : undefined
        })
        
        results.push({
          test: `API ${endpoint}`,
          status: response.status < 500 ? 'success' : 'error',
          message: `Status: ${response.status}`,
          details: { status: response.status, ok: response.ok }
        })
      } catch (error) {
        results.push({
          test: `API ${endpoint}`,
          status: 'error',
          message: 'Falha na requisição',
          details: error
        })
      }
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const testLogin = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'researcher@agroinsight.com',
        password: 'user123',
        redirect: false
      })
      
      alert(`Resultado do login: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      alert(`Erro no login: ${error}`)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página de Debug</h1>
          <p className="text-gray-600">Esta página só está disponível em desenvolvimento.</p>
          <Link href="/" className="mt-4 inline-block text-green-600 hover:text-green-700">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">AgroInsight Debug</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Página de Debug e Testes</h1>

          {/* Status da Sessão */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Status da Sessão
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Status</div>
                <div className={`font-medium ${
                  status === 'authenticated' ? 'text-green-600' : 
                  status === 'loading' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {status}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{session?.user?.email || 'N/A'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Papel</div>
                <div className="font-medium">{session?.user?.role || 'N/A'}</div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-4">
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Testar Login
              </button>
              {session && (
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Fazer Logout
                </button>
              )}
            </div>
          </div>

          {/* Testes do Sistema */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Testes do Sistema
              </h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Executando...' : 'Executar Testes'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border ${
                      result.status === 'success' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <span className={`text-sm ${
                        result.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.message}
                      </span>
                    </div>
                    {result.details !== undefined && result.details !== null && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links Úteis */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Links Úteis para Debug
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/api/test"
                target="_blank"
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 block"
              >
                <div className="font-medium">API de Teste</div>
                <div className="text-sm text-gray-600">/api/test</div>
              </Link>
              <Link
                href="/api/auth/session"
                target="_blank"
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 block"
              >
                <div className="font-medium">Sessão Atual</div>
                <div className="text-sm text-gray-600">/api/auth/session</div>
              </Link>
              <Link
                href="/auth/signin"
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 block"
              >
                <div className="font-medium">Página de Login</div>
                <div className="text-sm text-gray-600">/auth/signin</div>
              </Link>
              <Link
                href="/dashboard"
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 block"
              >
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-gray-600">/dashboard</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
