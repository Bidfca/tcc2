/**
 * Tests for Pagination Helper
 */

import {
  parsePaginationParams,
  calculatePaginationMeta,
  buildPaginatedResponse,
  PAGINATION_DEFAULTS
} from '@/lib/pagination'

describe('Pagination', () => {
  describe('parsePaginationParams', () => {
    test('should use default values when no params provided', () => {
      const searchParams = new URLSearchParams()
      const result = parsePaginationParams(searchParams)
      
      expect(result.page).toBe(PAGINATION_DEFAULTS.page)
      expect(result.limit).toBe(PAGINATION_DEFAULTS.limit)
    })
    
    test('should parse page and limit from params', () => {
      const searchParams = new URLSearchParams('page=3&limit=50')
      const result = parsePaginationParams(searchParams)
      
      expect(result.page).toBe(3)
      expect(result.limit).toBe(50)
    })
    
    test('should enforce minimum page of 1', () => {
      const searchParams = new URLSearchParams('page=0')
      const result = parsePaginationParams(searchParams)
      
      expect(result.page).toBe(1)
    })
    
    test('should enforce maximum limit', () => {
      const searchParams = new URLSearchParams('limit=999')
      const result = parsePaginationParams(searchParams)
      
      expect(result.limit).toBe(PAGINATION_DEFAULTS.maxLimit)
    })
    
    test('should enforce minimum limit', () => {
      const searchParams = new URLSearchParams('limit=0')
      const result = parsePaginationParams(searchParams)
      
      expect(result.limit).toBe(PAGINATION_DEFAULTS.minLimit)
    })
    
    test('should parse sortBy and sortOrder', () => {
      const searchParams = new URLSearchParams('sortBy=createdAt&sortOrder=asc')
      const result = parsePaginationParams(searchParams)
      
      expect(result.sortBy).toBe('createdAt')
      expect(result.sortOrder).toBe('asc')
    })
    
    test('should default sortOrder to desc', () => {
      const searchParams = new URLSearchParams('sortBy=name')
      const result = parsePaginationParams(searchParams)
      
      expect(result.sortOrder).toBe('desc')
    })
  })
  
  describe('calculatePaginationMeta', () => {
    test('should calculate correct metadata for first page', () => {
      const meta = calculatePaginationMeta(100, 1, 20)
      
      expect(meta.total).toBe(100)
      expect(meta.page).toBe(1)
      expect(meta.limit).toBe(20)
      expect(meta.totalPages).toBe(5)
      expect(meta.hasNext).toBe(true)
      expect(meta.hasPrev).toBe(false)
    })
    
    test('should calculate correct metadata for middle page', () => {
      const meta = calculatePaginationMeta(100, 3, 20)
      
      expect(meta.page).toBe(3)
      expect(meta.hasNext).toBe(true)
      expect(meta.hasPrev).toBe(true)
    })
    
    test('should calculate correct metadata for last page', () => {
      const meta = calculatePaginationMeta(100, 5, 20)
      
      expect(meta.page).toBe(5)
      expect(meta.hasNext).toBe(false)
      expect(meta.hasPrev).toBe(true)
    })
    
    test('should handle exact division', () => {
      const meta = calculatePaginationMeta(40, 1, 20)
      
      expect(meta.totalPages).toBe(2)
    })
    
    test('should handle remainder', () => {
      const meta = calculatePaginationMeta(45, 1, 20)
      
      expect(meta.totalPages).toBe(3)
    })
    
    test('should handle empty results', () => {
      const meta = calculatePaginationMeta(0, 1, 20)
      
      expect(meta.totalPages).toBe(0)
      expect(meta.hasNext).toBe(false)
      expect(meta.hasPrev).toBe(false)
    })
  })
  
  describe('buildPaginatedResponse', () => {
    test('should build correct response structure', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const params = { page: 1, limit: 20 }
      
      const response = buildPaginatedResponse(data, 100, params)
      
      expect(response.data).toEqual(data)
      expect(response.meta.total).toBe(100)
      expect(response.meta.page).toBe(1)
      expect(response.meta.limit).toBe(20)
    })
    
    test('should use default values if params incomplete', () => {
      const data = [{ id: 1 }]
      const params = {}
      
      const response = buildPaginatedResponse(data, 50, params)
      
      expect(response.meta.page).toBe(PAGINATION_DEFAULTS.page)
      expect(response.meta.limit).toBe(PAGINATION_DEFAULTS.limit)
    })
    
    test('should work with empty data array', () => {
      const response = buildPaginatedResponse([], 0, {})
      
      expect(response.data).toEqual([])
      expect(response.meta.total).toBe(0)
      expect(response.meta.totalPages).toBe(0)
    })
    
    test('should include correct navigation flags', () => {
      const data = Array(20).fill({ id: 1 })
      const response = buildPaginatedResponse(data, 100, { page: 2, limit: 20 })
      
      expect(response.meta.hasPrev).toBe(true)
      expect(response.meta.hasNext).toBe(true)
    })
  })
})
