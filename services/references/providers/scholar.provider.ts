/**
 * Google Scholar Provider using SerpAPI
 * 
 * This provider integrates with SerpAPI's Google Scholar API to search
 * and retrieve metadata for scholarly articles from Google Scholar.
 * 
 * API Documentation: https://serpapi.com/google-scholar-api
 * Requires: SERPAPI_API_KEY environment variable
 */

import axios, { AxiosInstance } from 'axios'
import { Article, SearchOptions, SearchProvider } from '@/services/references/types'

export class GoogleScholarProvider implements SearchProvider {
  private readonly name = 'scholar'
  private readonly baseUrl = 'https://serpapi.com/search'
  private readonly client: AxiosInstance
  private readonly apiKey: string | undefined
  
  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY
    
    if (!this.apiKey) {
      console.warn('⚠️  SERPAPI_API_KEY not found. Google Scholar provider will not work.')
    }
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        'Accept': 'application/json'
      }
    })
  }
  
  /**
   * Check if the provider is properly configured
   */
  private isConfigured(): boolean {
    return !!this.apiKey
  }
  
  /**
   * Search for articles in Google Scholar via SerpAPI
   */
  async search(query: string, options: SearchOptions = {}): Promise<Article[]> {
    if (!this.isConfigured()) {
      console.error('❌ Google Scholar provider not configured (missing SERPAPI_API_KEY)')
      return []
    }
    
    try {
      const { 
        limit = 10, 
        offset = 0,
        yearFrom,
        yearTo,
        language
      } = options
      
      // Build search query with filters
      let searchQuery = query
      
      // Add year range filter if specified
      if (yearFrom || yearTo) {
        const fromYear = yearFrom || 1900
        const toYear = yearTo || new Date().getFullYear()
        searchQuery += ` after:${fromYear} before:${toYear}`
      }
      
      // Build request parameters
      const params: any = {
        engine: 'google_scholar',
        q: searchQuery,
        api_key: this.apiKey,
        num: Math.min(limit, 20), // SerpAPI supports up to 20 per request
        start: offset,
        hl: this.mapLanguage(language),
        as_ylo: yearFrom,
        as_yhi: yearTo
      }
      
      console.log(`🔍 Google Scholar searching: "${query}" with params:`, { ...params, api_key: '***' })
      
      const response = await this.client.get('', {
        params,
        timeout: 15000
      })
      
      const results = response.data?.organic_results || []
      console.log(`✅ Google Scholar returned ${results.length} results`)
      
      return results.map((item: any) => this.transformToArticle(item))
      
    } catch (error: any) {
      console.error('❌ Google Scholar search error:', error.response?.data || error.message)
      return []
    }
  }
  
  /**
   * Get article details by ID (cluster_id or result_id)
   */
  async getArticle(articleId: string): Promise<Article | null> {
    if (!this.isConfigured()) {
      return null
    }
    
    try {
      // Search by cluster ID or exact title
      const params = {
        engine: 'google_scholar',
        cluster: articleId,
        api_key: this.apiKey,
        num: 1
      }
      
      const response = await this.client.get('', { params })
      const results = response.data?.organic_results || []
      
      if (results.length > 0) {
        return this.transformToArticle(results[0])
      }
      
      return null
    } catch (error) {
      console.error('Google Scholar article fetch error:', error)
      return null
    }
  }
  
  /**
   * Validate if an article exists in Google Scholar
   */
  async validateArticle(doi?: string, title?: string): Promise<boolean> {
    if (!this.isConfigured() || (!doi && !title)) {
      return false
    }
    
    try {
      const searchQuery = doi ? `"${doi}"` : `"${title}"`
      
      const params = {
        engine: 'google_scholar',
        q: searchQuery,
        api_key: this.apiKey,
        num: 1
      }
      
      const response = await this.client.get('', { params })
      return (response.data?.organic_results?.length || 0) > 0
      
    } catch (error) {
      console.error('Google Scholar validation error:', error)
      return false
    }
  }
  
  /**
   * Transform SerpAPI Google Scholar result to standard Article format
   */
  private transformToArticle(item: any): Article {
    // Extract basic information
    const title = item.title || 'Título não disponível'
    const snippet = item.snippet || ''
    
    // Extract authors from publication_info or inline_links
    const authors = this.extractAuthors(item)
    
    // Extract year from publication_info
    const year = this.extractYear(item)
    
    // Extract journal/publication name
    const journal = this.extractJournal(item)
    
    // Get the main link
    const url = item.link || '#'
    
    // Check for PDF link
    const pdfUrl = this.extractPdfUrl(item)
    
    // Extract citation count
    const citationsCount = item.inline_links?.cited_by?.total || undefined
    
    // Generate article ID
    const id = item.result_id || `scholar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: `scholar-${id}`,
      title: this.cleanText(title),
      authors: authors,
      abstract: this.cleanText(snippet),
      year: year,
      journal: journal,
      url: url,
      source: 'scholar' as const,
      pdfUrl: pdfUrl,
      citationsCount: citationsCount,
      verified: true,
      validationSource: 'Google Scholar via SerpAPI',
      openAccess: !!pdfUrl,
      publicationType: this.inferPublicationType(item),
      language: 'en'
    }
  }
  
  /**
   * Extract authors from Google Scholar result
   */
  private extractAuthors(item: any): string[] {
    // Try to get authors from publication_info
    if (item.publication_info?.authors) {
      return item.publication_info.authors.map((author: any) => 
        author.name || 'Autor não disponível'
      )
    }
    
    // Try to parse from publication_info.summary
    if (item.publication_info?.summary) {
      const summary = item.publication_info.summary
      // Format: "A Author, B Author - Source, Year"
      const authorMatch = summary.match(/^([^-]+)\s*-/)
      if (authorMatch) {
        const authorsStr = authorMatch[1].trim()
        return authorsStr.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
      }
    }
    
    return ['Autor não disponível']
  }
  
  /**
   * Extract publication year
   */
  private extractYear(item: any): number {
    // Try publication_info first
    if (item.publication_info?.summary) {
      const yearMatch = item.publication_info.summary.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        return parseInt(yearMatch[0])
      }
    }
    
    // Try to find year in title or snippet
    const text = `${item.title} ${item.snippet}`
    const yearMatch = text.match(/\b(19|20)\d{2}\b/)
    if (yearMatch) {
      return parseInt(yearMatch[0])
    }
    
    return new Date().getFullYear()
  }
  
  /**
   * Extract journal/publication name
   */
  private extractJournal(item: any): string {
    if (item.publication_info?.summary) {
      // Format: "Authors - Journal/Conference, Year"
      const parts = item.publication_info.summary.split('-')
      if (parts.length > 1) {
        const journalPart = parts[1].trim()
        // Remove year from end
        const withoutYear = journalPart.replace(/,?\s*(19|20)\d{2}.*$/, '')
        return withoutYear || 'Publicação não especificada'
      }
    }
    
    return 'Google Scholar'
  }
  
  /**
   * Extract PDF URL if available
   */
  private extractPdfUrl(item: any): string | undefined {
    // Check for PDF resources
    if (item.resources) {
      const pdfResource = item.resources.find((r: any) => 
        r.file_format?.toLowerCase() === 'pdf'
      )
      if (pdfResource?.link) {
        return pdfResource.link
      }
    }
    
    // Check inline_links for versions
    if (item.inline_links?.versions?.link) {
      return item.inline_links.versions.link
    }
    
    return undefined
  }
  
  /**
   * Infer publication type from available data
   */
  private inferPublicationType(item: any): Article['publicationType'] {
    const titleLower = item.title?.toLowerCase() || ''
    const snippet = item.snippet?.toLowerCase() || ''
    
    if (titleLower.includes('review') || snippet.includes('systematic review')) {
      return 'review'
    }
    
    if (titleLower.includes('meta-analysis') || snippet.includes('meta-analysis')) {
      return 'meta-analysis'
    }
    
    if (titleLower.includes('case study') || snippet.includes('case study')) {
      return 'case-study'
    }
    
    return 'research'
  }
  
  /**
   * Map language code
   */
  private mapLanguage(language?: string): string {
    const langMap: Record<string, string> = {
      'pt': 'pt',
      'en': 'en',
      'es': 'es',
      'all': 'en'
    }
    
    return langMap[language || 'en'] || 'en'
  }
  
  /**
   * Clean text by removing extra whitespace and special characters
   */
  private cleanText(text: string): string {
    if (!text) return ''
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\[HTML\]/gi, '')
      .replace(/\[PDF\]/gi, '')
      .trim()
  }
}

export default GoogleScholarProvider
