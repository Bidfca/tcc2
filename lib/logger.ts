/**
 * Conditional Logging System for AgroInsight
 * 
 * A structured logging utility that:
 * - Shows logs only in development (except errors)
 * - Provides consistent formatting with timestamps and emojis
 * - Offers context-specific logging methods (cache, api, db, auth)
 * - Prevents log pollution in production
 * 
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User created', { userId: '123' })
 * logger.error('Database connection failed', error)
 * logger.cache.hit('user:123')
 * logger.api.request('GET', '/api/users')
 * ```
 */

// Log severity levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

/**
 * Optional configuration for log messages
 */
interface LogOptions {
  prefix?: string   // Custom prefix for the message
  emoji?: string    // Custom emoji (overrides default for level)
  color?: string    // Custom color (reserved for future use)
}

/**
 * Logger class - handles all logging logic
 * Singleton pattern - only one instance should exist
 */
class Logger {
  private isDevelopment: boolean

  constructor() {
    // Determine if we're in development mode
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Core logging method - all other methods use this
   * 
   * @param level - Severity level of the log
   * @param message - Main log message
   * @param data - Optional additional data to log
   * @param options - Optional formatting options
   */
  private log(level: LogLevel, message: string, data?: unknown, options?: LogOptions) {
    // In production, only log errors to avoid noise
    // All other levels are silenced
    if (!this.isDevelopment && level !== 'error') {
      return
    }

    // Generate timestamp in ISO format
    const timestamp = new Date().toISOString()
    const prefix = options?.prefix || ''
    const emoji = options?.emoji || this.getEmoji(level)
    
    // Format: "📝 [2024-01-01T12:00:00.000Z] Message"
    const formattedMessage = `${emoji} [${timestamp}] ${prefix}${message}`

    // Use appropriate console method based on level
    switch (level) {
      case 'error':
        console.error(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'debug':
        console.debug(formattedMessage, data || '')
        break
      default:
        console.log(formattedMessage, data || '')
    }
  }

  /**
   * Get emoji for a given log level
   * Provides visual distinction between log types
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      info: 'ℹ️',      // Information
      warn: '⚠️',      // Warning
      error: '❌',     // Error
      debug: '🔍',     // Debug/Investigation
      success: '✅'    // Success
    }
    return emojis[level] || '📝'  // Default to memo emoji
  }

  /**
   * Log informational message
   */
  info(message: string, data?: unknown, options?: LogOptions) {
    this.log('info', message, data, options)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown, options?: LogOptions) {
    this.log('warn', message, data, options)
  }

  /**
   * Log error message (always shown, even in production)
   */
  error(message: string, error?: unknown, options?: LogOptions) {
    this.log('error', message, error, options)
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: unknown, options?: LogOptions) {
    this.log('debug', message, data, options)
  }

  /**
   * Log success message
   */
  success(message: string, data?: unknown, options?: LogOptions) {
    this.log('success', message, data, options)
  }

  /**
   * Cache-specific logging methods
   * Used for tracking cache hit/miss/set operations
   */
  cache = {
    hit: (key: string) => this.success(`Cache HIT: ${key}`),
    miss: (key: string) => this.info(`Cache MISS: ${key}`),
    set: (key: string) => this.debug(`Cache SET: ${key}`),
    invalidate: (key: string) => this.info(`Cache invalidado: ${key}`)
  }

  /**
   * API-specific logging methods
   * Used for tracking HTTP requests and responses
   */
  api = {
    // Log incoming API request
    request: (method: string, path: string) => 
      this.info(`${method} ${path}`, undefined, { emoji: '📡' }),
    
    // Log successful API response with status and optional duration
    response: (method: string, path: string, status: number, duration?: number) => 
      this.success(`${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ''}`),
    
    // Log API error
    error: (method: string, path: string, error: unknown) => 
      this.error(`${method} ${path} falhou`, error)
  }

  /**
   * Database-specific logging methods
   * Used for tracking database operations
   */
  db = {
    // Log database query
    query: (operation: string, table: string) => 
      this.debug(`DB ${operation} em ${table}`, undefined, { emoji: '🗄️' }),
    
    // Log database error
    error: (operation: string, error: unknown) => 
      this.error(`DB ${operation} falhou`, error)
  }

  /**
   * Authentication-specific logging methods
   * Used for tracking login/logout events
   */
  auth = {
    // Log successful login
    login: (email: string) => this.success(`Login: ${email}`, undefined, { emoji: '🔐' }),
    
    // Log logout
    logout: (email: string) => this.info(`Logout: ${email}`, undefined, { emoji: '🔓' }),
    
    // Log failed login attempt
    failed: (email: string) => this.warn(`Falha no login: ${email}`, undefined, { emoji: '🚫' })
  }
}

// Export single instance (singleton pattern)
// This ensures consistent logging across the application
export const logger = new Logger()

// Export types for use in other files
export type { LogLevel, LogOptions }
