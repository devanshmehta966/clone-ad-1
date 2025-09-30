import { ERROR_CODES } from '../types/api'

/**
 * User-friendly error messages for different error codes
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication & Authorization
  [ERROR_CODES.UNAUTHORIZED]: 'Please sign in to access this feature.',
  [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication token. Please sign in again.',

  // Validation
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.INVALID_INPUT]: 'The information you entered is not valid.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',

  // Resources
  [ERROR_CODES.NOT_FOUND]: 'The requested item could not be found.',
  [ERROR_CODES.USER_NOT_FOUND]: 'User account not found.',
  [ERROR_CODES.CLIENT_NOT_FOUND]: 'Client not found.',
  [ERROR_CODES.REPORT_NOT_FOUND]: 'Report not found.',
  [ERROR_CODES.INTEGRATION_NOT_FOUND]: 'Integration not found.',

  // Conflicts
  [ERROR_CODES.ALREADY_EXISTS]: 'This item already exists.',
  [ERROR_CODES.USER_EXISTS]: 'An account with this email already exists.',
  [ERROR_CODES.CLIENT_EXISTS]: 'A client with this information already exists.',
  [ERROR_CODES.EMAIL_CONFLICT]: 'This email address is already in use.',

  // Business Logic
  [ERROR_CODES.INTEGRATION_INACTIVE]: 'This integration is not active. Please reconnect it in settings.',
  [ERROR_CODES.SYNC_FAILED]: 'Failed to sync data. Please try again later.',
  [ERROR_CODES.INVALID_STATE]: 'Invalid request state. Please try again.',
  [ERROR_CODES.EXPIRED_STATE]: 'This request has expired. Please try again.',

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'You\'re making requests too quickly. Please slow down.',

  // Server Errors
  [ERROR_CODES.INTERNAL_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ERROR_CODES.DATABASE_ERROR]: 'We\'re having trouble accessing your data. Please try again.',
  [ERROR_CODES.EXTERNAL_API_ERROR]: 'We\'re having trouble connecting to external services. Please try again later.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'This service is temporarily unavailable. Please try again later.'
}

/**
 * Get user-friendly error message for an error code
 */
export function getUserFriendlyMessage(errorCode: string, fallback?: string): string {
  return ERROR_MESSAGES[errorCode] || fallback || 'An unexpected error occurred. Please try again.'
}

/**
 * Error message categories for different contexts
 */
export const ERROR_CATEGORIES = {
  AUTHENTICATION: [
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
    ERROR_CODES.INVALID_CREDENTIALS,
    ERROR_CODES.TOKEN_EXPIRED,
    ERROR_CODES.INVALID_TOKEN
  ],
  VALIDATION: [
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CODES.INVALID_INPUT,
    ERROR_CODES.MISSING_REQUIRED_FIELD
  ],
  NOT_FOUND: [
    ERROR_CODES.NOT_FOUND,
    ERROR_CODES.USER_NOT_FOUND,
    ERROR_CODES.CLIENT_NOT_FOUND,
    ERROR_CODES.REPORT_NOT_FOUND,
    ERROR_CODES.INTEGRATION_NOT_FOUND
  ],
  CONFLICT: [
    ERROR_CODES.ALREADY_EXISTS,
    ERROR_CODES.USER_EXISTS,
    ERROR_CODES.CLIENT_EXISTS,
    ERROR_CODES.EMAIL_CONFLICT
  ],
  BUSINESS_LOGIC: [
    ERROR_CODES.INTEGRATION_INACTIVE,
    ERROR_CODES.SYNC_FAILED,
    ERROR_CODES.INVALID_STATE,
    ERROR_CODES.EXPIRED_STATE
  ],
  RATE_LIMIT: [
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    ERROR_CODES.TOO_MANY_REQUESTS
  ],
  SERVER: [
    ERROR_CODES.INTERNAL_ERROR,
    ERROR_CODES.DATABASE_ERROR,
    ERROR_CODES.EXTERNAL_API_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE
  ]
}

/**
 * Get error category for an error code
 */
export function getErrorCategory(errorCode: string): string | null {
  for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
    if (codes.some(code => code === errorCode)) {
      return category
    }
  }
  return null
}

/**
 * Check if error should trigger a retry suggestion
 */
export function shouldSuggestRetry(errorCode: string): boolean {
  const retryableCategories = ['SERVER', 'RATE_LIMIT', 'BUSINESS_LOGIC']
  const category = getErrorCategory(errorCode)
  return category ? retryableCategories.includes(category) : false
}

/**
 * Check if error should redirect to login
 */
export function shouldRedirectToLogin(errorCode: string): boolean {
  const authErrorCodes = [
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.TOKEN_EXPIRED,
    ERROR_CODES.INVALID_TOKEN
  ]
  return authErrorCodes.some(code => code === errorCode)
}

/**
 * Get suggested actions for an error
 */
export function getSuggestedActions(errorCode: string): string[] {
  const actions: string[] = []
  
  if (shouldRedirectToLogin(errorCode)) {
    actions.push('Sign in to your account')
  }
  
  if (shouldSuggestRetry(errorCode)) {
    actions.push('Try again in a few moments')
  }
  
  const category = getErrorCategory(errorCode)
  
  switch (category) {
    case 'VALIDATION':
      actions.push('Check your input and correct any errors')
      break
    case 'NOT_FOUND':
      actions.push('Verify the item exists and you have access to it')
      break
    case 'CONFLICT':
      actions.push('Use different information or update the existing item')
      break
    case 'BUSINESS_LOGIC':
      actions.push('Check your integrations and settings')
      break
  }
  
  if (actions.length === 0) {
    actions.push('Contact support if the problem persists')
  }
  
  return actions
}