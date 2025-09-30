import { NextRequest } from 'next/server'
import { DashboardController } from '../../../../../lib/controllers/dashboard.controller'
import { createRouteHandler, APIResponseBuilder } from '../../../../../lib/utils/api-wrapper'
import { CacheManager, addCacheHeaders } from '../../../../../lib/utils/cache'
import { PerformanceService } from '../../../../../lib/services/performance.service'
import { z } from 'zod'

export const runtime = 'nodejs'

const dashboardController = new DashboardController()

// Query validation schema
const metricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  platform: z.enum(['google-ads', 'meta-ads', 'linkedin-ads', 'google-analytics']).optional(),
  clientId: z.string().cuid().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Start date must be before end date"
})

export const GET = createRouteHandler(
  async (request, { session }) => {
    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    const validatedQuery = metricsQuerySchema.parse(query)
    
    // Generate cache key
    const cacheKey = CacheManager.generateKey('dashboard:metrics', {
      userId: session.user.id,
      ...validatedQuery
    })
    
    // Try to get from cache first
    const cached = CacheManager.get(cacheKey)
    if (cached) {
      const response = APIResponseBuilder.success(cached)
      return addCacheHeaders(response, {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 60,
        tags: ['dashboard', `user:${session.user.id}`]
      })
    }
    
    // Get metrics data using optimized service
    const dateRange = validatedQuery.startDate && validatedQuery.endDate ? {
      start: new Date(validatedQuery.startDate),
      end: new Date(validatedQuery.endDate)
    } : undefined
    
    const metrics = await PerformanceService.getDashboardMetrics(session.user.id, dateRange)
    
    // Cache the result
    CacheManager.set(cacheKey, metrics, 300) // 5 minutes
    
    const response = APIResponseBuilder.success(metrics)
    return addCacheHeaders(response, {
      maxAge: 300,
      staleWhileRevalidate: 60,
      tags: ['dashboard', `user:${session.user.id}`]
    })
  },
  {
    requireAuth: true,
    logRequests: true,
    rateLimit: {
      windowMs: 60000, // 1 minute
      maxRequests: 100 // 100 requests per minute
    }
  }
)