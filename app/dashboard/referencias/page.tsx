'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Sprout, 
  ArrowLeft,
  Search,
  BookOpen,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Calendar,
  User,
  FileText,
  FileDown,
  Tag,
  Hash,
  Quote
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ReferencesLoadingSkeleton } from '@/components/skeleton'

interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'scholar' | 'pubmed' | 'crossref'
  saved?: boolean
  doi?: string
  // Campos expandidos
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  keywords?: string[]
  language?: string
  pdfUrl?: string
  citationsCount?: number
  publishedDate?: string
}

export default function ReferenciasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  const [selectedSource, setSelectedSource] = useState<'all' | 'scielo' | 'pubmed' | 'crossref'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [addByUrlInput, setAddByUrlInput] = useState('')
  const [isAddingByUrl, setIsAddingByUrl] = useState(false)
  const [addByUrlMessage, setAddByUrlMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    if (session) {
      loadSavedArticles()
    }
  }, [session])

  const loadSavedArticles = async () => {
    try {
      const response = await fetch('/api/referencias/saved')
      const data = await response.json()
      setSavedArticles(data.articles || [])
    } catch (error) {
      console.error('Erro ao carregar artigos salvos:', error)
    }
  }

  const handleSearch = async (resetPage = true) => {
    if (!searchTerm.trim()) return

    const pageToLoad = resetPage ? 1 : currentPage
    setIsSearching(true)
    
    if (resetPage) {
      setArticles([])
      setCurrentPage(1)
    }

    try {
      const response = await fetch('/api/referencias/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          source: selectedSource,
          page: pageToLoad,
          pageSize: 10
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Marcar artigos já salvos
        const articlesWithSavedStatus = data.articles.map((article: Article) => ({
          ...article,
          saved: savedArticles.some(saved => saved.url === article.url)
        }))
        
        if (resetPage) {
          setArticles(articlesWithSavedStatus)
        } else {
          setArticles([...articles, ...articlesWithSavedStatus])
        }
        
        setHasMore(data.hasMore)
        setCurrentPage(pageToLoad)
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    
    try {
      const response = await fetch('/api/referencias/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          source: selectedSource,
          page: nextPage,
          pageSize: 10
        }),
      })

      const data = await response.json()
      if (data.success) {
        const articlesWithSavedStatus = data.articles.map((article: Article) => ({
          ...article,
          saved: savedArticles.some(saved => saved.url === article.url)
        }))
        
        setArticles([...articles, ...articlesWithSavedStatus])
        setHasMore(data.hasMore)
        setCurrentPage(nextPage) // Atualizar apenas após sucesso
      }
    } catch (error) {
      console.error('Erro ao carregar mais:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleAddByUrl = async () => {
    if (!addByUrlInput.trim()) return

    setIsAddingByUrl(true)
    setAddByUrlMessage(null)

    try {
      const response = await fetch('/api/referencias/add-by-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: addByUrlInput }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setAddByUrlMessage({ type: 'success', text: data.message })
        setAddByUrlInput('')
        // Recarregar artigos salvos
        await loadSavedArticles()
      } else {
        setAddByUrlMessage({ type: 'error', text: data.error })
      }
    } catch {
      setAddByUrlMessage({ type: 'error', text: 'Erro ao adicionar artigo. Tente novamente.' })
    } finally {
      setIsAddingByUrl(false)
      // Limpar mensagem após 5 segundos
      setTimeout(() => setAddByUrlMessage(null), 5000)
    }
  }

  const handleSaveArticle = async (article: Article) => {
    try {
      const response = await fetch('/api/referencias/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      })

      if (response.ok) {
        // Atualizar estado local
        setArticles(articles.map(a => 
          a.id === article.id ? { ...a, saved: true } : a
        ))
        setSavedArticles([...savedArticles, { ...article, saved: true }])
      }
    } catch (error) {
      console.error('Erro ao salvar artigo:', error)
    }
  }

  const handleUnsaveArticle = async (articleUrl: string, articleTitle?: string) => {
    // Confirmação antes de remover
    const article = savedArticles.find(a => a.url === articleUrl)
    const title = articleTitle || article?.title || 'este artigo'
    
    if (!confirm(`Tem certeza que deseja remover "${title}" da sua biblioteca?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const response = await fetch('/api/referencias/unsave', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: articleUrl }),
      })

      if (response.ok) {
        // Atualizar estado local
        setArticles(articles.map(a => 
          a.url === articleUrl ? { ...a, saved: false } : a
        ))
        setSavedArticles(savedArticles.filter(a => a.url !== articleUrl))
      }
    } catch (error) {
      console.error('Erro ao remover artigo:', error)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-muted-foreground hover:text-foreground/80"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Referências Científicas</h1>
          <p className="text-muted-foreground mb-8">
            Pesquise artigos científicos no Google Scholar, PubMed e Crossref para suas pesquisas
          </p>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'search'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border'
                  }`}
                >
                  <Search className="h-4 w-4 inline mr-2" />
                  Pesquisar Artigos
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'saved'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border'
                  }`}
                >
                  <BookmarkCheck className="h-4 w-4 inline mr-2" />
                  Artigos Salvos ({savedArticles.length})
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'search' ? (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="bg-card shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Termo de Pesquisa
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: zootecnia, bovinos, nutrição animal..."
                    />
                  </div>
                  
                  <div className="md:w-48">
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Fonte
                    </label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value as any)}
                      className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Todas as fontes</option>
                      <option value="scholar">Google Scholar</option>
                      <option value="pubmed">PubMed</option>
                      <option value="crossref">Crossref</option>
                    </select>
                  </div>
                  
                  <div className="md:w-32 flex items-end">
                    <button
                      onClick={() => handleSearch(true)}
                      disabled={isSearching || !searchTerm.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Pesquisar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading Skeleton */}
              {isSearching && articles.length === 0 && (
                <ReferencesLoadingSkeleton />
              )}

              {/* Search Results - Artigos */}
              {articles.length > 0 && (
                <div className="bg-card shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    📄 Artigos Científicos ({articles.length} encontrados)
                  </h3>
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="border border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-foreground flex-1 mr-4">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              article.source === 'scholar' 
                                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300' 
                                : article.source === 'pubmed'
                                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                : 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300'
                            }`}>
                              {article.source === 'scholar' ? 'Google Scholar' : article.source === 'pubmed' ? 'PubMed' : 'Crossref'}
                            </span>
                            <button
                              onClick={() => article.saved ? handleUnsaveArticle(article.url) : handleSaveArticle(article)}
                              className={`p-1 rounded ${
                                article.saved 
                                  ? 'text-green-600 hover:text-green-700' 
                                  : 'text-muted-foreground hover:text-muted-foreground'
                              }`}
                            >
                              {article.saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {Array.isArray(article.authors) 
                              ? article.authors.slice(0, 3).join(', ') 
                              : article.authors}
                            {Array.isArray(article.authors) && article.authors.length > 3 && ` et al.`}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {article.year}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {article.journal}
                          </div>
                        </div>
                        
                        <p className="text-foreground/80 text-sm mb-3 line-clamp-3">
                          {article.abstract}
                        </p>
                        
                        {/* Keywords */}
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex items-start gap-2 mb-3">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {article.keywords.slice(0, 5).map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {article.keywords.length > 5 && (
                                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                  +{article.keywords.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Acessar artigo
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                            {article.pdfUrl && (
                              <a
                                href={article.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <FileDown className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                            )}
                            {article.doi && (
                              <a
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                              >
                                DOI: {article.doi}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Botão Ver Mais */}
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium inline-flex items-center"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          'Ver mais artigos'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!isSearching && articles.length === 0 && searchTerm && (
                <div className="bg-card shadow rounded-lg p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente usar termos diferentes ou mais específicos para sua pesquisa.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Saved Articles Tab */
            <div className="space-y-6">
              {/* Adicionar por URL/DOI */}
              <div className="bg-card shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  🔗 Adicionar Artigo por Link/DOI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cole a URL de qualquer artigo (SciELO, PubMed, sites acadêmicos, etc.) para adicioná-lo diretamente à sua biblioteca. Se a URL contiver um DOI, buscaremos automaticamente os metadados completos do artigo.
                </p>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={addByUrlInput}
                    onChange={(e) => setAddByUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddByUrl()}
                    className="flex-1 px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="https://doi.org/10.xxxx/xxxx ou https://..."
                  />
                  <button
                    onClick={handleAddByUrl}
                    disabled={isAddingByUrl || !addByUrlInput.trim()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium inline-flex items-center"
                  >
                    {isAddingByUrl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Adicionar'
                    )}
                  </button>
                </div>
                
                {addByUrlMessage && (
                  <div className={`mt-3 p-3 rounded-md ${
                    addByUrlMessage.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900' 
                      : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
                  }`}>
                    {addByUrlMessage.text}
                  </div>
                )}
              </div>

              {savedArticles.length > 0 ? (
                <div className="bg-card shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Sua Biblioteca ({savedArticles.length} artigos salvos)
                  </h3>
                  <div className="space-y-4">
                    {savedArticles.map((article) => (
                      <div key={article.id} className="border border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-foreground flex-1 mr-4">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              article.source === 'scholar' 
                                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300' 
                                : article.source === 'pubmed'
                                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                : 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300'
                            }`}>
                              {article.source === 'scholar' ? 'Google Scholar' : article.source === 'pubmed' ? 'PubMed' : 'Crossref'}
                            </span>
                            <button
                              onClick={() => handleUnsaveArticle(article.url)}
                              className="p-1 rounded text-red-600 hover:text-red-700"
                            >
                              <BookmarkCheck className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-4 flex-wrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {Array.isArray(article.authors) 
                              ? article.authors.slice(0, 3).join(', ') 
                              : article.authors}
                            {Array.isArray(article.authors) && article.authors.length > 3 && ` et al.`}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {article.year}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {article.journal}
                          </div>
                          {article.volume && (
                            <div className="flex items-center text-xs">
                              Vol. {article.volume}{article.issue && `, Nº ${article.issue}`}
                            </div>
                          )}
                          {article.issn && (
                            <div className="flex items-center text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              ISSN: {article.issn}
                            </div>
                          )}
                          {article.citationsCount !== undefined && article.citationsCount > 0 && (
                            <div className="flex items-center text-xs font-semibold text-green-600">
                              <Quote className="h-3 w-3 mr-1" />
                              {article.citationsCount} citações
                            </div>
                          )}
                        </div>
                        
                        <p className="text-foreground/80 text-sm mb-3 line-clamp-3">
                          {article.abstract}
                        </p>
                        
                        {/* Keywords */}
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex items-start gap-2 mb-3">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {article.keywords.slice(0, 5).map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {article.keywords.length > 5 && (
                                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                  +{article.keywords.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Ler artigo completo
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                          {article.pdfUrl && (
                            <a
                              href={article.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          )}
                          {article.doi && (
                            <a
                              href={`https://doi.org/${article.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                            >
                              DOI: {article.doi}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card shadow rounded-lg p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum artigo salvo</h3>
                  <p className="text-muted-foreground mb-6">
                    Você ainda não salvou nenhum artigo. Use a pesquisa para encontrar e salvar artigos interessantes.
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar Artigos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
