import {
  validateFileSize,
  validateMimeType,
  validateExtension,
  formatBytes,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '@/lib/file-validation'

describe('File Validation', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(52428800)).toBe('50 MB')
    })

    it('should handle decimals', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB')
      expect(formatBytes(5242880, 1)).toBe('5 MB')
    })
  })

  describe('validateFileSize', () => {
    it('should pass for valid file size', () => {
      const result = validateFileSize(1024, 2048)
      expect(result.valid).toBe(true)
    })

    it('should fail for oversized file', () => {
      const result = validateFileSize(3000, 2048)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should provide size details in error', () => {
      const result = validateFileSize(1000000, 50000)
      expect(result.valid).toBe(false)
      expect(result.details?.size).toBe(1000000)
      expect(result.details?.maxSize).toBe(50000)
    })
  })

  describe('validateMimeType', () => {
    it('should pass for allowed MIME type', () => {
      const result = validateMimeType('text/csv', ALLOWED_MIME_TYPES.CSV)
      expect(result.valid).toBe(true)
    })

    it('should fail for disallowed MIME type', () => {
      const result = validateMimeType('application/json', ALLOWED_MIME_TYPES.CSV)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })
  })

  describe('validateExtension', () => {
    it('should pass for allowed extension', () => {
      const result = validateExtension('data.csv', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(true)
    })

    it('should fail for disallowed extension', () => {
      const result = validateExtension('data.json', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })

    it('should be case insensitive', () => {
      const result = validateExtension('data.CSV', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(true)
    })
  })

  describe('FILE_SIZE_LIMITS', () => {
    it('should have correct limits defined', () => {
      expect(FILE_SIZE_LIMITS.CSV).toBe(50 * 1024 * 1024) // 50 MB
      expect(FILE_SIZE_LIMITS.PDF).toBe(10 * 1024 * 1024) // 10 MB
      expect(FILE_SIZE_LIMITS.IMAGE).toBe(5 * 1024 * 1024) // 5 MB
    })
  })
})
