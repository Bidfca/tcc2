import { logger } from '@/lib/logger'

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('Basic logging', () => {
    it('should call console.log for info messages', () => {
      logger.info('Test message')
      // Em desenvolvimento, deve logar. Em produção, não.
      // O comportamento depende do NODE_ENV
      expect(consoleLogSpy).toHaveBeenCalledTimes(
        process.env.NODE_ENV === 'development' ? 1 : 0
      )
    })

    it('should always log error messages', () => {
      logger.error('Error message')
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        ''
      )
    })

    it('should call console.warn for warning messages', () => {
      logger.warn('Warning message')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(
        process.env.NODE_ENV === 'development' ? 1 : 0
      )
    })
  })

  describe('Specialized loggers', () => {
    it('should have cache logging methods', () => {
      expect(typeof logger.cache.hit).toBe('function')
      expect(typeof logger.cache.miss).toBe('function')
      expect(typeof logger.cache.set).toBe('function')
      expect(typeof logger.cache.invalidate).toBe('function')
    })

    it('should have API logging methods', () => {
      expect(typeof logger.api.request).toBe('function')
      expect(typeof logger.api.response).toBe('function')
      expect(typeof logger.api.error).toBe('function')
    })

    it('should have DB logging methods', () => {
      expect(typeof logger.db.query).toBe('function')
      expect(typeof logger.db.error).toBe('function')
    })

    it('should have auth logging methods', () => {
      expect(typeof logger.auth.login).toBe('function')
      expect(typeof logger.auth.logout).toBe('function')
      expect(typeof logger.auth.failed).toBe('function')
    })
  })

  describe('Logger behavior', () => {
    it('should accept data parameter', () => {
      logger.info('Test message', { key: 'value' })
      // Should not throw error
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should accept options parameter', () => {
      logger.success('Success message', undefined, { prefix: 'PREFIX: ' })
      // Should not throw error
      expect(consoleLogSpy).toHaveBeenCalled()
    })
  })
})
