// Sistema de códigos de erro seriados para AgroInsight
export enum ErrorCodes {
  // Erros de Autenticação (AUTH-001 a AUTH-099)
  AUTH_001 = 'AUTH-001', // Credenciais inválidas
  AUTH_002 = 'AUTH-002', // Usuário não encontrado
  AUTH_003 = 'AUTH-003', // Senha incorreta
  AUTH_004 = 'AUTH-004', // Sessão expirada
  AUTH_005 = 'AUTH-005', // Token inválido
  AUTH_006 = 'AUTH-006', // Usuário já existe
  AUTH_007 = 'AUTH-007', // Email inválido
  AUTH_008 = 'AUTH-008', // Senha muito fraca
  AUTH_009 = 'AUTH-009', // Erro ao criar usuário
  AUTH_010 = 'AUTH-010', // Erro de redirecionamento
  AUTH_011 = 'AUTH-011', // Token de reset inválido
  AUTH_012 = 'AUTH-012', // Token de reset expirado
  AUTH_013 = 'AUTH-013', // Erro ao enviar email de reset

  // Erros de Banco de Dados (DB-001 a DB-099)
  DB_001 = 'DB-001', // Conexão com banco falhou
  DB_002 = 'DB-002', // Erro na query
  DB_003 = 'DB-003', // Registro não encontrado
  DB_004 = 'DB-004', // Violação de constraint
  DB_005 = 'DB-005', // Timeout na operação

  // Erros de Upload/Análise (UPLOAD-001 a UPLOAD-099)
  UPLOAD_001 = 'UPLOAD-001', // Arquivo não enviado
  UPLOAD_002 = 'UPLOAD-002', // Formato de arquivo inválido
  UPLOAD_003 = 'UPLOAD-003', // Arquivo muito grande
  UPLOAD_004 = 'UPLOAD-004', // Erro ao processar CSV
  UPLOAD_005 = 'UPLOAD-005', // Dados insuficientes
  UPLOAD_006 = 'UPLOAD-006', // Colunas não identificadas

  // Erros de API (API-001 a API-099)
  API_001 = 'API-001', // Método não permitido
  API_002 = 'API-002', // Dados de entrada inválidos
  API_003 = 'API-003', // Parâmetros obrigatórios ausentes
  API_004 = 'API-004', // Rate limit excedido
  API_005 = 'API-005', // Erro interno do servidor

  // Erros de Permissão (PERM-001 a PERM-099)
  PERM_001 = 'PERM-001', // Acesso negado
  PERM_002 = 'PERM-002', // Permissão insuficiente
  PERM_003 = 'PERM-003', // Recurso não encontrado
  PERM_004 = 'PERM-004', // Operação não permitida

  // Erros de Validação (VAL-001 a VAL-099)
  VAL_001 = 'VAL-001', // Dados obrigatórios ausentes
  VAL_002 = 'VAL-002', // Formato de dados inválido
  VAL_003 = 'VAL-003', // Valor fora do intervalo permitido
  VAL_004 = 'VAL-004', // Tipo de dados incorreto
}

export interface AppError {
  code: ErrorCodes
  message: string
  userMessage: string
  details?: any
  timestamp: string
  context?: string
}

export class ErrorHandler {
  private static errorMessages: Record<ErrorCodes, { message: string; userMessage: string }> = {
    // Erros de Autenticação
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

  static createError(
    code: ErrorCodes,
    details?: any,
    context?: string
  ): AppError {
    const errorInfo = this.errorMessages[code]
    
    return {
      code,
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      details,
      timestamp: new Date().toISOString(),
      context
    }
  }

  static logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      timestamp: error.timestamp,
      context: error.context,
      details: error.details
    })
  }

  static getHttpStatus(code: ErrorCodes): number {
    const statusMap: Record<string, number> = {
      'AUTH': 401,
      'PERM': 403,
      'DB': 500,
      'UPLOAD': 400,
      'API': 400,
      'VAL': 400
    }

    const prefix = code.split('-')[0]
    return statusMap[prefix] || 500
  }
}
