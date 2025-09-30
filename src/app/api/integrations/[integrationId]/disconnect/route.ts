import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { IntegrationsController } from '../../../../../../lib/controllers/integrations.controller'
import { apiRateLimit } from '../../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const integrationsController = new IntegrationsController()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return integrationsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    const { integrationId } = await context.params

    return await integrationsController.disconnectIntegration(integrationId, session.user.id)
  } catch (error) {
    console.error('Disconnect integration error:', error)
    return integrationsController.error(
      'DISCONNECT_FAILED',
      'Failed to disconnect integration',
      500
    )
  }
}