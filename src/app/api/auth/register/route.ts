import { NextRequest } from 'next/server'
import { AuthController } from '../../../../../lib/controllers/auth.controller'
import { registrationRateLimit } from '../../../../../lib/utils/rate-limit'
import { createRouteHandler, APIResponseBuilder } from '../../../../../lib/utils/api-wrapper'
import { z } from 'zod'

export const runtime = 'nodejs'

const authController = new AuthController()

export const POST = createRouteHandler(
  async (request) => {
    // Apply registration-specific rate limiting
    await registrationRateLimit.checkRateLimit(request, false)
    
    // Create user account
    // Return controller response directly so errors (e.g., 409) propagate
    return await authController.signUp(request)
  },
  {
    requireAuth: false,
    logRequests: true,
    rateLimit: {
      windowMs: 900000, // 15 minutes
      maxRequests: 5 // 5 registration attempts per 15 minutes
    }
  }
)