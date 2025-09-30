import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { ReportsController } from '../../../../lib/controllers/reports.controller'
import { apiRateLimit } from '../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const reportsController = new ReportsController()

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return reportsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await reportsController.getReports(request, session.user.id)
  } catch (error) {
    console.error('Get reports error:', error)
    return reportsController.error(
      'REPORTS_FETCH_FAILED',
      'Failed to fetch reports',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await apiRateLimit.checkRateLimit(request)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return reportsController.error('UNAUTHORIZED', 'Authentication required', 401)
    }

    return await reportsController.createReport(request, session.user.id)
  } catch (error) {
    console.error('Create report error:', error)
    return reportsController.error(
      'REPORT_CREATE_FAILED',
      'Failed to create report',
      500
    )
  }
}