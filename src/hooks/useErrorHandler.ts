'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { showErrorToast } from '../components/error/ErrorToast'
import { shouldRedirectToLogin } from '../../lib/utils/error-messages'

interface APIError {
  code: string
  message: string
  details?: any
}

interface UseErrorHandlerOptions {
  redirectOnAuth?: boolean
  showToast?: boolean
  onError?: (error: APIError) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { redirectOnAuth = true, showToast = true, onError } = options
  const router = useRouter()

  const handleError = useCallback((error: unknown, retryFn?: () => void) => {
    let apiError: APIError

    // Parse different error formats
    if (typeof error === 'object' && error !== null) {
      if ('code' in error && 'message' in error) {
        // Already an API error
        apiError = error as APIError
      } else if ('response' in error && typeof (error as any).response === 'object') {
        // Fetch response error
        const response = (error as any).response
        if (response.error) {
          apiError = response.error
        } else {
          apiError = {
            code: 'FETCH_ERROR',
            message: response.message || 'Network request failed'
          }
        }
      } else if (error instanceof Error) {
        // Generic Error object
        apiError = {
          code: 'CLIENT_ERROR',
          message: error.message
        }
      } else {
        // Unknown error format
        apiError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred'
        }
      }
    } else {
      // Primitive error
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: String(error)
      }
    }

    // Call custom error handler
    onError?.(apiError)

    // Handle authentication errors
    if (redirectOnAuth && shouldRedirectToLogin(apiError.code)) {
      router.push('/signin')
      return
    }

    // Show toast notification
    if (showToast) {
      showErrorToast(apiError, {
        onRetry: retryFn
      })
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', apiError)
    }
  }, [redirectOnAuth, showToast, onError, router])

  return { handleError }
}

// Specialized hook for API requests
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler()

  const handleApiError = useCallback(async (
    response: Response,
    retryFn?: () => void
  ) => {
    try {
      const errorData = await response.json()
      handleError(errorData, retryFn)
    } catch (parseError) {
      // If we can't parse the error response, create a generic error
      handleError({
        code: 'API_ERROR',
        message: `Request failed with status ${response.status}`
      }, retryFn)
    }
  }, [handleError])

  return { handleApiError, handleError }
}

// Hook for handling async operations with error handling
export function useAsyncErrorHandler() {
  const { handleError } = useErrorHandler()

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: APIError) => void
      retryFn?: () => void
    }
  ): Promise<T | null> => {
    try {
      const result = await operation()
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      if (options?.onError) {
        // Parse error and call custom handler
        let apiError: APIError
        if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
          apiError = error as APIError
        } else {
          apiError = {
            code: 'OPERATION_ERROR',
            message: error instanceof Error ? error.message : 'Operation failed'
          }
        }
        options.onError(apiError)
      } else {
        // Use default error handling
        handleError(error, options?.retryFn)
      }
      return null
    }
  }, [handleError])

  return { executeWithErrorHandling }
}