import { NextRequest } from 'next/server'
import { createRouteHandler } from '../../../../../lib/utils/api-wrapper'
import { CacheManager, createCachedResponse } from '../../../../../lib/utils/cache'
import { PerformanceService } from '../../../../../lib/services/performance.service'
import { z } from 'zod'

export const runtime = 'nodejs'

// Query validation schema
const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)).pipe(z.number().min(1)),
  limit: z.string().optional().default('20').transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)),
  status: z.enum(['ACTIVE', 'TRIAL', 'INACTIVE']).optional(),
  search: z.string().min(1).optional()
})

export const GET = createRouteHandler(
  async (request, { session }) => {
    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    const validatedQuery = paginationQuerySchema.parse(query)
    
    // Generate cache key
    const cacheKey = CacheManager.generateKey('clients:paginated', {
      userId: session.user.id,
      ...validatedQuery
    })
    
    // Try to get from cache first
    const cached = CacheManager.get(cacheKey)
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: 180, // 3 minutes
        staleWhileRevalidate: 30,
        tags: ['clients', `user:${session.user.id}`]
      })
    }
    
    // Get paginated clients
    const result = await PerformanceService.getPaginatedClients(session.user.id, {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      status: validatedQuery.status,
      search: validatedQuery.search
    })
    
    // Cache the result
    CacheManager.set(cacheKey, result, 180) // 3 minutes
    
    return createCachedResponse(result, {
      maxAge: 180,
      staleWhileRevalidate: 30,
      tags: ['clients', `user:${session.user.id}`]
    })
  },
  {
    requireAuth: true,
    logRequests: true,
    rateLimit: {
      windowMs: 60000, // 1 minute
      maxRequests: 50 // 50 requests per minute
    }
  }
)