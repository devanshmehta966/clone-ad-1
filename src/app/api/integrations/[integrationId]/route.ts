import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { IntegrationsController } from '../../../../../lib/controllers/integrations.controller'
import { apiRateLimit } from '../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const integrationsController = new IntegrationsController()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  const params = await context.params
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return integrationsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await integrationsController.getIntegrationStatus(params.integrationId, session.user.id)
  } catch (error) {
    console.error('Get integration status error:', error)
    return integrationsController.error(
      'INTEGRATION_STATUS_FAILED',
      'Failed to get integration status',
      500
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
) {
  const params = await context.params
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return integrationsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await integrationsController.disconnectIntegration(params.integrationId, session.user.id)
  } catch (error) {
    console.error('Disconnect integration error:', error)
    return integrationsController.error(
      'INTEGRATION_DISCONNECT_FAILED',
      'Failed to disconnect integration',
      500
    )
  }
}