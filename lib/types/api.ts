export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIErrorResponse
  timestamp: string
}

export interface APIErrorResponse {
  code: string
  message: string
  details?: any
  timestamp: string
}

export class APIError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly details?: any

  constructor(code: string, message: string, status: number = 400, details?: any) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// Common error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  INTEGRATION_NOT_FOUND: 'INTEGRATION_NOT_FOUND',

  // Conflicts
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  USER_EXISTS: 'USER_EXISTS',
  CLIENT_EXISTS: 'CLIENT_EXISTS',
  EMAIL_CONFLICT: 'EMAIL_CONFLICT',

  // Business Logic
  INTEGRATION_INACTIVE: 'INTEGRATION_INACTIVE',
  SYNC_FAILED: 'SYNC_FAILED',
  INVALID_STATE: 'INVALID_STATE',
  EXPIRED_STATE: 'EXPIRED_STATE',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Pagination interface
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResponse {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationResponse
}

// Common query interfaces
export interface DateRangeQuery {
  startDate: string
  endDate: string
}

export interface SearchQuery {
  search?: string
}

export interface SortQuery {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}