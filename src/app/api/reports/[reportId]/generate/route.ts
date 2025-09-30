import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { ReportsController } from '../../../../../../lib/controllers/reports.controller'
import { apiRateLimit } from '../../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const reportsController = new ReportsController()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> }
) {
  const params = await context.params
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return reportsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await reportsController.generateReport(params.reportId, session.user.id)
  } catch (error) {
    console.error('Generate report error:', error)
    return reportsController.error(
      'REPORT_GENERATE_FAILED',
      'Failed to generate report',
      500
    )
  }
}