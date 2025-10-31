'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Sprout className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar no AgroInsight
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Esqueci minha senha
            </Link>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
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

          <div className="text-center">
            <div className="text-sm text-gray-600">
              Contas de demonstração:
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Admin: admin@agroinsight.com / admin123<br />
              Usuário: researcher@agroinsight.com / user123
            </div>
          </div>
        </form>
      </div>
      
      {/* Componente de diagnóstico (apenas em desenvolvimento) */}
      <ErrorDiagnostic />
    </div>
  )
}
