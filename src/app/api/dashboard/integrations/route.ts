import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { DashboardController } from '../../../../../lib/controllers/dashboard.controller'
import { apiRateLimit } from '../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const dashboardController = new DashboardController()

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return dashboardController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await dashboardController.getIntegrationStatus(session.user.id)
  } catch (error) {
    console.error('Dashboard integrations error:', error)
    return dashboardController.error(
      'INTEGRATIONS_FETCH_FAILED',
      'Failed to fetch integration status',
      500
    )
  }
}