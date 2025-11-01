/**
 * Main Reference Search Service
 * 
 * Orchestrates searches across multiple scientific article providers,
 * handles deduplication, validation, and result ranking.
 */

import { Article, SearchOptions, SearchResult, SearchProvider } from './types'
import PubMedProvider from './providers/pubmed.provider'
import CrossrefProvider from './providers/crossref.provider'
import GoogleScholarProvider from './providers/scholar.provider'
import { getCachedData, setCachedData } from '@/lib/cache'

export class ReferenceSearchService {
  private providers: Map<string, SearchProvider>
  private enabledProviders: string[]
  
  constructor() {
    // Initialize all available providers
    this.providers = new Map<string, SearchProvider>()
    this.providers.set('pubmed', new PubMedProvider())
    this.providers.set('crossref', new CrossrefProvider())
    this.providers.set('scholar', new GoogleScholarProvider())
    
    // Default enabled providers
    this.enabledProviders = ['pubmed', 'crossref', 'scholar']
  }
  
  /**
   * Main search method that queries all enabled providers
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now()
    
    // Check cache first
    const cacheKey = this.generateCacheKey(query, options)
    const cached = await getCachedData<SearchResult>(cacheKey)
    
    if (cached) {
      console.log('📚 Reference search cache hit:', cacheKey)
      return { ...cached, searchTime: Date.now() - startTime }
    }
    
    // Determine which providers to use
    const providersToUse = options.sources || this.enabledProviders
    
    // Search all providers in parallel
    const searchPromises = providersToUse.map(async (providerName) => {
      const provider = this.providers.get(providerName)
      if (!provider) {
        console.warn(`Provider ${providerName} not found`)
        return []
      }
      
      try {
        console.log(`🔍 Searching ${providerName} for: ${query}`)
        const results = await provider.search(query, options)
        console.log(`✅ ${providerName} returned ${results.length} results`)
        return results
      } catch (error) {
        console.error(`❌ Error searching ${providerName}:`, error)
        return []
      }
    })
    
    // Wait for all searches to complete
    const allResults = await Promise.allSettled(searchPromises)
    
    // Combine results from all providers
    let combinedArticles: Article[] = []
    for (const result of allResults) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        combinedArticles = combinedArticles.concat(result.value)
      }
    }
    
    // Deduplicate articles
    const deduplicatedArticles = this.deduplicateArticles(combinedArticles)
    
    // Calculate relevance scores and sort
    const scoredArticles = this.scoreAndSortArticles(deduplicatedArticles, query)
    
    // Apply pagination
    const { limit = 10, offset = 0 } = options
    const paginatedArticles = scoredArticles.slice(offset, offset + limit)
    
    // Prepare result
    const searchResult: SearchResult = {
      articles: paginatedArticles,
      totalResults: scoredArticles.length,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: (offset + limit) < scoredArticles.length,
      query: query,
      filters: options,
      searchTime: Date.now() - startTime,
      sources: providersToUse
    }
    
    // Cache the result
    await setCachedData(cacheKey, searchResult, 3600) // 1 hour cache
    
    return searchResult
  }
  
  /**
   * Validate if an article exists in any of the providers
   */
  async validateArticle(doi?: string, title?: string): Promise<{
    valid: boolean
    sources: string[]
  }> {
    if (!doi && !title) {
      return { valid: false, sources: [] }
    }
    
    const validationPromises = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      if (provider.validateArticle) {
        try {
          const isValid = await provider.validateArticle(doi, title)
          return isValid ? name : null
        } catch (error) {
          console.error(`Validation error for ${name}:`, error)
          return null
        }
      }
      return null
    })
    
    const results = await Promise.all(validationPromises)
    const validSources = results.filter(Boolean) as string[]
    
    return {
      valid: validSources.length > 0,
      sources: validSources
    }
  }
  
  /**
   * Deduplicate articles based on DOI, title similarity, and other factors
   */
  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Map<string, Article>()
    const deduped: Article[] = []
    
    for (const article of articles) {
      // Check by DOI first (most reliable)
      if (article.doi) {
        const existing = seen.get(`doi:${article.doi}`)
        if (existing) {
          // Merge data from multiple sources
          this.mergeArticleData(existing, article)
          continue
        }
        seen.set(`doi:${article.doi}`, article)
      }
      
      // Check by PMID
      if (article.pmid) {
        const existing = seen.get(`pmid:${article.pmid}`)
        if (existing) {
          this.mergeArticleData(existing, article)
          continue
        }
        seen.set(`pmid:${article.pmid}`, article)
      }
      
      // Check by title similarity (fuzzy matching)
      const normalizedTitle = this.normalizeTitle(article.title)
      let isDuplicate = false
      
      for (const existingArticle of deduped) {
        const existingNormalized = this.normalizeTitle(existingArticle.title)
        
        if (this.calculateSimilarity(normalizedTitle, existingNormalized) > 0.9) {
          // Very similar titles, likely the same article
          this.mergeArticleData(existingArticle, article)
          isDuplicate = true
          break
        }
      }
      
      if (!isDuplicate) {
        deduped.push(article)
      }
    }
    
    return deduped
  }
  
  /**
   * Merge data from duplicate articles
   */
  private mergeArticleData(target: Article, source: Article): void {
    // Prefer verified sources
    if (source.verified && !target.verified) {
      target.verified = true
      target.validationSource = source.validationSource
    }
    
    // Merge missing fields
    if (!target.doi && source.doi) target.doi = source.doi
    if (!target.pmid && source.pmid) target.pmid = source.pmid
    if (!target.pdfUrl && source.pdfUrl) target.pdfUrl = source.pdfUrl
    if (!target.abstract && source.abstract) target.abstract = source.abstract
    if (!target.keywords && source.keywords) target.keywords = source.keywords
    if (!target.citationsCount && source.citationsCount) target.citationsCount = source.citationsCount
    
    // Combine keywords from multiple sources
    if (target.keywords && source.keywords) {
      target.keywords = Array.from(new Set([...target.keywords, ...source.keywords]))
    }
  }
  
  /**
   * Calculate relevance score and sort articles
   */
  private scoreAndSortArticles(articles: Article[], query: string): Article[] {
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)
    
    const scoredArticles = articles.map(article => {
      let score = 0
      
      // Title match (highest weight)
      const titleLower = article.title.toLowerCase()
      if (titleLower.includes(queryLower)) {
        score += 20 // Exact phrase match
      } else {
        // Check individual terms
        queryTerms.forEach(term => {
          if (titleLower.includes(term)) {
            score += 5
          }
        })
      }
      
      // Abstract match
      if (article.abstract) {
        const abstractLower = article.abstract.toLowerCase()
        if (abstractLower.includes(queryLower)) {
          score += 10
        } else {
          queryTerms.forEach(term => {
            if (abstractLower.includes(term)) {
              score += 2
            }
          })
        }
      }
      
      // Keywords match
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase()
          queryTerms.forEach(term => {
            if (keywordLower.includes(term)) {
              score += 3
            }
          })
        })
      }
      
      // Boost for recent publications (last 3 years)
      const currentYear = new Date().getFullYear()
      if (article.year >= currentYear - 3) {
        score += 5
      } else if (article.year >= currentYear - 5) {
        score += 2
      }
      
      // Boost for verified articles
      if (article.verified) {
        score += 3
      }
      
      // Boost for articles with citations
      if (article.citationsCount) {
        score += Math.min(Math.log10(article.citationsCount + 1) * 2, 10)
      }
      
      // Boost for open access
      if (article.openAccess) {
        score += 2
      }
      
      // Boost for articles with PDF
      if (article.pdfUrl) {
        score += 1
      }
      
      return { article, score }
    })
    
    // Sort by score (descending)
    scoredArticles.sort((a, b) => b.score - a.score)
    
    return scoredArticles.map(item => item.article)
  }
  
  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim()
  }
  
  /**
   * Calculate similarity between two strings (Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(' '))
    const set2 = new Set(str2.split(' '))
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
    const union = new Set(Array.from(set1).concat(Array.from(set2)))
    
    return intersection.size / union.size
  }
  
  /**
   * Generate cache key for search
   */
  private generateCacheKey(query: string, options: SearchOptions): string {
    const optionsStr = JSON.stringify(options, Object.keys(options).sort())
    return `ref:search:${query}:${optionsStr}`
  }
  
  /**
   * Get provider status
   */
  async getProviderStatus(): Promise<Map<string, boolean>> {
    const status = new Map<string, boolean>()
    
    for (const [name, provider] of Array.from(this.providers.entries())) {
      try {
        // Try a simple search to check if provider is working
        await provider.search('test', { limit: 1 })
        status.set(name, true)
      } catch (error) {
        status.set(name, false)
      }
    }
    
    return status
  }
}

// Export singleton instance
export const referenceService = new ReferenceSearchService()

export default referenceService
