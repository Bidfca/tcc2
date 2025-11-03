/**
 * Standardized Error Handling System for AgroInsight
 * 
 * This module provides a consistent error handling approach across the application with:
 * - Categorized error codes (AUTH, DB, UPLOAD, API, PERM, VAL)
 * - Dual messages: technical (for logs) and user-friendly (for UI)
 * - Automatic HTTP status mapping
 * - Structured error creation and logging
 * 
 * Benefits:
 * - Consistent error reporting across the app
 * - Easy debugging with unique error codes
 * - Better user experience with friendly messages
 * - Simplified error tracking and monitoring
 * 
 * Usage:
 * ```ts
 * // Create and throw an error
 * const error = ErrorHandler.createError(
 *   ErrorCodes.AUTH_002,
 *   { email: 'user@example.com' },
 *   'authorize'
 * )
 * ErrorHandler.logError(error)
 * throw new Error(error.code)
 * ```
 */

/**
 * Enumeration of all application error codes
 * Organized by category with sequential numbering for easy identification
 */
export enum ErrorCodes {
  // Authentication Errors (AUTH-001 to AUTH-099)
  // Used for sign-in, sign-up, password reset, and session management
  AUTH_001 = 'AUTH-001', // Invalid credentials provided
  AUTH_002 = 'AUTH-002', // User not found in database
  AUTH_003 = 'AUTH-003', // Password verification failed
  AUTH_004 = 'AUTH-004', // Session expired
  AUTH_005 = 'AUTH-005', // Authentication token invalid
  AUTH_006 = 'AUTH-006', // User with email already exists
  AUTH_007 = 'AUTH-007', // Email format invalid
  AUTH_008 = 'AUTH-008', // Password too weak
  AUTH_009 = 'AUTH-009', // User creation failed
  AUTH_010 = 'AUTH-010', // Redirect error after login
  AUTH_011 = 'AUTH-011', // Password reset token invalid
  AUTH_012 = 'AUTH-012', // Password reset token expired
  AUTH_013 = 'AUTH-013', // Failed to send reset email

  // Database Errors (DB-001 to DB-099)
  // Used for Prisma/database operation failures
  DB_001 = 'DB-001', // Database connection failed
  DB_002 = 'DB-002', // Query execution error
  DB_003 = 'DB-003', // Record not found
  DB_004 = 'DB-004', // Constraint violation (unique, foreign key, etc.)
  DB_005 = 'DB-005', // Operation timeout

  // Upload/Analysis Errors (UPLOAD-001 to UPLOAD-099)
  // Used for file upload and CSV processing
  UPLOAD_001 = 'UPLOAD-001', // No file uploaded
  UPLOAD_002 = 'UPLOAD-002', // Invalid file format
  UPLOAD_003 = 'UPLOAD-003', // File size exceeds limit
  UPLOAD_004 = 'UPLOAD-004', // CSV parsing failed
  UPLOAD_005 = 'UPLOAD-005', // Insufficient data for analysis
  UPLOAD_006 = 'UPLOAD-006', // Required columns not identified

  // API Errors (API-001 to API-099)
  // Used for general API request/response issues
  API_001 = 'API-001', // HTTP method not allowed
  API_002 = 'API-002', // Invalid input data
  API_003 = 'API-003', // Required parameters missing
  API_004 = 'API-004', // Rate limit exceeded
  API_005 = 'API-005', // Internal server error

  // Permission Errors (PERM-001 to PERM-099)
  // Used for authorization and access control
  PERM_001 = 'PERM-001', // Access denied
  PERM_002 = 'PERM-002', // Insufficient permissions
  PERM_003 = 'PERM-003', // Resource not found or no access
  PERM_004 = 'PERM-004', // Operation not allowed

  // Validation Errors (VAL-001 to VAL-099)
  // Used for input validation failures
  VAL_001 = 'VAL-001', // Required fields missing
  VAL_002 = 'VAL-002', // Invalid data format
  VAL_003 = 'VAL-003', // Value out of range
  VAL_004 = 'VAL-004', // Incorrect data type
}

/**
 * Standard error object structure
 * Provides consistent error information across the application
 */
export interface AppError {
  code: ErrorCodes          // Unique error code for identification
  message: string           // Technical message for developers/logs
  userMessage: string       // User-friendly message for UI display
  details?: unknown             // Additional context-specific details
  timestamp: string         // ISO timestamp when error occurred
  context?: string          // Where the error occurred (function name, etc.)
}

/**
 * Central error handling class
 * Provides static methods for creating, logging, and managing errors
 */
