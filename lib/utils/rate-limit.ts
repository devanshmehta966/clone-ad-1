import { NextRequest } from 'next/server'
import { APIError } from '../types/api'
// Import environment variables directly to avoid validation during build
const isProduction = process.env.NODE_ENV === 'production'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  message?: string // Custom error message
}

interface RateLimitEntry {
  count: number
  resetTime: number
  attempts: number // Track failed attempts separately
  blocked: boolean // Track if IP is temporarily blocked
  blockUntil?: number // When the block expires
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Track suspicious IPs for enhanced security
const suspiciousIPs = new Set<string>()

export class RateLimiter {
  private config: RateLimitConfig
  private name: string

  constructor(name: string, config: RateLimitConfig) {
    this.name = name
    this.config = config
  }

  async checkRateLimit(request: NextRequest, isFailedAttempt = false): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request)

    const now = Date.now()
    const entry = rateLimitStore.get(key)

    // Clean up expired entries periodically
    this.cleanupExpiredEntries(now)

    // Check if IP is blocked
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      const blockTimeRemaining = Math.ceil((entry.blockUntil - now) / 1000)
      throw new APIError(
        'IP_TEMPORARILY_BLOCKED',
        `IP temporarily blocked due to suspicious activity. Try again in ${blockTimeRemaining} seconds.`,
        429,
        {
          blocked: true,
          blockTimeRemaining
        }
      )
    }

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        attempts: isFailedAttempt ? 1 : 0,
        blocked: false
      })
      return
    }

    // Check if we should count this request
    const shouldCount = !this.config.skipSuccessfulRequests || 
                       (this.config.skipSuccessfulRequests && isFailedAttempt) ||
                       !this.config.skipFailedRequests ||
                       (this.config.skipFailedRequests && !isFailedAttempt)

    if (shouldCount) {
      entry.count++
    }

    if (isFailedAttempt) {
      entry.attempts++
      
      // Mark IP as suspicious after multiple failed attempts
      if (entry.attempts >= 3) {
        const ip = this.extractIP(key)
        if (ip) {
          suspiciousIPs.add(ip)
        }
      }

      // Temporarily block IP after excessive failed attempts
      if (entry.attempts >= 10) {
        entry.blocked = true
        entry.blockUntil = now + (60 * 60 * 1000) // Block for 1 hour
        rateLimitStore.set(key, entry)
        
        throw new APIError(
          'IP_TEMPORARILY_BLOCKED',
          'IP temporarily blocked due to excessive failed attempts.',
          429,
          {
            blocked: true,
            blockTimeRemaining: 3600
          }
        )
      }
    }

    if (entry.count > this.config.maxRequests) {
      const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000)
      const message = this.config.message || `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`
      
      throw new APIError(
        'RATE_LIMIT_EXCEEDED',
        message,
        429,
        {
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs,
          resetInSeconds,
          attempts: entry.attempts
        }
      )
    }

    rateLimitStore.set(key, entry)
  }

  // Get current rate limit status without incrementing
  async getStatus(request: NextRequest): Promise<{
    remaining: number
    resetTime: number
    totalHits: number
    blocked: boolean
  }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request)

    const now = Date.now()
    const entry = rateLimitStore.get(key)
    
    if (!entry || now > entry.resetTime) {
      return {
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalHits: 0,
        blocked: false
      }
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      totalHits: entry.count,
      blocked: entry.blocked || false
    }
  }

  // Check if IP is suspicious
  static isSuspiciousIP(ip: string): boolean {
    return suspiciousIPs.has(ip)
  }

  // Clear suspicious IP status
  static clearSuspiciousIP(ip: string): void {
    suspiciousIPs.delete(ip)
  }

  private extractIP(key: string): string | null {
    const parts = key.split(':')
    return parts.length > 1 ? parts[parts.length - 1] : null
  }

  private getDefaultKey(request: NextRequest): string {
    // Use IP address as default key
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return `rate_limit:${ip}`
  }

  private cleanupExpiredEntries(now: number): void {
    // Clean up expired entries (run occasionally to prevent memory leaks)
    if (Math.random() < 0.01) { // 1% chance to run cleanup
      const entries = Array.from(rateLimitStore.entries())
      for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
          rateLimitStore.delete(key)
        }
      }
    }
  }
}

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const xClientIp = request.headers.get('x-client-ip')
  
  return forwarded?.split(',')[0]?.trim() || 
         cfConnectingIp || 
         realIp || 
         xClientIp || 
         'unknown'
}

// Pre-configured rate limiters with enhanced security
export const authRateLimit = new RateLimiter('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Only count failed login attempts
  message: 'Too many login attempts. Please try again later.',
  keyGenerator: (request) => `auth_rate_limit:${getClientIP(request)}`
})

export const strictAuthRateLimit = new RateLimiter('strict-auth', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 attempts per hour for repeated failures
  skipSuccessfulRequests: true,
  message: 'Account temporarily locked due to multiple failed attempts.',
  keyGenerator: (request) => `strict_auth_rate_limit:${getClientIP(request)}`
})

export const apiRateLimit = new RateLimiter('api', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: isProduction ? 60 : 1000, // Stricter in production
  message: 'API rate limit exceeded. Please slow down your requests.',
  keyGenerator: (request) => `api_rate_limit:${getClientIP(request)}`
})

export const sensitiveApiRateLimit = new RateLimiter('sensitive-api', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for sensitive operations
  message: 'Rate limit exceeded for sensitive operations.',
  keyGenerator: (request) => `sensitive_api_rate_limit:${getClientIP(request)}`
})

export const registrationRateLimit = new RateLimiter('registration', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts. Please try again later.',
  keyGenerator: (request) => `registration_rate_limit:${getClientIP(request)}`
})

export const passwordResetRateLimit = new RateLimiter('password-reset', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again later.',
  keyGenerator: (request) => `password_reset_rate_limit:${getClientIP(request)}`
})

export const integrationRateLimit = new RateLimiter('integration', {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 sync requests per 5 minutes
  message: 'Integration sync rate limit exceeded.',
  keyGenerator: (request) => `integration_rate_limit:${getClientIP(request)}`
})