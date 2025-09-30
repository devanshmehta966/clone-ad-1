import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { ReportsController } from '../../../../../lib/controllers/reports.controller'
import { apiRateLimit } from '../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const reportsController = new ReportsController()

export async function GET(
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

    return await reportsController.getReport(params.reportId, session.user.id)
  } catch (error) {
    console.error('Get report error:', error)
    return reportsController.error(
      'REPORT_FETCH_FAILED',
      'Failed to fetch report',
      500
    )
  }
}

export async function DELETE(
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

    return await reportsController.deleteReport(params.reportId, session.user.id)
  } catch (error) {
    console.error('Delete report error:', error)
    return reportsController.error(
      'REPORT_DELETE_FAILED',
      'Failed to delete report',
      500
    )
  }
}