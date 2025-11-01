/**
 * Crossref Provider for Scientific Article Search
 * 
 * This provider integrates with Crossref REST API to search and retrieve
 * metadata for scholarly articles across millions of publications.
 * 
 * API Documentation: https://api.crossref.org
 * No API key required for basic usage (polite pool)
 */

import axios, { AxiosInstance } from 'axios'
import { Article, SearchOptions, SearchProvider } from '@/services/references/types'

export class CrossrefProvider implements SearchProvider {
  private readonly name = 'crossref'
  private readonly baseUrl = 'https://api.crossref.org'
  private readonly client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com; Agricultural Research Platform)'
      }
    })
  }
  
  /**
   * Search for articles in Crossref database
   */
  async search(query: string, options: SearchOptions = {}): Promise<Article[]> {
    try {
      const { 
        limit = 10, 
        offset = 0,
        yearFrom,
        yearTo,
        publicationType
      } = options
      
      // Build query parameters
      const params: any = {
        query: query,
        rows: limit,
        offset: offset,
        sort: 'relevance',
        order: 'desc'
      }
      
      // Add year filter
      if (yearFrom || yearTo) {
        const fromYear = yearFrom || 1900
        const toYear = yearTo || new Date().getFullYear()
        params.filter = `from-pub-date:${fromYear},until-pub-date:${toYear}`
      }
      
      // Add publication type filter
      if (publicationType && publicationType !== 'all') {
        const typeMap: Record<string, string> = {
          'research': 'journal-article',
          'review': 'review-article',
          'meta-analysis': 'review',
          'case-study': 'case-report'
        }
        
        if (typeMap[publicationType]) {
          const existingFilter = params.filter || ''
          params.filter = existingFilter 
            ? `${existingFilter},type:${typeMap[publicationType]}`
            : `type:${typeMap[publicationType]}`
        }
      }
      
      console.log(`🔍 Crossref searching: "${query}" with params:`, params)
      
      const response = await this.client.get('/works', {
        params,
        timeout: 10000
      })
      
      const items = response.data?.message?.items || []
      console.log(`✅ Crossref returned ${items.length} results`)
      
      return items.map((item: any) => this.transformToArticle(item))
      
    } catch (error) {
      console.error('❌ Crossref search error:', error)
      return []
    }
  }
  
  /**
   * Get article details by DOI
   */
  async getArticle(doi: string): Promise<Article | null> {
    try {
      const response = await this.client.get(`/works/${doi}`)
      return this.transformToArticle(response.data.message)
    } catch (error) {
      console.error('Crossref article fetch error:', error)
      return null
    }
  }
  
  /**
   * Validate if an article exists in Crossref
   */
  async validateArticle(doi?: string, title?: string): Promise<boolean> {
    if (!doi && !title) return false
    
    try {
      if (doi) {
        const response = await this.client.get(`/works/${doi}`)
        return response.status === 200
      }
      
      if (title) {
        const response = await this.client.get('/works', {
          params: {
            'query.bibliographic': title,
            rows: 1
          }
        })
        return response.data?.message?.items?.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Crossref validation error:', error)
      return false
    }
  }
  
  /**
   * Transform Crossref API response to standard Article format
   */
  private transformToArticle(item: any): Article {
    // Extract DOI
    const doi = item.DOI || undefined
    
    // Extract title (usually an array with one element)
    const title = Array.isArray(item.title) && item.title.length > 0
      ? item.title[0]
      : item.title || 'Título não disponível'
    
    // Extract authors
    const authors = this.extractAuthors(item.author)
    
    // Extract year from published date
    const year = this.extractYear(item)
    
    // Extract abstract
    const abstract = item.abstract || this.generateAbstractFromTitle(title)
    
    // Journal/container title
    const journal = Array.isArray(item['container-title']) && item['container-title'].length > 0
      ? item['container-title'][0]
      : item['container-title'] || 'Journal não especificado'
    
    // Build URL
    const url = doi ? `https://doi.org/${doi}` : item.URL || item.link?.[0]?.URL || '#'
    
    // Extract keywords/subjects
    const keywords = item.subject || undefined
    
    // Check if open access
    const openAccess = this.checkOpenAccess(item)
    
    return {
      id: `crossref-${doi || Date.now()}`,
      title: this.cleanText(title),
      authors: authors,
      abstract: this.cleanText(abstract),
      year: year,
      journal: this.cleanText(journal),
      url: url,
      source: 'crossref' as const,
      doi: doi,
      issn: item.ISSN?.[0] || undefined,
      volume: item.volume || undefined,
      issue: item.issue || undefined,
      pages: item.page || undefined,
      keywords: keywords,
      language: item.language || 'en',
      pdfUrl: this.extractPdfUrl(item),
      citationsCount: item['is-referenced-by-count'] || undefined,
      publishedDate: this.extractPublishedDate(item),
      verified: true,
      validationSource: 'Crossref API',
      openAccess: openAccess,
      publicationType: this.mapPublicationType(item.type)
    }
  }
  
  /**
   * Extract authors from Crossref format
   */
  private extractAuthors(authorField: any): string[] {
    if (!authorField || !Array.isArray(authorField)) {
      return ['Autor não disponível']
    }
    
    return authorField.map(author => {
      if (author.family && author.given) {
        return `${author.family}, ${author.given}`
      }
      if (author.family) {
        return author.family
      }
      if (author.name) {
        return author.name
      }
      return 'Autor não disponível'
    })
  }
  
  /**
   * Extract publication year
   */
  private extractYear(item: any): number {
    // Try published-print first, then published-online, then created
    const dateFields = [
      item['published-print'],
      item['published-online'],
      item.published,
      item.created
    ]
    
    for (const dateField of dateFields) {
      if (dateField?.['date-parts']?.[0]?.[0]) {
        return dateField['date-parts'][0][0]
      }
    }
    
    return new Date().getFullYear()
  }
  
  /**
   * Extract published date as string
   */
  private extractPublishedDate(item: any): string | undefined {
    const dateFields = [
      item['published-print'],
      item['published-online'],
      item.published
    ]
    
    for (const dateField of dateFields) {
      if (dateField?.['date-parts']?.[0]) {
        const parts = dateField['date-parts'][0]
        if (parts.length === 3) {
          return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`
        } else if (parts.length === 2) {
          return `${parts[0]}-${String(parts[1]).padStart(2, '0')}`
        } else if (parts.length === 1) {
          return `${parts[0]}`
        }
      }
    }
    
    return undefined
  }
  
  /**
   * Check if article is open access
   */
  private checkOpenAccess(item: any): boolean {
    // Check various open access indicators
    if (item.license) {
      const licenses = Array.isArray(item.license) ? item.license : [item.license]
      return licenses.some((lic: any) => 
        lic.URL?.includes('creativecommons.org') ||
        lic['content-version'] === 'vor' ||
        lic['content-version'] === 'am'
      )
    }
    
    if (item.link) {
      return item.link.some((link: any) => 
        link['content-type'] === 'application/pdf' ||
        link['content-type'] === 'unspecified'
      )
    }
    
    return false
  }
  
  /**
   * Extract PDF URL if available
   */
  private extractPdfUrl(item: any): string | undefined {
    if (item.link) {
      const pdfLink = item.link.find((link: any) => 
        link['content-type'] === 'application/pdf'
      )
      if (pdfLink?.URL) return pdfLink.URL
    }
    
    return undefined
  }
  
  /**
   * Map Crossref publication type to our type
   */
  private mapPublicationType(type: string): Article['publicationType'] {
    const typeMap: Record<string, Article['publicationType']> = {
      'journal-article': 'research',
      'proceedings-article': 'research',
      'review-article': 'review',
      'review': 'review',
      'case-report': 'case-study'
    }
    
    return typeMap[type] || 'other'
  }
  
  /**
   * Generate a simple abstract from title if abstract is not available
   */
  private generateAbstractFromTitle(title: string): string {
    return `Resumo não disponível. Título: ${title}. Acesse o artigo completo para mais informações.`
  }
  
  /**
   * Clean text by removing HTML tags and extra whitespace
   */
  private cleanText(text: string): string {
    if (!text) return ''
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim()
  }
}

export default CrossrefProvider
