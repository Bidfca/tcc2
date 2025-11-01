/**
 * Type Definitions for References Service
 * 
 * Defines the common interfaces and types used across all reference providers
 * and the main reference search service.
 */

/**
 * Standard Article interface for all providers
 */
export interface Article {
  // Core identification
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'crossref' | 'pubmed' | 'scholar' | 'embrapa' | 'manual'
  
  // Additional identifiers
  doi?: string
  pmid?: string
  arxivId?: string
  
  // Journal metadata
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  
  // Content metadata
  keywords?: string[]
  meshTerms?: string[]
  language?: string
  publicationType?: 'research' | 'review' | 'meta-analysis' | 'case-study' | 'other'
  
  // Access information
  pdfUrl?: string
  fullTextUrl?: string
  openAccess?: boolean
  
  // Metrics
  citationsCount?: number
  altmetricScore?: number
  
  // Dates
  publishedDate?: string
  indexedDate?: string
  
  // Validation
  verified?: boolean
  validationSource?: string
  
  // UI state
  saved?: boolean
}

/**
 * Search options for article queries
 */
export interface SearchOptions {
  // Pagination
  limit?: number
  offset?: number
  page?: number
  
  // Time filters
  yearFrom?: number
  yearTo?: number
  lastNDays?: number
  
  // Content filters
  publicationType?: 'research' | 'review' | 'meta-analysis' | 'case-study' | 'all'
  language?: 'pt' | 'en' | 'es' | 'all'
  
  // Subject filters
  keywords?: string[]
  meshTerms?: string[]
  animalType?: string[]
  
  // Quality filters
  minCitations?: number
  peerReviewed?: boolean
  openAccess?: boolean
  hasFullText?: boolean
  
  // Source selection
  sources?: Array<'crossref' | 'pubmed' | 'scholar' | 'embrapa'>
}

/**
 * Search provider interface that all providers must implement
 */
export interface SearchProvider {
  /**
   * Search for articles based on query and options
   */
  search(query: string, options?: SearchOptions): Promise<Article[]>
  
  /**
   * Get a specific article by its ID
   */
  getArticle?(articleId: string): Promise<Article | null>
  
  /**
   * Validate if an article exists in this source
   */
  validateArticle?(doi?: string, title?: string): Promise<boolean>
}

/**
 * Enhanced article with additional computed fields
 */
export interface EnrichedArticle extends Article {
  // Computed relevance score
  relevanceScore?: number
  
  // Related articles
  relatedArticles?: Article[]
  
  // Full text availability
  fullTextSources?: FullTextSource[]
  
  // Article metrics
  metrics?: ArticleMetrics
}

/**
 * Full text source information
 */
export interface FullTextSource {
  source: string
  url: string
  accessType: 'open' | 'subscription' | 'paywall'
  format: 'pdf' | 'html' | 'xml'
}

/**
 * Article metrics from various sources
 */
export interface ArticleMetrics {
  citations?: {
    count: number
    source: string
    lastUpdated: Date
  }
  altmetric?: {
    score: number
    mentions: {
      twitter?: number
      facebook?: number
      news?: number
      blogs?: number
    }
  }
  plumx?: {
    captures: number
    mentions: number
    socialMedia: number
    citations: number
  }
}

/**
 * Search result with metadata
 */
export interface SearchResult {
  articles: Article[]
  totalResults: number
  page: number
  pageSize: number
  hasMore: boolean
  query: string
  filters: SearchOptions
  searchTime: number
  sources: string[]
}

/**
 * Saved search for alerts
 */
export interface SavedSearch {
  id: string
  userId: string
  name: string
  query: string
  filters: SearchOptions
  createdAt: Date
  lastRun?: Date
  alertEnabled: boolean
  alertFrequency?: 'daily' | 'weekly' | 'monthly'
  lastAlertSent?: Date
}

/**
 * Citation format types
 */
export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'ABNT' | 'Vancouver' | 'IEEE'

/**
 * Export format types
 */
export type ExportFormat = 'bibtex' | 'ris' | 'endnote' | 'csv' | 'json'

/**
 * Provider status for monitoring
 */
export interface ProviderStatus {
  name: string
  available: boolean
  lastCheck: Date
  responseTime?: number
  errorRate?: number
  rateLimit?: {
    remaining: number
    reset: Date
  }
}

/**
 * Service configuration
 */
export interface ReferenceServiceConfig {
  providers: string[]
  cacheEnabled: boolean
  cacheTTL: number
  maxRetries: number
  timeout: number
  rateLimits: {
    [provider: string]: {
      requestsPerSecond: number
      burstLimit: number
    }
  }
}
