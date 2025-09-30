import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { APIError, APIResponse, ERROR_CODES } from '../types/api'
import { ErrorHandler, withErrorHandling } from '../utils/error-handler'
import { logger, LogContext } from '../utils/logger'

export abstract class BaseController {
  /**
   * Validate request body against a Zod schema
   */
  protected async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      throw ErrorHandler.validationError('Invalid request body', error)
    }
  }

  /**
   * Validate query parameters against a Zod schema
   */
  protected validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): T {
    try {
      const { searchParams } = new URL(request.url)
      const query = Object.fromEntries(searchParams.entries())
      return schema.parse(query)
    } catch (error) {
      throw ErrorHandler.validationError('Invalid query parameters', error)
    }
  }

  /**
   * Create a success response
   */
  protected success<T>(data: T, status: number = 200): NextResponse<APIResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }, { status })
  }

  /**
   * Create an error response (deprecated - use ErrorHandler instead)
   * @deprecated Use ErrorHandler.handleError() instead
   */
  public error(
    code: string,
    message: string,
    status: number = 400,
    details?: any
  ): NextResponse<APIResponse<null>> {
    logger.warn('Using deprecated error method, consider using ErrorHandler', {
      code,
      message,
      status
    })
    
    return NextResponse.json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, { status })
  }

  /**
   * Handle async operations with comprehensive error handling
   */
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    request?: NextRequest,
    context?: LogContext
  ): Promise<NextResponse<APIResponse<T>> | NextResponse<APIResponse<null>>> {
    return withErrorHandling(async () => {
      const startTime = Date.now()
      
      try {
        const result = await operation()
        
        // Log successful operation
        if (request && context) {
          const duration = Date.now() - startTime
          logger.info('Controller operation completed', {
            ...context,
            duration,
            success: true
          })
        }
        
        return result
      } catch (error) {
        // Log operation failure
        if (request && context) {
          const duration = Date.now() - startTime
          logger.error('Controller operation failed', error as Error, {
            ...context,
            duration,
            success: false
          })
        }
        
        throw error
      }
    }, request)
  }

  /**
   * Require authentication and return user ID
   */
  protected requireAuth(session: any): string {
    if (!session?.user?.id) {
      throw ErrorHandler.unauthorizedError('Authentication required')
    }
    return session.user.id
  }

  /**
   * Check if user has required permissions
   */
  protected requirePermission(session: any, permission: string): void {
    if (!session?.user) {
      throw ErrorHandler.unauthorizedError('Authentication required')
    }
    
    // Add permission checking logic here if needed
    // For now, just ensure user is authenticated
  }

  /**
   * Validate resource ownership
   */
  protected async validateOwnership(
    userId: string,
    resourceUserId: string,
    resourceType: string = 'resource'
  ): Promise<void> {
    if (userId !== resourceUserId) {
      logger.securityEvent('Unauthorized resource access attempt', {
        userId,
        resourceUserId,
        resourceType
      })
      throw ErrorHandler.forbiddenError(`Access denied to ${resourceType}`)
    }
  }

  /**
   * Extract request context for logging
   */
  protected getRequestContext(request: NextRequest, additionalContext?: LogContext): LogContext {
    return {
      method: request.method,
      endpoint: new URL(request.url).pathname,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      ...additionalContext
    }
  }
}