export class ErrorHandler {
  /**
   * Map of error codes to their messages
   * Each error has two messages:
   * - message: Technical description for logs and developers
   * - userMessage: User-friendly description for UI display
   */
  private static errorMessages: Record<ErrorCodes, { message: string; userMessage: string }> = {
    // Authentication Errors
    [ErrorCodes.AUTH_001]: {
      message: 'Invalid credentials provided',
      userMessage: 'Email ou senha incorretos. Verifique suas credenciais.'
    },
    [ErrorCodes.AUTH_002]: {
      message: 'User not found in database',
      userMessage: 'Usuário não encontrado. Verifique o email informado.'
    },
    [ErrorCodes.AUTH_003]: {
      message: 'Password verification failed',
      userMessage: 'Senha incorreta. Tente novamente.'
    },
    [ErrorCodes.AUTH_004]: {
      message: 'Session has expired',
      userMessage: 'Sua sessão expirou. Faça login novamente.'
    },
    [ErrorCodes.AUTH_005]: {
      message: 'Invalid authentication token',
      userMessage: 'Token de autenticação inválido. Faça login novamente.'
    },
    [ErrorCodes.AUTH_006]: {
      message: 'User already exists with this email',
      userMessage: 'Já existe uma conta com este email. Tente fazer login.'
    },
    [ErrorCodes.AUTH_007]: {
      message: 'Invalid email format',
      userMessage: 'Formato de email inválido. Verifique o endereço informado.'
    },
    [ErrorCodes.AUTH_008]: {
      message: 'Password does not meet requirements',
      userMessage: 'Senha muito fraca. Use pelo menos 6 caracteres.'
    },
    [ErrorCodes.AUTH_009]: {
      message: 'Failed to create user account',
      userMessage: 'Erro ao criar conta. Tente novamente em alguns minutos.'
    },
    [ErrorCodes.AUTH_010]: {
      message: 'Redirect after login failed',
      userMessage: 'Erro ao redirecionar após login. Tente acessar o dashboard diretamente.'
    },
    [ErrorCodes.AUTH_011]: {
      message: 'Invalid reset token',
      userMessage: 'Link de recuperação inválido. Solicite um novo link.'
    },
    [ErrorCodes.AUTH_012]: {
      message: 'Reset token has expired',
      userMessage: 'Link de recuperação expirado. Solicite um novo link.'
    },
    [ErrorCodes.AUTH_013]: {
      message: 'Failed to send reset email',
      userMessage: 'Erro ao enviar email. Tente novamente em alguns minutos.'
    },

    // Erros de Banco de Dados
    [ErrorCodes.DB_001]: {
      message: 'Database connection failed',
      userMessage: 'Erro de conexão. Tente novamente em alguns minutos.'
    },
    [ErrorCodes.DB_002]: {
      message: 'Database query execution failed',
      userMessage: 'Erro ao processar dados. Tente novamente.'
    },
    [ErrorCodes.DB_003]: {
      message: 'Record not found in database',
      userMessage: 'Registro não encontrado.'
    },
    [ErrorCodes.DB_004]: {
      message: 'Database constraint violation',
      userMessage: 'Dados inválidos. Verifique as informações fornecidas.'
    },
    [ErrorCodes.DB_005]: {
      message: 'Database operation timeout',
      userMessage: 'Operação demorou muito. Tente novamente.'
    },

    // Erros de Upload/Análise
    [ErrorCodes.UPLOAD_001]: {
      message: 'No file was uploaded',
      userMessage: 'Nenhum arquivo foi enviado. Selecione um arquivo CSV.'
    },
    [ErrorCodes.UPLOAD_002]: {
      message: 'Invalid file format',
      userMessage: 'Formato de arquivo inválido. Apenas arquivos CSV são aceitos.'
    },
    [ErrorCodes.UPLOAD_003]: {
      message: 'File size exceeds limit',
      userMessage: 'Arquivo muito grande. Limite máximo: 10MB.'
    },
    [ErrorCodes.UPLOAD_004]: {
      message: 'CSV parsing failed',
      userMessage: 'Erro ao processar arquivo CSV. Verifique o formato.'
    },
    [ErrorCodes.UPLOAD_005]: {
      message: 'Insufficient data for analysis',
      userMessage: 'Dados insuficientes para análise. Arquivo deve ter pelo menos 5 registros.'
    },
    [ErrorCodes.UPLOAD_006]: {
      message: 'No zootechnical columns identified',
      userMessage: 'Nenhuma coluna zootécnica identificada. Verifique os nomes das colunas.'
    },

    // Erros de API
    [ErrorCodes.API_001]: {
      message: 'HTTP method not allowed',
      userMessage: 'Método não permitido.'
    },
    [ErrorCodes.API_002]: {
      message: 'Invalid input data',
      userMessage: 'Dados de entrada inválidos.'
    },
    [ErrorCodes.API_003]: {
      message: 'Required parameters missing',
      userMessage: 'Parâmetros obrigatórios ausentes.'
    },
    [ErrorCodes.API_004]: {
      message: 'Rate limit exceeded',
      userMessage: 'Muitas tentativas. Aguarde alguns minutos.'
    },
    [ErrorCodes.API_005]: {
      message: 'Internal server error',
      userMessage: 'Erro interno do servidor. Tente novamente.'
    },

    // Erros de Permissão
    [ErrorCodes.PERM_001]: {
      message: 'Access denied',
      userMessage: 'Acesso negado. Você não tem permissão para esta ação.'
    },
    [ErrorCodes.PERM_002]: {
      message: 'Insufficient permissions',
      userMessage: 'Permissões insuficientes. Contate um administrador.'
    },
    [ErrorCodes.PERM_003]: {
      message: 'Resource not found',
      userMessage: 'Recurso não encontrado ou você não tem acesso.'
    },
    [ErrorCodes.PERM_004]: {
      message: 'Operation not allowed',
      userMessage: 'Operação não permitida.'
    },

    // Erros de Validação
    [ErrorCodes.VAL_001]: {
      message: 'Required fields missing',
      userMessage: 'Campos obrigatórios não preenchidos.'
    },
    [ErrorCodes.VAL_002]: {
      message: 'Invalid data format',
      userMessage: 'Formato de dados inválido.'
    },
    [ErrorCodes.VAL_003]: {
      message: 'Value out of allowed range',
      userMessage: 'Valor fora do intervalo permitido.'
    },
    [ErrorCodes.VAL_004]: {
      message: 'Incorrect data type',
      userMessage: 'Tipo de dados incorreto.'
    },
  }

