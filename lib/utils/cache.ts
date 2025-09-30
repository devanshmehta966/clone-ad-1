import { NextResponse } from 'next/server'

export interface CacheOptions {
  maxAge?: number // seconds
  staleWhileRevalidate?: number // seconds
  tags?: string[]
  revalidate?: number // seconds for ISR
}

/**
 * Cache utility for API responses
 */
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; maxAge: number }>()

  /**
   * Generate cache key from request parameters
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)
    
    return `${prefix}:${JSON.stringify(sortedParams)}`
  }

  /**
   * Get cached data
   */
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.maxAge * 1000) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Set cached data
   */
  static set<T>(key: string, data: T, maxAge: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge
    })
  }

  /**
   * Clear cache by pattern
   */
  static clearByPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  static size(): number {
    return this.cache.size
  }
}

/**
 * Add cache headers to NextResponse
 */
export function addCacheHeaders(
  response: NextResponse,
  options: CacheOptions = {}
): NextResponse {
  const {
    maxAge = 300, // 5 minutes default
    staleWhileRevalidate = 60, // 1 minute default
    tags = []
  } = options

  // Set Cache-Control header
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  )

  // Set ETag for conditional requests
  const etag = `"${Date.now()}"`
  response.headers.set('ETag', etag)

  // Set cache tags for Vercel
  if (tags.length > 0) {
    response.headers.set('Cache-Tag', tags.join(','))
  }

  return response
}

/**
 * Create cached response
 */
export function createCachedResponse<T>(
  data: T,
  options: CacheOptions = {}
): NextResponse {
  const response = NextResponse.json(data)
  return addCacheHeaders(response, options)
}

/**
 * Middleware for caching API responses
 */
export function withCache<T>(
  handler: () => Promise<T>,
  cacheKey: string,
  options: CacheOptions = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = CacheManager.get<T>(cacheKey)
      if (cached) {
        resolve(cached)
        return
      }

      // Execute handler and cache result
      const result = await handler()
      CacheManager.set(cacheKey, result, options.maxAge || 300)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Cache invalidation utility
 */
export class CacheInvalidator {
  /**
   * Invalidate user-specific cache
   */
  static invalidateUser(userId: string): void {
    CacheManager.clearByPattern(`.*:.*userId.*${userId}.*`)
  }

  /**
   * Invalidate dashboard cache
   */
  static invalidateDashboard(userId: string): void {
    CacheManager.clearByPattern(`dashboard:.*userId.*${userId}.*`)
  }

  /**
   * Invalidate analytics cache
   */
  static invalidateAnalytics(userId: string): void {
    CacheManager.clearByPattern(`analytics:.*userId.*${userId}.*`)
  }

  /**
   * Invalidate clients cache
   */
  static invalidateClients(userId: string): void {
    CacheManager.clearByPattern(`clients:.*userId.*${userId}.*`)
  }

  /**
   * Invalidate reports cache
   */
  static invalidateReports(userId: string): void {
    CacheManager.clearByPattern(`reports:.*userId.*${userId}.*`)
  }
}