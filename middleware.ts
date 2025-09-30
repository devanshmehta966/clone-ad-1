import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders, validateOrigin, getCORSHeaders } from './lib/security'
import { apiRateLimit } from './lib/utils/rate-limit'

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth?.token

    // Create response
    let response = NextResponse.next()

    // Apply security headers to all responses
    applySecurityHeaders(response)

    // Handle CORS for API routes
    if (pathname.startsWith('/api/')) {
      const origin = req.headers.get('origin')
      const corsHeaders = getCORSHeaders(origin || undefined)

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders })
      }

      // Validate origin for state-changing requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        if (!validateOrigin(req)) {
          return new Response(
            JSON.stringify({
              error: 'Invalid origin',
              code: 'INVALID_ORIGIN'
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Apply rate limiting to API routes (except auth routes which have their own)
      if (!pathname.startsWith('/api/auth/')) {
        try {
          await apiRateLimit.checkRateLimit(req)
        } catch (error: any) {
          return new Response(
            JSON.stringify({
              error: error.message,
              code: error.code || 'RATE_LIMIT_EXCEEDED'
            }),
            {
              status: error.statusCode || 429,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }
    }

    // Always allow access to API auth routes
    if (pathname.startsWith('/api/auth/')) {
      return response
    }

    // For signin/signup pages, allow access
    if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      // Only redirect authenticated users if they're not in the process of logging out
      if (token) {
        // Check for logout indicators
        const hasCallbackUrl = req.nextUrl.searchParams.has('callbackUrl')
        const referer = req.headers.get('referer')
        const isFromLogout = referer?.includes('signout') || hasCallbackUrl

        if (!isFromLogout) {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }

      return response
    }

    // Check role-based access for admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to public routes
        if (pathname === '/' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/signin') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/public') ||
          pathname.startsWith('/robots') ||
          pathname.startsWith('/sitemap')) {
          return true
        }

        // Require authentication for dashboard and API routes
        if (pathname.startsWith('/dashboard') ||
          pathname.startsWith('/clients') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/settings') ||
          pathname.startsWith('/google-ads') ||
          pathname.startsWith('/meta-ads') ||
          pathname.startsWith('/linkedin-ads') ||
          pathname.startsWith('/google-analytics') ||
          pathname.startsWith('/api/')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}