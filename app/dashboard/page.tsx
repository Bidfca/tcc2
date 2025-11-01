'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Sprout, 
  Upload, 
  BarChart3, 
  Calculator, 
  BookOpen, 
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    analysesCount: 0,
    calculationsCount: 0,
    savedArticlesCount: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    console.log('📊 Dashboard - Status da sessão:', status)
    
    if (status === 'unauthenticated') {
      console.log('🔒 Usuário não autenticado, redirecionando para login...')
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      console.log('✅ Usuário autenticado:', session?.user?.email)
      fetchStats()
    }
  }, [status, router, session])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/dashboard/stats')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">AgroInsight</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-foreground/60 hover:text-foreground"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground">Painel Principal</h1>
          <p className="mt-2 text-foreground/70">
            Gerencie suas análises zootécnicas e pesquisas científicas
          </p>
        </div>

        {/* Funcionalidades Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/dashboard/analise" 
            className="group bg-card overflow-hidden shadow rounded-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:scale-[1.02] hover:bg-accent/50 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileSpreadsheet className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-green-600">Análise de Dados</h3>
                  <p className="text-sm text-foreground/70">Upload e análise de planilhas CSV</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/resultados" 
            className="group bg-card overflow-hidden shadow rounded-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:scale-[1.02] hover:bg-accent/50 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-blue-600">Resultados</h3>
                  <p className="text-sm text-foreground/70">Visualizar e baixar análises</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/calculadora" 
            className="group bg-card overflow-hidden shadow rounded-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 hover:scale-[1.02] hover:bg-accent/50 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calculator className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-orange-600">Calculadora</h3>
                  <p className="text-sm text-foreground/70">Índices zootécnicos</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/referencias" 
            className="group bg-card overflow-hidden shadow rounded-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:scale-[1.02] hover:bg-accent/50 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-purple-600">Referências</h3>
                  <p className="text-sm text-foreground/70">Pesquisa de artigos científicos</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card overflow-hidden shadow rounded-lg border">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Upload className="h-6 w-6 text-foreground/60" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-foreground/70 truncate">
                      Análises Realizadas
                    </dt>
                    <dd className="text-lg font-medium text-foreground">
                      {loadingStats ? '...' : stats.analysesCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden shadow rounded-lg border">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-foreground/60" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-foreground/70 truncate">
                      Cálculos Realizados
                    </dt>
                    <dd className="text-lg font-medium text-foreground">
                      {loadingStats ? '...' : stats.calculationsCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden shadow rounded-lg border">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-foreground/60" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-foreground/70 truncate">
                      Artigos Salvos
                    </dt>
                    <dd className="text-lg font-medium text-foreground">
                      {loadingStats ? '...' : stats.savedArticlesCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guia de Início Rápido */}
        <div className="bg-card shadow rounded-lg border">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
              Como Começar
            </h3>
            <div className="space-y-4">
              <div className="flex items-start p-4 border border-border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-foreground">Faça upload dos seus dados</h4>
                  <p className="text-sm text-foreground/70">Carregue planilhas CSV com dados zootécnicos para análise estatística</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 border border-border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-foreground">Use a calculadora zootécnica</h4>
                  <p className="text-sm text-foreground/70">Calcule índices importantes como conversão de @ para kg, taxa de nascimento, etc.</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 border border-border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-foreground">Pesquise artigos científicos</h4>
                  <p className="text-sm text-foreground/70">Encontre referências no Google Scholar, PubMed e Crossref para suas pesquisas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
