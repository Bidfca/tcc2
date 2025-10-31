import { logger } from '@/lib/logger'

/**
 * Limites de tamanho de arquivo por tipo
 */
export const FILE_SIZE_LIMITS = {
  CSV: 50 * 1024 * 1024, // 50 MB
  PDF: 10 * 1024 * 1024, // 10 MB
  IMAGE: 5 * 1024 * 1024, // 5 MB
  GENERAL: 100 * 1024 * 1024, // 100 MB
} as const

/**
 * Tipos MIME permitidos por categoria
 */
export const ALLOWED_MIME_TYPES = {
  CSV: ['text/csv', 'application/csv', 'text/plain'],
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const

/**
 * Extensões permitidas por categoria
 */
export const ALLOWED_EXTENSIONS = {
  CSV: ['.csv', '.txt'],
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENT: ['.pdf', '.doc', '.docx'],
} as const

/**
 * Interface de resultado de validação
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
  details?: {
    size: number
    maxSize: number
    type: string
    extension: string
  }
}

/**
 * Converte bytes para formato legível
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Extrai a extensão do arquivo
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : ''
}

/**
 * Valida tamanho do arquivo
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number
): FileValidationResult {
  if (fileSize > maxSize) {
    logger.warn(`Arquivo excede o tamanho máximo`, {
      size: formatBytes(fileSize),
      maxSize: formatBytes(maxSize),
    })

    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo permitido: ${formatBytes(maxSize)}`,
      details: {
        size: fileSize,
        maxSize,
        type: '',
        extension: '',
      },
    }
  }

  return { valid: true }
}

/**
 * Valida tipo MIME do arquivo
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: readonly string[]
): FileValidationResult {
  if (!allowedTypes.includes(mimeType)) {
    logger.warn(`Tipo MIME não permitido: ${mimeType}`)

    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`,
      details: {
        size: 0,
        maxSize: 0,
        type: mimeType,
        extension: '',
      },
    }
  }

  return { valid: true }
}

/**
 * Valida extensão do arquivo
 */
export function validateExtension(
  filename: string,
  allowedExtensions: readonly string[]
): FileValidationResult {
  const extension = getFileExtension(filename)

  if (!allowedExtensions.includes(extension)) {
    logger.warn(`Extensão não permitida: ${extension}`)

    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`,
      details: {
        size: 0,
        maxSize: 0,
        type: '',
        extension,
      },
    }
  }

  return { valid: true }
}

/**
 * Validação completa de arquivo CSV
 */
export function validateCSVFile(file: File): FileValidationResult {
  // Validar tamanho
  const sizeValidation = validateFileSize(file.size, FILE_SIZE_LIMITS.CSV)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // Validar tipo MIME
  const mimeValidation = validateMimeType(file.type, ALLOWED_MIME_TYPES.CSV)
  if (!mimeValidation.valid) {
    return mimeValidation
  }

  // Validar extensão
  const extensionValidation = validateExtension(file.name, ALLOWED_EXTENSIONS.CSV)
  if (!extensionValidation.valid) {
    return extensionValidation
  }

  logger.success(`Arquivo CSV validado: ${file.name}`, {
    size: formatBytes(file.size),
    type: file.type,
  })

  return {
    valid: true,
    details: {
      size: file.size,
      maxSize: FILE_SIZE_LIMITS.CSV,
      type: file.type,
      extension: getFileExtension(file.name),
    },
  }
}

/**
 * Validação completa de arquivo de imagem
 */
export function validateImageFile(file: File): FileValidationResult {
  const sizeValidation = validateFileSize(file.size, FILE_SIZE_LIMITS.IMAGE)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  const mimeValidation = validateMimeType(file.type, ALLOWED_MIME_TYPES.IMAGE)
  if (!mimeValidation.valid) {
    return mimeValidation
  }

  const extensionValidation = validateExtension(file.name, ALLOWED_EXTENSIONS.IMAGE)
  if (!extensionValidation.valid) {
    return extensionValidation
  }

  logger.success(`Arquivo de imagem validado: ${file.name}`, {
    size: formatBytes(file.size),
    type: file.type,
  })

  return {
    valid: true,
    details: {
      size: file.size,
      maxSize: FILE_SIZE_LIMITS.IMAGE,
      type: file.type,
      extension: getFileExtension(file.name),
    },
  }
}

/**
 * Validação completa de arquivo PDF
 */
export function validatePDFFile(file: File): FileValidationResult {
  const sizeValidation = validateFileSize(file.size, FILE_SIZE_LIMITS.PDF)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  const mimeValidation = validateMimeType(file.type, ALLOWED_MIME_TYPES.PDF)
  if (!mimeValidation.valid) {
    return mimeValidation
  }

  const extensionValidation = validateExtension(file.name, ALLOWED_EXTENSIONS.PDF)
  if (!extensionValidation.valid) {
    return extensionValidation
  }

  logger.success(`Arquivo PDF validado: ${file.name}`, {
    size: formatBytes(file.size),
    type: file.type,
  })

  return {
    valid: true,
    details: {
      size: file.size,
      maxSize: FILE_SIZE_LIMITS.PDF,
      type: file.type,
      extension: getFileExtension(file.name),
    },
  }
}

/**
 * Validação genérica de arquivo
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: readonly string[]
    allowedExtensions?: readonly string[]
  } = {}
): FileValidationResult {
  const {
    maxSize = FILE_SIZE_LIMITS.GENERAL,
    allowedTypes,
    allowedExtensions,
  } = options

  // Validar tamanho
  const sizeValidation = validateFileSize(file.size, maxSize)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // Validar tipo MIME (se especificado)
  if (allowedTypes) {
    const mimeValidation = validateMimeType(file.type, allowedTypes)
    if (!mimeValidation.valid) {
      return mimeValidation
    }
  }

  // Validar extensão (se especificado)
  if (allowedExtensions) {
    const extensionValidation = validateExtension(file.name, allowedExtensions)
    if (!extensionValidation.valid) {
      return extensionValidation
    }
  }

  logger.success(`Arquivo validado: ${file.name}`, {
    size: formatBytes(file.size),
    type: file.type,
  })

  return {
    valid: true,
    details: {
      size: file.size,
      maxSize,
      type: file.type,
      extension: getFileExtension(file.name),
    },
  }
}

/**
 * Middleware para validar arquivo em rotas API
 */
export async function validateUploadedFile(
  request: Request,
  fieldName: string = 'file',
  validator: (file: File) => FileValidationResult = validateCSVFile
): Promise<{ file: File; validation: FileValidationResult } | Response> {
  try {
    const formData = await request.formData()
    const file = formData.get(fieldName) as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo enviado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const validation = validator(file)

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          details: validation.details,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return { file, validation }
  } catch (error) {
    logger.error('Erro ao validar arquivo', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar arquivo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
