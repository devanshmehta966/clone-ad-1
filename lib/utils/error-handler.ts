import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { APIError, ERROR_CODES, APIResponse } from '../types/api'
import { logger, LogContext } from './logger'
import { errorMonitor } from './error-monitoring'

export interface ErrorHandlerOptions {
  logError?: boolean
  includeStack?: boolean
  customMessage?: string
}

export class ErrorHandler {
  /**
   * Handle and format errors for API responses
   */
  static handleError(
    error: unknown,
    request?: NextRequest,
    options: ErrorHandlerOptions = {}
  ): NextResponse<APIResponse<null>> {
    const { logError = true, includeStack = false, customMessage } = options
    
    // Extract request context for logging
    const context: LogContext = {}
    if (request) {
      context.method = request.method
      context.endpoint = new URL(request.url).pathname
      context.userAgent = request.headers.get('user-agent') || undefined
      context.ip = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
    }

    // Handle different error types
    if (error instanceof APIError) {
      if (logError) {
        logger.apiError(
          context.method || 'UNKNOWN',
          context.endpoint || 'unknown',
          error,
          context
        )
      }
      
      // Record error in monitoring system
      errorMonitor.recordError(error, context.endpoint)
      
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: customMessage || error.message,
          details: includeStack ? error.details : undefined,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }, { status: error.status })
    }

    if (error instanceof ZodError) {
      const validationError = new APIError(
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        400,
        error.errors
      )
      
      if (logError) {
        logger.apiError(
          context.method || 'UNKNOWN',
          context.endpoint || 'unknown',
          validationError,
          context
        )
      }
      
      return NextResponse.json({
        success: false,
        error: {
          code: validationError.code,
          message: customMessage || validationError.message,
          details: includeStack ? error.errors : undefined,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const { code, message, status } = this.handlePrismaError(error)
      const prismaError = new APIError(code, message, status)
      
      if (logError) {
        logger.dbError(
          error.message,
          prismaError,
          { ...context, prismaCode: error.code }
        )
      }
      
      return NextResponse.json({
        success: false,
        error: {
          code: prismaError.code,
          message: customMessage || prismaError.message,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }, { status: prismaError.status })
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      const dbError = new APIError(
        ERROR_CODES.DATABASE_ERROR,
        'Database operation failed',
        500
      )
      
      if (logError) {
        logger.dbError('Unknown Prisma error', dbError, context)
      }
      
      return NextResponse.json({
        success: false,
        error: {
          code: dbError.code,
          message: customMessage || dbError.message,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Handle generic errors
    const genericError = error instanceof Error ? error : new Error('Unknown error')
    const internalError = new APIError(
      ERROR_CODES.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
    
    if (logError) {
      logger.error('Unhandled error in API route', genericError, context)
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: internalError.code,
        message: customMessage || internalError.message,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }

  /**
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    code: string
    message: string
    status: number
  } {
    switch (error.code) {
      case 'P2002':
        return {
          code: ERROR_CODES.ALREADY_EXISTS,
          message: 'A record with this information already exists',
          status: 409
        }
      case 'P2025':
        return {
          code: ERROR_CODES.NOT_FOUND,
          message: 'The requested record was not found',
          status: 404
        }
      case 'P2003':
        return {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Foreign key constraint failed',
          status: 400
        }
      case 'P2004':
        return {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'A constraint failed on the database',
          status: 400
        }
      case 'P1001':
        return {
          code: ERROR_CODES.SERVICE_UNAVAILABLE,
          message: 'Database server is not reachable',
          status: 503
        }
      case 'P1008':
        return {
          code: ERROR_CODES.SERVICE_UNAVAILABLE,
          message: 'Operations timed out',
          status: 503
        }
      default:
        return {
          code: ERROR_CODES.DATABASE_ERROR,
          message: 'Database operation failed',
          status: 500
        }
    }
  }

  /**
   * Async wrapper for API route handlers with automatic error handling
   */
  static async withErrorHandling<T>(
    handler: () => Promise<T>,
    request?: NextRequest,
    options?: ErrorHandlerOptions
  ): Promise<NextResponse<APIResponse<T>> | NextResponse<APIResponse<null>>> {
    try {
      const result = await handler()
      return NextResponse.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return this.handleError(error, request, options)
    }
  }

  /**
   * Create standardized error responses
   */
  static createError(
    code: string,
    message: string,
    status: number = 400,
    details?: any
  ): APIError {
    return new APIError(code, message, status, details)
  }

  /**
   * Validation error helper
   */
  static validationError(message: string, details?: any): APIError {
    return new APIError(ERROR_CODES.VALIDATION_ERROR, message, 400, details)
  }

  /**
   * Not found error helper
   */
  static notFoundError(resource: string = 'Resource'): APIError {
    return new APIError(
      ERROR_CODES.NOT_FOUND,
      `${resource} not found`,
      404
    )
  }

  /**
   * Unauthorized error helper
   */
  static unauthorizedError(message: string = 'Unauthorized'): APIError {
    return new APIError(ERROR_CODES.UNAUTHORIZED, message, 401)
  }

  /**
   * Forbidden error helper
   */
  static forbiddenError(message: string = 'Forbidden'): APIError {
    return new APIError(ERROR_CODES.FORBIDDEN, message, 403)
  }

  /**
   * Rate limit error helper
   */
  static rateLimitError(message: string = 'Rate limit exceeded'): APIError {
    return new APIError(ERROR_CODES.RATE_LIMIT_EXCEEDED, message, 429)
  }
}

/**
 * Utility function for wrapping async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  request?: NextRequest,
  options?: ErrorHandlerOptions
): Promise<NextResponse<APIResponse<T>> | NextResponse<APIResponse<null>>> {
  return ErrorHandler.withErrorHandling(operation, request, options)
}

/**
 * Middleware for request/response logging
 */
export function withRequestLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now()
    const method = request.method
    const endpoint = new URL(request.url).pathname
    
    // Log request
    logger.apiRequest(method, endpoint, {
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown'
    })
    
    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - startTime
      
      // Log response
      logger.apiResponse(method, endpoint, response.status, duration)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error
      logger.apiError(method, endpoint, error as Error, { duration })
      
      throw error
    }
  }
}