/**
 * Tipos TypeScript para APIs e modelos
 * Substitui uso de 'any' com tipos apropriados
 */

// ==================== User Types ====================

export interface UserDTO {
  id: string
  email: string
  name?: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface CreateUserInput {
  email: string
  password: string
  name?: string
  role?: 'USER' | 'ADMIN'
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  role?: 'USER' | 'ADMIN'
}

// ==================== Project Types ====================

export interface ProjectDTO {
  id: string
  name: string
  description?: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
}

// ==================== Dataset Types ====================

export type DatasetStatus = 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'VALIDATED' 
  | 'APPROVED' 
  | 'REJECTED'

export interface VariableInfo {
  name: string
  type: 'Quantitativa Contínua' | 'Quantitativa Discreta' | 'Qualitativa Nominal' | 'Qualitativa Ordinal'
  detectedType: 'number' | 'string' | 'boolean' | 'date'
  hasDecimals?: boolean
  uniqueValues: number
  nullCount: number
  isZootechnical: boolean
  category?: string
  sampleValues?: (string | number)[]
}

export interface NumericStats {
  count: number
  validCount: number
  missingCount: number
  mean: number
  median: number
  mode?: number
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
  cv: number
  skewness?: number
  outliers: number[]
}

export interface CategoricalStats {
  count: number
  unique: number
  distribution: Record<string, number>
  frequencies: Record<string, number>
  entropy: number
  mode: string
}

export interface DatasetData {
  rawData?: Record<string, unknown>[]
  variablesInfo: Record<string, VariableInfo>
  numericStats: Record<string, NumericStats>
  categoricalStats: Record<string, CategoricalStats>
  zootechnicalVariables?: string[]
}

export interface DatasetMetadata {
  uploadedBy: string
  uploadedAt: string
  fileSize: number
  totalRows: number
  totalColumns: number
  validRows: number
  zootechnicalCount?: number
}

export interface DatasetDTO {
  id: string
  projectId: string
  name: string
  filename: string
  status: DatasetStatus
  data: DatasetData
  metadata: DatasetMetadata
  createdAt: string
  updatedAt: string
}

// ==================== Analysis Types ====================

export interface DiagnosticoVariavel {
  variavel: string
  valor: string
  status: 'Bom' | 'Atenção' | 'Crítico'
  interpretacao: string
}

export interface Diagnostico {
  resumo: string
  analises: DiagnosticoVariavel[]
  pontosFortes: string[]
  pontosAtencao: string[]
  recomendacoes: string[]
  conclusao: string
  fontes: string[]
}

// ==================== Reference Types ====================

export interface ArticleAuthor {
  name: string
  affiliation?: string
}

export interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'scielo' | 'crossref' | 'manual'
  doi?: string
  issn?: string
  volume?: string
  issue?: string
  pages?: string
  keywords?: string[]
  language?: string
  pdfUrl?: string
  citationsCount?: number
  publishedDate?: string
  saved?: boolean
}

export interface SavedReferenceDTO extends Article {
  userId: string
  tags: string
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SearchArticlesInput {
  query: string
  source?: 'all' | 'scielo' | 'crossref'
  page?: number
  pageSize?: number
  yearFrom?: number
  yearTo?: number
  language?: 'pt' | 'en' | 'es' | 'all'
}

export interface SearchArticlesResponse {
  success: boolean
  articles: Article[]
  page: number
  pageSize: number
  hasMore: boolean
  total: number
  query: string
  source: string
  message: string
  cached?: boolean
}

// ==================== Validation Types ====================

export type ValidationRule = 
  | 'REQUIRED' 
  | 'MIN_VALUE' 
  | 'MAX_VALUE' 
  | 'RANGE' 
  | 'PATTERN' 
  | 'CUSTOM'

export type ValidationStatus = 
  | 'PENDING' 
  | 'PASSED' 
  | 'FAILED' 
  | 'REVIEWED'

export interface DataValidationDTO {
  id: string
  datasetId: string
  field: string
  rule: ValidationRule
  value?: string | null
  status: ValidationStatus
  message?: string | null
  createdAt: string
  updatedAt: string
}

// ==================== Audit Types ====================

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'REJECT'
  | 'LOGIN'
  | 'LOGOUT'

export interface AuditLogDTO {
  id: string
  userId: string
  action: AuditAction
  resource: string
  resourceId: string
  changes?: Record<string, unknown> | null
  createdAt: string
}

export interface CreateAuditLogInput {
  userId: string
  action: AuditAction
  resource: string
  resourceId: string
  changes?: Record<string, unknown>
}

// ==================== Cache Types ====================

export interface CachedData<T> {
  data: T
  cachedAt: number
  expiresAt: number
}

export interface CacheOptions {
  ttl?: number // Time to live em segundos
  key?: string
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  cached?: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface ErrorResponse {
  error: string
  details?: string
  code?: string
  timestamp?: string
}

// ==================== File Upload Types ====================

export interface FileUploadMetadata {
  originalName: string
  size: number
  mimeType: string
  uploadedAt: string
  uploadedBy: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
  metadata?: FileUploadMetadata
}

// ==================== Auth Types ====================

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string | null
    role: string
  }
  expires: string
}

// ==================== Rate Limit Types ====================

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
  'Retry-After'?: string
}

// ==================== Zootechnical Calculation Types ====================

export interface ConversionResult {
  value: number
  unit: string
  originalValue: number
  originalUnit: string
}

export interface ZootechnicalMetrics {
  peso?: number
  ganho_peso_diario?: number
  conversao_alimentar?: number
  taxa_nascimento?: number
  taxa_desmame?: number
  mortalidade?: number
}

// ==================== Helper Types ====================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// ==================== Service Response Types ====================

export interface ServiceResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

// Usar Promise explicitamente para compatibilidade
export type ServiceResult<T> = Promise<ServiceResponse<T>>
