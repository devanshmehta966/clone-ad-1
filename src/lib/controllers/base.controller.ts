import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { APIError, APIResponse } from '../types/api'

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
      throw new APIError('VALIDATION_ERROR', 'Invalid request body', 400, error)
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
      throw new APIError('VALIDATION_ERROR', 'Invalid query parameters', 400, error)
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
   * Create an error response
   */
  public error(
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

  /**
   * Handle async operations with error catching
   */
  protected async handleRequest<T>(
    operation: () => Promise<T>
  ): Promise<NextResponse<APIResponse<T>> | NextResponse<APIResponse<null>>> {
    try {
      const result = await operation()
      return this.success(result)
    } catch (error) {
      if (error instanceof APIError) {
        return this.error(error.code, error.message, error.status, error.details)
      }
      
      console.error('Unexpected error:', error)
      return this.error(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        500
      )
    }
  }
}