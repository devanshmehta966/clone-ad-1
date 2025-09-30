import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { IntegrationsController } from '../../../../../lib/controllers/integrations.controller'
import { apiRateLimit } from '../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const integrationsController = new IntegrationsController()

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return integrationsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await integrationsController.checkAllIntegrationsHealth(session.user.id)
  } catch (error) {
    console.error('Bulk health check error:', error)
    return integrationsController.error(
      'BULK_HEALTH_CHECK_FAILED',
      'Failed to check integrations health',
      500
    )
  }
}