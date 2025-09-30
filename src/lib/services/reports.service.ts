import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { CreateReportData, ReportsQuery } from '../validation/reports.schemas'

export class ReportsService {
  async getUserReports(userId: string, query: ReportsQuery) {
    const page = query.page ? parseInt(query.page) : 1
    const limit = query.limit ? parseInt(query.limit) : 10
    const { reportType } = query
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(reportType && { reportType })
    }

    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.report.count({ where })
    ])

    return {
      reports,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  }

  async getReportById(reportId: string, userId: string) {
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId
      }
    })

    if (!report) {
      throw new APIError('REPORT_NOT_FOUND', 'Report not found', 404)
    }

    return report
  }

  async createReport(userId: string, data: CreateReportData) {
    // Generate report data based on the date range and type
    const reportData = await this.generateReportData(userId, data)

    const report = await prisma.report.create({
      data: {
        userId,
        title: data.title,
        reportType: data.reportType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        data: reportData
      }
    })

    return report
  }

  async generateReport(reportId: string, userId: string) {
    const report = await this.getReportById(reportId, userId)

    // Regenerate report data with current data
    const reportData = await this.generateReportData(userId, {
      title: report.title,
      reportType: report.reportType,
      startDate: report.startDate.toISOString(),
      endDate: report.endDate.toISOString(),
      includeCharts: true
    })

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        data: reportData,
        emailSentAt: new Date() // Mark as regenerated
      }
    })

    return updatedReport
  }

  async deleteReport(reportId: string, userId: string) {
    // Verify report exists and belongs to user
    await this.getReportById(reportId, userId)

    await prisma.report.delete({
      where: { id: reportId }
    })
  }

  private async generateReportData(userId: string, reportConfig: CreateReportData) {
    const { startDate, endDate, reportType } = reportConfig

    // Get analytics data for the report period
    const analyticsData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        campaign: true
      },
      orderBy: { date: 'asc' }
    })

    // Get integrations data
    const integrations = await prisma.oAuthIntegration.findMany({
      where: { userId, isActive: true },
      select: {
        platform: true,
        accountName: true,
        lastSyncAt: true
      }
    })

    // Calculate summary metrics
    const summary = analyticsData.reduce((acc, data) => {
      acc.totalImpressions += data.impressions || 0
      acc.totalClicks += data.clicks || 0
      acc.totalSpend += Number(data.spend || 0)
      acc.totalConversions += data.conversions || 0
      return acc
    }, {
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      totalConversions: 0
    })

    // Group data by platform
    const platformData = analyticsData.reduce((acc, data) => {
      if (!acc[data.platform]) {
        acc[data.platform] = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0
        }
      }
      acc[data.platform].impressions += data.impressions || 0
      acc[data.platform].clicks += data.clicks || 0
      acc[data.platform].spend += Number(data.spend || 0)
      acc[data.platform].conversions += data.conversions || 0
      return acc
    }, {} as Record<string, any>)

    // Group data by date for trends
    const dailyData = analyticsData.reduce((acc, data) => {
      const dateKey = data.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0
        }
      }
      acc[dateKey].impressions += data.impressions || 0
      acc[dateKey].clicks += data.clicks || 0
      acc[dateKey].spend += Number(data.spend || 0)
      acc[dateKey].conversions += data.conversions || 0
      return acc
    }, {} as Record<string, any>)

    return {
      reportType,
      period: { startDate, endDate },
      summary: {
        ...summary,
        ctr: summary.totalImpressions > 0 
          ? (summary.totalClicks / summary.totalImpressions) * 100 
          : 0,
        cpc: summary.totalClicks > 0 
          ? summary.totalSpend / summary.totalClicks 
          : 0,
        cpa: summary.totalConversions > 0 
          ? summary.totalSpend / summary.totalConversions 
          : 0
      },
      platformBreakdown: platformData,
      dailyTrends: Object.values(dailyData),
      integrations,
      generatedAt: new Date().toISOString()
    }
  }
}