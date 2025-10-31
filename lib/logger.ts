/**
 * Sistema de logging condicional
 * Logs são exibidos apenas em desenvolvimento
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

interface LogOptions {
  prefix?: string
  emoji?: string
  color?: string
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private log(level: LogLevel, message: string, data?: any, options?: LogOptions) {
    // Em produção, logar apenas erros
    if (!this.isDevelopment && level !== 'error') {
      return
    }

    const timestamp = new Date().toISOString()
    const prefix = options?.prefix || ''
    const emoji = options?.emoji || this.getEmoji(level)
    
    const formattedMessage = `${emoji} [${timestamp}] ${prefix}${message}`

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

  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
      success: '✅'
    }
    return emojis[level] || '📝'
  }

  info(message: string, data?: any, options?: LogOptions) {
    this.log('info', message, data, options)
  }

  warn(message: string, data?: any, options?: LogOptions) {
    this.log('warn', message, data, options)
  }

  error(message: string, error?: any, options?: LogOptions) {
    this.log('error', message, error, options)
  }

  debug(message: string, data?: any, options?: LogOptions) {
    this.log('debug', message, data, options)
  }

  success(message: string, data?: any, options?: LogOptions) {
    this.log('success', message, data, options)
  }

  // Métodos especializados para diferentes contextos
  cache = {
    hit: (key: string) => this.success(`Cache HIT: ${key}`),
    miss: (key: string) => this.info(`Cache MISS: ${key}`),
    set: (key: string) => this.debug(`Cache SET: ${key}`),
    invalidate: (key: string) => this.info(`Cache invalidado: ${key}`)
  }

  api = {
    request: (method: string, path: string) => 
      this.info(`${method} ${path}`, undefined, { emoji: '📡' }),
    response: (method: string, path: string, status: number, duration?: number) => 
      this.success(`${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ''}`),
    error: (method: string, path: string, error: any) => 
      this.error(`${method} ${path} falhou`, error)
  }

  db = {
    query: (operation: string, table: string) => 
      this.debug(`DB ${operation} em ${table}`, undefined, { emoji: '🗄️' }),
    error: (operation: string, error: any) => 
      this.error(`DB ${operation} falhou`, error)
  }

  auth = {
    login: (email: string) => this.success(`Login: ${email}`, undefined, { emoji: '🔐' }),
    logout: (email: string) => this.info(`Logout: ${email}`, undefined, { emoji: '🔓' }),
    failed: (email: string) => this.warn(`Falha no login: ${email}`, undefined, { emoji: '🚫' })
  }
}

// Exportar instância única
export const logger = new Logger()

// Exportar tipo para uso em outros arquivos
export type { LogLevel, LogOptions }
