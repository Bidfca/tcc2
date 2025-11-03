'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react'
import ErrorDiagnostic from '@/components/debug/error-diagnostic'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Tentando fazer login...', { email })
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('🔐 Resultado do login:', result)

      if (result?.error) {
        // Mapear códigos de erro para mensagens amigáveis
        const errorMessages: Record<string, string> = {
          'AUTH-001': 'Email ou senha incorretos. Verifique suas credenciais.',
          'AUTH-002': 'Usuário não encontrado. Verifique o email informado.',
          'AUTH-003': 'Senha incorreta. Tente novamente.',
          'VAL-001': 'Email e senha são obrigatórios.',
          'CredentialsSignin': 'Email ou senha incorretos. Verifique suas credenciais.'
        }
        
        const errorMessage = errorMessages[result.error] || 'Erro ao fazer login. Tente novamente.'
        setError(`[${result.error}] ${errorMessage}`)
        console.error('❌ Erro de login:', result.error)
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido, redirecionando...')
        
        // Aguardar um pouco para garantir que a sessão foi criada
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          const session = await getSession()
          console.log('👤 Sessão obtida:', session)
          
          if (session?.user?.role === 'ADMIN') {
            console.log('🔧 Redirecionando para admin...')
            router.push('/dashboard') // Por enquanto, redirecionar para dashboard
          } else {
            console.log('👤 Redirecionando para dashboard...')
            router.push('/dashboard')
          }
        } catch (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError)
          setError('[AUTH-010] Erro ao redirecionar após login. Tente acessar o dashboard diretamente.')
        }
      } else {
        console.error('❌ Resultado inesperado:', result)
        setError('[AUTH-001] Erro inesperado no login. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro geral no login:', error)
      setError('[API-005] Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Home
            </Link>
          </div>
          <div className="flex justify-center">
            <Sprout className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Entrar no AgroInsight
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Ou{' '}
            <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
              criar uma nova conta
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Endereço de email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-400 dark:focus:border-green-400"
                placeholder="Endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-400 dark:focus:border-green-400"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              Esqueci minha senha
            </Link>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-500 dark:text-gray-400">
                ou use uma conta demo
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🚀 Contas de Demonstração
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded p-2 border border-blue-100 dark:border-blue-800">
                    <div className="font-medium text-blue-800 dark:text-blue-200">👨‍💼 Admin</div>
                    <div className="text-gray-700 dark:text-gray-300 mt-1">
                      <span className="font-mono">admin@agroinsight.com</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono">admin123</span>
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded p-2 border border-blue-100 dark:border-blue-800">
                    <div className="font-medium text-blue-800 dark:text-blue-200">👤 Usuário</div>
                    <div className="text-gray-700 dark:text-gray-300 mt-1">
                      <span className="font-mono">researcher@agroinsight.com</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono">user123</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Componente de diagnóstico (apenas em desenvolvimento) */}
      <ErrorDiagnostic />
    </div>
  )
}
