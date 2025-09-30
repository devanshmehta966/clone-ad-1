import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { ErrorHandler, withRequestLogging } from './error-handler'
import { logger } from './logger'
import { APIResponse } from '../types/api'

interface RouteHandlerOptions {
  requireAuth?: boolean
  logRequests?: boolean
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
}

/**
 * Wrapper for API route handlers with comprehensive error handling, logging, and middleware
 */
export function createRouteHandler(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: RouteHandlerOptions = {}
) {
  const { requireAuth = true, logRequests = true, rateLimit } = options

  return async (request: NextRequest, context: any = {}): Promise<NextResponse> => {
    const startTime = Date.now()
    const method = request.method
    const endpoint = new URL(request.url).pathname

    try {
      // Rate limiting (if configured)
      if (rateLimit) {
        // Note: In a production environment, you'd want to use Redis or similar
        // This is a basic in-memory implementation for demonstration
        const rateLimitResult = await checkRateLimit(request, rateLimit)
        if (!rateLimitResult.allowed) {
          logger.rateLimitExceeded(endpoint, rateLimitResult.ip)
          throw ErrorHandler.rateLimitError('Too many requests. Please try again later.')
        }
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          logger.securityEvent('Unauthorized API access attempt', {
            endpoint,
            method,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          })
          throw ErrorHandler.unauthorizedError('Authentication required')
        }
        context.session = session
      }

      // Request logging
      if (logRequests) {
        logger.apiRequest(method, endpoint, {
          userId: context.session?.user?.id,
          userAgent: request.headers.get('user-agent') || undefined,
          ip: request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown'
        })
      }

      // Execute the handler
      const response = await handler(request, context)
      
      // Response logging
      if (logRequests) {
        const duration = Date.now() - startTime
        logger.apiResponse(method, endpoint, response.status, duration, {
          userId: context.session?.user?.id
        })
      }

      // Record successful request in monitoring
      const { errorMonitor } = await import('./error-monitoring')
      errorMonitor.recordRequest()

      return response

    } catch (error) {
      // Error logging and handling
      const duration = Date.now() - startTime
      logger.apiError(method, endpoint, error as Error, {
        userId: context.session?.user?.id,
        duration
      })

      return ErrorHandler.handleError(error, request)
    }
  }
}

/**
 * Basic rate limiting implementation
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

async function checkRateLimit(
  request: NextRequest,
  config: { windowMs: number; maxRequests: number }
): Promise<{ allowed: boolean; ip: string }> {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  
  const now = Date.now()
  const key = `${ip}:${new URL(request.url).pathname}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { allowed: true, ip }
  }
  
  if (current.count >= config.maxRequests) {
    return { allowed: false, ip }
  }
  
  // Increment count
  current.count++
  rateLimitStore.set(key, current)
  
  return { allowed: true, ip }
}

/**
 * Utility for creating standardized API responses
 */
export class APIResponseBuilder {
  static success<T>(data: T, status: number = 200): NextResponse<APIResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static error(
    code: string,
    message: string,
    status: number = 400,
    details?: any
  ): NextResponse<APIResponse<null>> {
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

  static created<T>(data: T): NextResponse<APIResponse<T>> {
    return this.success(data, 201)
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }
}

/**
 * Middleware for adding CORS headers
 */
export function withCORS(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

/**
 * Middleware for adding security headers
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

/**
 * Example usage:
 * 
 * export const GET = createRouteHandler(async (request, { session }) => {
 *   const data = await someService.getData(session.user.id)
 *   return APIResponseBuilder.success(data)
 * }, {
 *   requireAuth: true,
 *   logRequests: true,
 *   rateLimit: { windowMs: 60000, maxRequests: 100 }
 * })
 */