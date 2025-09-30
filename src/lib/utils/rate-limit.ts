import { NextRequest } from 'next/server'
import { APIError } from '../types/api'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkRateLimit(request: NextRequest): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request)

    const now = Date.now()
    const entry = rateLimitStore.get(key)

    // Clean up expired entries periodically
    this.cleanupExpiredEntries(now)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return
    }

    if (entry.count >= this.config.maxRequests) {
      const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000)
      throw new APIError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
        429,
        {
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs,
          resetInSeconds
        }
      )
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)
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
      for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
          rateLimitStore.delete(key)
        }
      }
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  keyGenerator: (request) => {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return `auth_rate_limit:${ip}`
  }
})

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (request) => {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return `api_rate_limit:${ip}`
  }
})

export const integrationRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 sync requests per 5 minutes
  keyGenerator: (request) => {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return `integration_rate_limit:${ip}`
  }
})