import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { IntegrationsController } from '../../../../../../lib/controllers/integrations.controller'
import { integrationRateLimit } from '../../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const integrationsController = new IntegrationsController()

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await integrationRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return integrationsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await integrationsController.startOAuth(request, session.user.id)
  } catch (error) {
    console.error('OAuth start error:', error)
    return integrationsController.error(
      'OAUTH_START_FAILED',
      'Failed to start OAuth flow',
      500
    )
  }
}