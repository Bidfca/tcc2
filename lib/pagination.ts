/**
 * Pagination Helper
 * 
 * Provides consistent pagination across all API routes
 * Includes metadata for navigation and limits
 */

/**
 * Pagination parameters from request
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  minLimit: 1
} as const

/**
 * Parse pagination parameters from URL search params
 * 
 * @param searchParams - URL search params
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const page = Math.max(
    PAGINATION_DEFAULTS.page,
    parseInt(searchParams.get('page') || String(PAGINATION_DEFAULTS.page))
  )
  
  const rawLimit = parseInt(
    searchParams.get('limit') || String(PAGINATION_DEFAULTS.limit)
  )
  
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(PAGINATION_DEFAULTS.minLimit, rawLimit)
  )
  
  const sortBy = searchParams.get('sortBy') || undefined
  const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  
  return {
    page,
    limit,
    sortBy,
    sortOrder
  }
}

/**
 * Calculate pagination metadata
 * 
 * @param total - Total number of items
 * @param page - Current page
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Generic pagination function for Prisma models
 * 
 * @param model - Prisma model
 * @param params - Pagination parameters
 * @param where - Where clause
 * @param include - Include relations
 * @param select - Select specific fields
 * @returns Paginated response
 */
export async function paginate<T>(
  model: {
    findMany: (args: unknown) => Promise<T[]>
    count: (args: unknown) => Promise<number>
  },
  params: PaginationParams,
  options?: {
    where?: Record<string, unknown>
    include?: Record<string, boolean | object>
    select?: Record<string, boolean>
    orderBy?: Record<string, 'asc' | 'desc'> | Record<string, unknown>[]
  }
): Promise<PaginatedResponse<T>> {
  const page = params.page || PAGINATION_DEFAULTS.page
  const limit = params.limit || PAGINATION_DEFAULTS.limit
  const skip = (page - 1) * limit
  
  // Build order by clause
  let orderBy = options?.orderBy
  if (params.sortBy) {
    orderBy = {
      [params.sortBy]: params.sortOrder || 'desc'
    }
  }
  
  // Execute queries in parallel
  const [data, total] = await Promise.all([
    model.findMany({
      where: options?.where,
      include: options?.include,
      select: options?.select,
      skip,
      take: limit,
      orderBy
    }),
    model.count({ where: options?.where })
  ])
  
  const meta = calculatePaginationMeta(total, page, limit)
  
  return {
    data: data as T[],
    meta
  }
}

/**
 * Build pagination response with custom data
 * Useful when data is already fetched
 * 
 * @param data - Array of items
 * @param total - Total count
 * @param params - Pagination parameters
 * @returns Paginated response
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const page = params.page || PAGINATION_DEFAULTS.page
  const limit = params.limit || PAGINATION_DEFAULTS.limit
  
  const meta = calculatePaginationMeta(total, page, limit)
  
  return {
    data,
    meta
  }
}

/**
 * Extract pagination info from request
 * Helper for Next.js API routes
 * 
 * @param request - Next.js request
 * @returns Pagination parameters
 */
export function getPaginationFromRequest(request: Request): PaginationParams {
  const url = new URL(request.url)
  return parsePaginationParams(url.searchParams)
}
