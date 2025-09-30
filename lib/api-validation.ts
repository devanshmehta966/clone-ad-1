import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { InputSanitizer } from './security'

// API Error class for consistent error handling
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Request validation options
interface ValidationOptions {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
  requireAuth?: boolean
  requiredRole?: string
  sanitizeInputs?: boolean
}

// Validated request type
export interface ValidatedRequest extends NextRequest {
  validatedBody?: any
  validatedQuery?: any
  validatedParams?: any
  user?: {
    id: string
    email: string
    role: string
  }
}

// API route wrapper with validation
export function withValidation(
  handler: (req: ValidatedRequest) => Promise<NextResponse>,
  options: ValidationOptions = {}
) {
  return async (req: NextRequest, context?: { params?: any }): Promise<NextResponse> => {
    try {
      const validatedReq = req as ValidatedRequest

      // Authentication check
      if (options.requireAuth !== false) {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
          return NextResponse.json(
            { 
              error: 'Authentication required',
              code: 'UNAUTHORIZED'
            },
            { status: 401 }
          )
        }

        // Role-based access control
        if (options.requiredRole && (session.user as any).role !== options.requiredRole) {
          return NextResponse.json(
            { 
              error: 'Insufficient permissions',
              code: 'FORBIDDEN'
            },
            { status: 403 }
          )
        }

        validatedReq.user = {
          id: (session.user as any).id,
          email: session.user.email!,
          role: (session.user as any).role
        }
      }

      // Validate and sanitize request body
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.json()
          
          if (options.sanitizeInputs) {
            sanitizeObject(body)
          }
          
          validatedReq.validatedBody = options.body.parse(body)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid request body',
                code: 'VALIDATION_ERROR',
                details: error.errors
              },
              { status: 400 }
            )
          }
          throw error
        }
      }

      // Validate query parameters
      if (options.query) {
        try {
          const query = Object.fromEntries(req.nextUrl.searchParams.entries())
          
          if (options.sanitizeInputs) {
            sanitizeObject(query)
          }
          
          validatedReq.validatedQuery = options.query.parse(query)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid query parameters',
                code: 'VALIDATION_ERROR',
                details: error.errors
              },
              { status: 400 }
            )
          }
          throw error
        }
      }

      // Validate route parameters
      if (options.params && context?.params) {
        try {
          if (options.sanitizeInputs) {
            sanitizeObject(context.params)
          }
          
          validatedReq.validatedParams = options.params.parse(context.params)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Invalid route parameters',
                code: 'VALIDATION_ERROR',
                details: error.errors
              },
              { status: 400 }
            )
          }
          throw error
        }
      }

      // Call the actual handler
      return await handler(validatedReq)

    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof APIError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            ...(error.details && { details: error.details })
          },
          { status: error.statusCode }
        )
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors
          },
          { status: 400 }
        )
      }

      // Generic server error
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// Sanitize object recursively
function sanitizeObject(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return

  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = InputSanitizer.sanitizeString(obj[key])
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key])
    }
  }
}

// Common validation schemas
export const commonSchemas = {
  id: z.string().cuid(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  url: z.string().url().max(500),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }),
  search: z.object({
    q: z.string().max(100).optional(),
    sort: z.enum(['asc', 'desc']).default('desc'),
    sortBy: z.string().max(50).optional()
  })
}

// Rate limiting decorator
export function withRateLimit(rateLimiter: any) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value
    
    descriptor.value = async function (req: NextRequest, ...args: any[]) {
      try {
        await rateLimiter.checkRateLimit(req)
        return await method.apply(this, [req, ...args])
      } catch (error: any) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code || 'RATE_LIMIT_EXCEEDED'
          },
          { status: error.statusCode || 429 }
        )
      }
    }
  }
}

// CSRF protection helper
export async function validateCSRF(req: NextRequest): Promise<boolean> {
  if (req.method === 'GET') return true
  
  const token = req.headers.get('x-csrf-token')
  const sessionToken = req.cookies.get('next-auth.csrf-token')?.value
  
  if (!token || !sessionToken) return false
  
  return token === sessionToken
}

// Content type validation
export function validateContentType(req: NextRequest, expectedType: string): boolean {
  const contentType = req.headers.get('content-type')
  return contentType?.includes(expectedType) || false
}

// File upload validation
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().max(255),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
    type: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(type),
      'Invalid file type'
    )
  })
})

// IP whitelist validation
export function validateIPWhitelist(req: NextRequest, whitelist: string[]): boolean {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  
  return whitelist.includes(ip) || whitelist.includes('*')
}