  /**
   * Create a structured error object
   * 
   * @param code - The error code from ErrorCodes enum
   * @param details - Optional additional context about the error
   * @param context - Optional location where error occurred (function name, etc.)
   * @returns Structured AppError object
   * 
   * @example
   * ```ts
   * const error = ErrorHandler.createError(
   *   ErrorCodes.AUTH_002,
   *   { email: 'user@example.com' },
   *   'authorize'
   * )
   * ```
   */
  static createError(
    code: ErrorCodes,
    details?: unknown,
    context?: string
  ): AppError {
    // Look up the predefined messages for this error code
    const errorInfo = this.errorMessages[code]
    
    // Return structured error object
    return {
      code,
      message: errorInfo.message,           // Technical message
      userMessage: errorInfo.userMessage,   // User-friendly message
      details,                              // Additional context
      timestamp: new Date().toISOString(),  // When it happened
      context                               // Where it happened
    }
  }

  /**
   * Log an error to the console with structured format
   * Useful for debugging and monitoring
   * 
   * @param error - The AppError object to log
   * 
   * @example
   * ```ts
   * ErrorHandler.logError(error)
   * // Output: [AUTH-002] User not found in database { timestamp: ..., context: ..., details: ... }
   * ```
   */
  static logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      timestamp: error.timestamp,
      context: error.context,
      details: error.details
    })
  }

  /**
   * Get appropriate HTTP status code for an error
   * Maps error code prefixes to HTTP status codes
   * 
   * @param code - The error code
   * @returns HTTP status code (401, 403, 400, 500, etc.)
   * 
   * @example
   * ```ts
   * const status = ErrorHandler.getHttpStatus(ErrorCodes.AUTH_002)
   * // Returns: 401
   * 
   * return NextResponse.json(
   *   { error: error.userMessage },
   *   { status: ErrorHandler.getHttpStatus(error.code) }
   * )
   * ```
   */
  static getHttpStatus(code: ErrorCodes): number {
    // Map error code prefixes to HTTP status codes
    const statusMap: Record<string, number> = {
      'AUTH': 401,    // Unauthorized
      'PERM': 403,    // Forbidden
      'DB': 500,      // Internal Server Error
      'UPLOAD': 400,  // Bad Request
      'API': 400,     // Bad Request
      'VAL': 400      // Bad Request (validation failed)
    }

    // Extract prefix from error code (e.g., 'AUTH' from 'AUTH-001')
    const prefix = code.split('-')[0]
    
    // Return mapped status or default to 500
    return statusMap[prefix] || 500
  }
}
