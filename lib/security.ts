import { NextRequest, NextResponse } from 'next/server'
// Import environment variables directly to avoid validation during build
const isProduction = process.env.NODE_ENV === 'production'

// Security headers configuration
export const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://connect.facebook.net https://platform.linkedin.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.google.com https://graph.facebook.com https://api.linkedin.com",
    "frame-src 'self' https://accounts.google.com https://www.facebook.com https://platform.linkedin.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // HSTS (only in production)
  ...(isProduction && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  })
}

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  
  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  static validateToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false
    if (token.length !== this.TOKEN_LENGTH * 2) return false
    return token === sessionToken
  }
  
  static getTokenFromRequest(request: NextRequest): string | null {
    // Check header first
    const headerToken = request.headers.get('x-csrf-token')
    if (headerToken) return headerToken
    
    // Check form data for POST requests
    if (request.method === 'POST') {
      const formData = request.nextUrl.searchParams.get('csrf_token')
      if (formData) return formData
    }
    
    return null
  }
}

// CORS configuration
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [process.env.NEXTAUTH_URL || 'http://localhost:3000']
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else if (!isProduction) {
    // Allow all origins in development
    headers['Access-Control-Allow-Origin'] = '*'
  }
  
  return headers
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Validate request origin
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  if (!origin && !referer) {
    // Allow requests without origin/referer in development
    return !isProduction
  }
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [process.env.NEXTAUTH_URL || 'http://localhost:3000']
  
  if (origin && allowedOrigins.includes(origin)) return true
  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) return true
  
  return false
}

// Input sanitization helpers
export class InputSanitizer {
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }
  
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }
  
  static sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null
      }
      return parsed.toString()
    } catch {
      return null
    }
  }
}