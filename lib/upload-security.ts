/**
 * Upload Security Module
 * 
 * Provides comprehensive security checks for file uploads:
 * - MIME type verification
 * - Malicious content scanning
 * - Filename sanitization
 * - File size limits
 */

import crypto from 'crypto'

/**
 * File size limits by type (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  csv: 10 * 1024 * 1024,      // 10MB for CSV files
  image: 5 * 1024 * 1024,      // 5MB for images
  document: 20 * 1024 * 1024,  // 20MB for documents
  default: 10 * 1024 * 1024    // 10MB default
} as const

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = {
  csv: [
    'text/csv',
    'application/csv',
    'text/x-csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'application/vnd.ms-excel'
  ],
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
} as const

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
  sanitizedFilename?: string
}

/**
 * Verify if a MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string, fileType: 'csv' | 'image'): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[fileType]
  return (allowedTypes as readonly string[]).includes(mimeType)
}

/**
 * Check file size against limits
 */
export function checkFileSize(size: number, fileType: keyof typeof FILE_SIZE_LIMITS = 'default'): SecurityValidationResult {
  const limit = FILE_SIZE_LIMITS[fileType]
  
  if (size > limit) {
    return {
      valid: false,
      error: `File size exceeds limit. Maximum allowed: ${formatBytes(limit)}`
    }
  }
  
  return { valid: true }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Scan file content for malicious patterns
 * Checks for common attack vectors in CSV and text files
 */
export function scanForMaliciousPatterns(content: string): SecurityValidationResult {
  const warnings: string[] = []
  
  // Malicious patterns to detect
  const dangerousPatterns = [
    // Script injections
    { pattern: /<script[\s\S]*?<\/script>/gi, threat: 'Script tag detected' },
    { pattern: /javascript:/gi, threat: 'JavaScript protocol detected' },
    { pattern: /on\w+\s*=/gi, threat: 'Event handler detected' },
    
    // Code execution attempts
    { pattern: /eval\s*\(/gi, threat: 'eval() function detected' },
    { pattern: /document\./gi, threat: 'DOM manipulation detected' },
    { pattern: /window\./gi, threat: 'Window object access detected' },
    
    // CSV formula injection (Excel/Sheets)
    { pattern: /^[=+\-@]/m, threat: 'Formula injection attempt detected' },
    
    // Command injection attempts
    { pattern: /;\s*(rm|del|format|mkfs|dd)\s/gi, threat: 'System command detected' },
    { pattern: /\$\(.*\)/g, threat: 'Command substitution detected' },
    { pattern: /`.*`/g, threat: 'Backtick command execution detected' },
    
    // SQL injection patterns
    { pattern: /('\s*OR\s*'1'\s*=\s*'1|--|\bUNION\b|\bDROP\b)/gi, threat: 'SQL injection pattern detected' },
    
    // Path traversal
    { pattern: /\.\.[\/\\]/g, threat: 'Path traversal attempt detected' },
    
    // Null byte injection
    { pattern: /\x00/g, threat: 'Null byte detected' }
  ]
  
  let hasThreats = false
  
  for (const { pattern, threat } of dangerousPatterns) {
    if (pattern.test(content)) {
      warnings.push(threat)
      hasThreats = true
    }
  }
  
  if (hasThreats) {
    return {
      valid: false,
      error: 'Malicious content detected in file',
      warnings
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize filename to prevent security issues
 * - Removes special characters
 * - Prevents path traversal
 * - Limits length
 * - Preserves extension
 */
export function sanitizeFilename(filename: string): string {
  // Extract extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.substring(lastDot) : ''
  
  // Sanitize name part
  let sanitized = name
    .toLowerCase()
    .replace(/\s+/g, '_')                    // Replace spaces with underscore
    .replace(/[^a-z0-9_-]/g, '')             // Remove special characters
    .replace(/_{2,}/g, '_')                  // Replace multiple underscores
    .replace(/^[_-]+|[_-]+$/g, '')           // Remove leading/trailing underscores
    .substring(0, 100)                       // Limit length
  
  // If name is empty after sanitization, use random name
  if (!sanitized) {
    sanitized = `file_${Date.now()}`
  }
  
  // Sanitize extension
  const sanitizedExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '').substring(0, 10)
  
  return sanitized + sanitizedExt
}

/**
 * Generate a unique filename with timestamp and random suffix
 */
export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const timestamp = Date.now()
  const randomSuffix = crypto.randomBytes(4).toString('hex')
  
  const lastDot = sanitized.lastIndexOf('.')
  const name = lastDot > 0 ? sanitized.substring(0, lastDot) : sanitized
  const ext = lastDot > 0 ? sanitized.substring(lastDot) : ''
  
  return `${name}_${timestamp}_${randomSuffix}${ext}`
}

/**
 * Comprehensive file validation
 * Combines all security checks
 */
export async function validateUploadedFile(
  file: File,
  expectedType: 'csv' | 'image' = 'csv'
): Promise<SecurityValidationResult> {
  const warnings: string[] = []
  
  // 1. Check file size
  const sizeCheck = checkFileSize(file.size, expectedType)
  if (!sizeCheck.valid) {
    return sizeCheck
  }
  
  // 2. Verify MIME type
  if (!isAllowedMimeType(file.type, expectedType)) {
    return {
      valid: false,
      error: `Invalid file type. Expected ${expectedType}, got ${file.type}`
    }
  }
  
  // 3. Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name)
  
  // 4. For text-based files, scan content
  if (expectedType === 'csv') {
    try {
      const content = await file.text()
      
      // Check for malicious patterns
      const scanResult = scanForMaliciousPatterns(content)
      if (!scanResult.valid) {
        return scanResult
      }
      
      // Check for suspiciously large lines (potential attack)
      const lines = content.split('\n')
      const maxLineLength = Math.max(...lines.map(l => l.length))
      if (maxLineLength > 10000) {
        warnings.push('File contains unusually long lines')
      }
      
      // Check for reasonable number of columns
      if (lines.length > 0) {
        const firstLine = lines[0]
        const columnCount = firstLine.split(',').length
        if (columnCount > 1000) {
          return {
            valid: false,
            error: 'File has too many columns (max 1000)'
          }
        }
      }
      
    } catch {
      return {
        valid: false,
        error: 'Failed to read file content'
      }
    }
  }
  
  return {
    valid: true,
    sanitizedFilename,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate file before processing
 * Quick validation without reading entire file
 */
export function quickValidateFile(
  file: File,
  expectedType: 'csv' | 'image' = 'csv'
): SecurityValidationResult {
  // Check size
  const sizeCheck = checkFileSize(file.size, expectedType)
  if (!sizeCheck.valid) {
    return sizeCheck
  }
  
  // Check MIME type
  if (!isAllowedMimeType(file.type, expectedType)) {
    return {
      valid: false,
      error: `Invalid file type. Expected ${expectedType}, got ${file.type}`
    }
  }
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name)
  
  return {
    valid: true,
    sanitizedFilename
  }
}
