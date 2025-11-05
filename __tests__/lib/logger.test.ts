/**
 * Logger Unit Tests
 * 
 * This test suite validates the Logger class functionality including:
 * - Basic logging methods (info, warn, error, debug, success)
 * - Environment-specific behavior (development vs production)
 * - Specialized logging contexts (cache, api, db, auth)
 * - Optional parameters (data, options)
 * 
 * Test setup:
 * - Spies on console methods to verify calls
 * - Mocks prevent actual console output during tests
 * - Restores original methods after each test
 */

import { logger } from '@/lib/logger'

/**
 * Main test suite for Logger class
 */
describe('Logger', () => {
  // Jest spies to track console method calls
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  /**
   * Test setup - runs before each test
   * Creates spies on console methods to track calls without actual output
   */
  beforeEach(() => {
    // Mock console methods to prevent actual output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  /**
   * Test cleanup - runs after each test
   * Restores original console methods to avoid test interference
   */
  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  /**
   * Test suite for basic logging functionality
   * Verifies that different log levels behave correctly
   */
  describe('Basic logging', () => {
    /**
     * Test info logging behavior
     * Should only log in development environment
     */
    it('should call console.log for info messages', () => {
      logger.info('Test message')
      // In development, should log. In production, should not.
      // Behavior depends on NODE_ENV
      expect(consoleLogSpy).toHaveBeenCalledTimes(
        process.env.NODE_ENV === 'development' ? 1 : 0
      )
    })

    /**
     * Test error logging behavior
     * Should always log regardless of environment
     */
    it('should always log error messages', () => {
      logger.error('Error message')
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        ''
      )
    })

    /**
     * Test warning logging behavior
     * Should only log in development environment
     */
    it('should call console.warn for warning messages', () => {
      logger.warn('Warning message')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(
        process.env.NODE_ENV === 'development' ? 1 : 0
      )
    })
  })

  /**
   * Test suite for specialized logging contexts
   * Verifies that all context-specific methods exist
   */
  describe('Specialized loggers', () => {
    /**
     * Test cache logging methods availability
     */
    it('should have cache logging methods', () => {
      expect(typeof logger.cache.hit).toBe('function')
      expect(typeof logger.cache.miss).toBe('function')
      expect(typeof logger.cache.set).toBe('function')
      expect(typeof logger.cache.invalidate).toBe('function')
    })

    /**
     * Test API logging methods availability
     */
    it('should have API logging methods', () => {
      expect(typeof logger.api.request).toBe('function')
      expect(typeof logger.api.response).toBe('function')
      expect(typeof logger.api.error).toBe('function')
    })

    /**
     * Test database logging methods availability
     */
    it('should have DB logging methods', () => {
      expect(typeof logger.db.query).toBe('function')
      expect(typeof logger.db.error).toBe('function')
    })

    /**
     * Test authentication logging methods availability
     */
    it('should have auth logging methods', () => {
      expect(typeof logger.auth.login).toBe('function')
      expect(typeof logger.auth.logout).toBe('function')
      expect(typeof logger.auth.failed).toBe('function')
    })
  })

  /**
   * Test suite for logger behavior with optional parameters
   * Verifies that additional parameters don't cause errors
   * 
   * Note: Logger's isDevelopment is determined at instantiation,
   * so we use error level which always logs regardless of environment
   */
  describe('Logger behavior', () => {
    /**
     * Test that logger accepts additional data parameter
     */
    it('should accept data parameter', () => {
      // Use error level which always logs
      logger.error('Test message', { key: 'value' })
      // Should not throw error and should log
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    /**
     * Test that logger accepts options parameter
     */
    it('should accept options parameter', () => {
      // Use error level which always logs
      logger.error('Error message', undefined, { prefix: 'PREFIX: ' })
      // Should not throw error and should log
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
