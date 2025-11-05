/**
 * Tests for Upload Security Module
 */

import {
  sanitizeFilename,
  generateUniqueFilename,
  scanForMaliciousPatterns,
  checkFileSize,
  isAllowedMimeType,
  FILE_SIZE_LIMITS
} from '@/lib/upload-security'

describe('Upload Security', () => {
  describe('sanitizeFilename', () => {
    test('should remove special characters', () => {
      expect(sanitizeFilename('file@#$%.csv')).toBe('file.csv')
    })
    
    test('should replace spaces with underscores', () => {
      expect(sanitizeFilename('my file name.csv')).toBe('my_file_name.csv')
    })
    
    test('should convert to lowercase', () => {
      expect(sanitizeFilename('MyFile.CSV')).toBe('myfile.csv')
    })
    
    test('should remove path traversal attempts', () => {
      const result = sanitizeFilename('../../../etc/passwd')
      // After removing special chars, if empty, generates random name
      expect(result).toMatch(/^(etcpasswd|file_\d+\.etcpasswd)$/)
    })
    
    test('should limit filename length', () => {
      const longName = 'a'.repeat(200) + '.csv'
      const result = sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(110) // 100 + extension
    })
    
    test('should handle files without extension', () => {
      expect(sanitizeFilename('noextension')).toBe('noextension')
    })
    
    test('should generate random name if empty after sanitization', () => {
      const result = sanitizeFilename('@#$%.csv')
      expect(result).toMatch(/^file_\d+\.csv$/)
    })
  })
  
  describe('generateUniqueFilename', () => {
    test('should generate unique filenames', () => {
      const name1 = generateUniqueFilename('test.csv')
      const name2 = generateUniqueFilename('test.csv')
      expect(name1).not.toBe(name2)
    })
    
    test('should preserve file extension', () => {
      const result = generateUniqueFilename('document.csv')
      expect(result).toMatch(/\.csv$/)
    })
    
    test('should include timestamp and random suffix', () => {
      const result = generateUniqueFilename('test.csv')
      expect(result).toMatch(/test_\d+_[a-f0-9]{8}\.csv/)
    })
  })
  
  describe('scanForMaliciousPatterns', () => {
    test('should detect script tags', () => {
      const result = scanForMaliciousPatterns('<script>alert("xss")</script>')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('Script tag detected')
    })
    
    test('should detect javascript protocol', () => {
      const result = scanForMaliciousPatterns('javascript:alert(1)')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('JavaScript protocol detected')
    })
    
    test('should detect CSV formula injection', () => {
      const result = scanForMaliciousPatterns('=1+1\n,data')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('Formula injection attempt detected')
    })
    
    test('should detect SQL injection patterns', () => {
      const result = scanForMaliciousPatterns("' OR '1'='1")
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('SQL injection pattern detected')
    })
    
    test('should detect path traversal', () => {
      const result = scanForMaliciousPatterns('../../../etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('Path traversal attempt detected')
    })
    
    test('should pass clean content', () => {
      const result = scanForMaliciousPatterns('normal,csv,data\n1,2,3')
      expect(result.valid).toBe(true)
      expect(result.warnings).toBeUndefined()
    })
    
    test('should detect multiple threats', () => {
      const malicious = '<script>alert(1)</script>\n=1+1\n../etc/passwd'
      const result = scanForMaliciousPatterns(malicious)
      expect(result.valid).toBe(false)
      expect(result.warnings?.length).toBeGreaterThan(1)
    })
  })
  
  describe('checkFileSize', () => {
    test('should accept files within limit', () => {
      const result = checkFileSize(5 * 1024 * 1024, 'csv') // 5MB
      expect(result.valid).toBe(true)
    })
    
    test('should reject files exceeding limit', () => {
      const result = checkFileSize(15 * 1024 * 1024, 'csv') // 15MB
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds limit')
    })
    
    test('should use correct limit for CSV files', () => {
      const result = checkFileSize(FILE_SIZE_LIMITS.csv + 1, 'csv')
      expect(result.valid).toBe(false)
    })
    
    test('should use correct limit for image files', () => {
      const result = checkFileSize(FILE_SIZE_LIMITS.image - 1, 'image')
      expect(result.valid).toBe(true)
    })
    
    test('should use default limit if type not specified', () => {
      const result = checkFileSize(FILE_SIZE_LIMITS.default - 1)
      expect(result.valid).toBe(true)
    })
  })
  
  describe('isAllowedMimeType', () => {
    test('should allow valid CSV MIME types', () => {
      expect(isAllowedMimeType('text/csv', 'csv')).toBe(true)
      expect(isAllowedMimeType('application/csv', 'csv')).toBe(true)
      expect(isAllowedMimeType('text/comma-separated-values', 'csv')).toBe(true)
    })
    
    test('should reject invalid CSV MIME types', () => {
      expect(isAllowedMimeType('application/json', 'csv')).toBe(false)
      expect(isAllowedMimeType('text/plain', 'csv')).toBe(false)
    })
    
    test('should allow valid image MIME types', () => {
      expect(isAllowedMimeType('image/jpeg', 'image')).toBe(true)
      expect(isAllowedMimeType('image/png', 'image')).toBe(true)
      expect(isAllowedMimeType('image/webp', 'image')).toBe(true)
    })
    
    test('should reject invalid image MIME types', () => {
      expect(isAllowedMimeType('text/csv', 'image')).toBe(false)
      expect(isAllowedMimeType('application/pdf', 'image')).toBe(false)
    })
  })
})
