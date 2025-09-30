import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { MetricsQuery, AlertsQuery } from '../validation/dashboard.schemas'

// Types matching the DashboardProvider interface
export interface DashboardMetrics {
  website: {
    visits: number
    conversionRate: number
    topPages: Array<{ page: string; views: number; conversions: number }>
    changeVsPrevMonth: number
  }
  ads: {
    spend: number
    cpc: number
    cpa: number
    conversions: number
    changeVsPrevMonth: number
  }
  social: {
    followers: number
    engagement: number
    reach: number
    changeVsPrevMonth: number
  }
}

export interface Alert {
  id: string
  type: 'warning' | 'critical' | 'insight'
  title: string
  message: string
  action?: string
  timestamp: Date
}

export class DashboardService {
  async calculateMetrics(
    userId: string,
    query: MetricsQuery
  ): Promise<DashboardMetrics> {
    const { startDate, endDate, platforms } = query
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Calculate previous period for comparison
    const periodLength = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - periodLength)
    const prevEnd = new Date(start.getTime())

    // Get current period analytics data
    const currentData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        ...(platforms &&
          platforms.length > 0 && {
            platform: { in: platforms },
          }),
      },
      include: { campaign: true },
    })

    // Get previous period analytics data for comparison
    const previousData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: { gte: prevStart, lte: prevEnd },
        ...(platforms &&
          platforms.length > 0 && {
            platform: { in: platforms },
          }),
      },
    })

    // Calculate current period metrics
    const currentMetrics = this.aggregateMetrics(currentData)
    const previousMetrics = this.aggregateMetrics(previousData)

    // Get website-specific data (Google Analytics)
    const websiteData = currentData.filter(
      (d) => d.platform === 'GOOGLE_ANALYTICS'
    )
    const websiteMetrics = this.aggregateMetrics(websiteData)
    const prevWebsiteData = previousData.filter(
      (d) => d.platform === 'GOOGLE_ANALYTICS'
    )
    const prevWebsiteMetrics = this.aggregateMetrics(prevWebsiteData)

    // Get ads-specific data (excluding Google Analytics)
    const adsData = currentData.filter((d) => d.platform !== 'GOOGLE_ANALYTICS')
    const adsMetrics = this.aggregateMetrics(adsData)
    const prevAdsData = previousData.filter(
      (d) => d.platform !== 'GOOGLE_ANALYTICS'
    )
    const prevAdsMetrics = this.aggregateMetrics(prevAdsData)

    // Calculate top pages (mock data for now - would come from Google Analytics API)
    const topPages = await this.getTopPages(userId, start, end)

    // Calculate social metrics (mock data - would come from social platform APIs)
    const socialMetrics = await this.getSocialMetrics(userId, start, end)
    const prevSocialMetrics = await this.getSocialMetrics(
      userId,
      prevStart,
      prevEnd
    )

    return {
      website: {
        visits: websiteMetrics.totalImpressions || 0,
        conversionRate:
          websiteMetrics.totalImpressions > 0
            ? Number(
                (
                  (websiteMetrics.totalConversions /
                    websiteMetrics.totalImpressions) *
                  100
                ).toFixed(2)
              )
            : 0,
        topPages,
        changeVsPrevMonth: this.calculatePercentageChange(
          websiteMetrics.totalImpressions,
          prevWebsiteMetrics.totalImpressions
        ),
      },
      ads: {
        spend: Number(adsMetrics.totalSpend.toFixed(2)),
        cpc:
          adsMetrics.totalClicks > 0
            ? Number(
                (adsMetrics.totalSpend / adsMetrics.totalClicks).toFixed(2)
              )
            : 0,
        cpa:
          adsMetrics.totalConversions > 0
            ? Number(
                (adsMetrics.totalSpend / adsMetrics.totalConversions).toFixed(2)
              )
            : 0,
        conversions: adsMetrics.totalConversions,
        changeVsPrevMonth: this.calculatePercentageChange(
          adsMetrics.totalSpend,
          prevAdsMetrics.totalSpend
        ),
      },
      social: {
        followers: socialMetrics.followers,
        engagement: socialMetrics.engagement,
        reach: socialMetrics.reach,
        changeVsPrevMonth: this.calculatePercentageChange(
          socialMetrics.reach,
          prevSocialMetrics.reach
        ),
      },
    }
  }

  private aggregateMetrics(data: any[]) {
    return data.reduce(
      (acc, item) => {
        acc.totalImpressions += item.impressions || 0
        acc.totalClicks += item.clicks || 0
        acc.totalSpend += Number(item.spend || 0)
        acc.totalConversions += item.conversions || 0
        return acc
      },
      {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
      }
    )
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  private async getTopPages(userId: string, start: Date, end: Date) {
    // Mock data for now - in real implementation, this would query Google Analytics API
    // or store page-level data in the database
    return [
      { page: '/landing/summer-sale', views: 12543, conversions: 103 },
      { page: '/products/wireless-headphones', views: 9876, conversions: 66 },
      { page: '/blog/marketing-tips', views: 7654, conversions: 31 },
    ]
  }

  private async getSocialMetrics(userId: string, start: Date, end: Date) {
    // Mock data for now - in real implementation, this would query social platform APIs
    // or store social metrics in the database
    return {
      followers: 18200,
      engagement: 8.4,
      reach: 145000,
    }
  }

  async getActiveAlerts(userId: string, query: AlertsQuery): Promise<Alert[]> {
    const page = query.page ? parseInt(query.page) : 1
    const limit = query.limit ? parseInt(query.limit) : 10
    const { severity } = query

    // Get recent analytics data to generate intelligent alerts
    const recentData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: { campaign: true },
      orderBy: { date: 'desc' },
    })

    const alerts: Alert[] = []

    // Generate performance alerts
    const performanceAlerts = this.generatePerformanceAlerts(recentData)
    alerts.push(...performanceAlerts)

    // Generate budget alerts
    const budgetAlerts = this.generateBudgetAlerts(recentData)
    alerts.push(...budgetAlerts)

    // Generate opportunity alerts
    const opportunityAlerts = this.generateOpportunityAlerts(recentData)
    alerts.push(...opportunityAlerts)

    // Filter by severity if specified
    const filteredAlerts = severity
      ? alerts.filter((alert) => {
          const severityMap = {
            warning: 'warning',
            error: 'critical',
            info: 'insight',
          }
          return alert.type === severityMap[severity]
        })
      : alerts

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + limit)

    return paginatedAlerts
  }

  private generatePerformanceAlerts(data: any[]): Alert[] {
    const alerts: Alert[] = []

    // Group by platform and calculate performance metrics
    const platformMetrics = data.reduce(
      (acc, item) => {
        const platform = item.platform
        if (!acc[platform]) {
          acc[platform] = {
            spend: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
          }
        }
        acc[platform].spend += Number(item.spend || 0)
        acc[platform].conversions += item.conversions || 0
        acc[platform].clicks += item.clicks || 0
        acc[platform].impressions += item.impressions || 0
        return acc
      },
      {} as Record<string, any>
    )

    // Check for high CPA
    Object.entries(platformMetrics).forEach(
      ([platform, metrics]: [string, any]) => {
        const cpa =
          metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0
        if (cpa > 45) {
          // Threshold for high CPA
          alerts.push({
            id: `cpa-${platform}-${Date.now()}`,
            type: 'critical',
            title: 'High CPA Detected',
            message: `Your ${platform.replace('_', ' ')} CPA is $${cpa.toFixed(2)}, which is above the recommended threshold.`,
            action: 'Review Campaigns',
            timestamp: new Date(),
          })
        }
      }
    )

    return alerts
  }

  private generateBudgetAlerts(data: any[]): Alert[] {
    const alerts: Alert[] = []

    // Calculate daily spend trends
    const dailySpend = data.reduce(
      (acc, item) => {
        const date = item.date.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + Number(item.spend || 0)
        return acc
      },
      {} as Record<string, number>
    )

    const spendValues = Object.values(dailySpend) as number[]
    const avgDailySpend =
      spendValues.length > 0
        ? spendValues.reduce((a, b) => a + b, 0) / spendValues.length
        : 0

    // Alert if recent spend is significantly higher
    const recentSpend = spendValues.slice(-3).reduce((a, b) => a + b, 0) / 3
    if (recentSpend > avgDailySpend * 1.5) {
      alerts.push({
        id: `budget-spike-${Date.now()}`,
        type: 'warning',
        title: 'Budget Spike Detected',
        message: `Daily spend has increased by ${((recentSpend / avgDailySpend - 1) * 100).toFixed(0)}% in recent days.`,
        action: 'Review Budget Settings',
        timestamp: new Date(),
      })
    }

    return alerts
  }

  private generateOpportunityAlerts(data: any[]): Alert[] {
    const alerts: Alert[] = []

    // Look for campaigns with good performance that could be scaled
    const campaignMetrics = data.reduce(
      (acc, item) => {
        const campaignId = item.campaignId
        if (!campaignId) return acc

        if (!acc[campaignId]) {
          acc[campaignId] = {
            spend: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
            name: item.campaign?.name || 'Unknown Campaign',
          }
        }
        acc[campaignId].spend += Number(item.spend || 0)
        acc[campaignId].conversions += item.conversions || 0
        acc[campaignId].clicks += item.clicks || 0
        acc[campaignId].impressions += item.impressions || 0
        return acc
      },
      {} as Record<string, any>
    )

    // Find high-performing campaigns
    Object.entries(campaignMetrics).forEach(
      ([campaignId, metrics]: [string, any]) => {
        const cpa =
          metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0
        const ctr =
          metrics.impressions > 0
            ? (metrics.clicks / metrics.impressions) * 100
            : 0

        if (cpa < 30 && ctr > 2 && metrics.conversions > 5) {
          alerts.push({
            id: `opportunity-${campaignId}-${Date.now()}`,
            type: 'insight',
            title: 'Scale Opportunity',
            message: `Campaign "${metrics.name}" has strong performance (CPA: $${cpa.toFixed(2)}, CTR: ${ctr.toFixed(1)}%). Consider increasing budget.`,
            action: 'Increase Budget',
            timestamp: new Date(),
          })
        }
      }
    )

    return alerts
  }

  async getPerformanceData(userId: string, query: MetricsQuery) {
    const { startDate, endDate, platforms } = query

    const performanceData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(platforms &&
          platforms.length > 0 && {
            platform: { in: platforms },
          }),
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        platform: true,
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        ctr: true,
        cpc: true,
        cpa: true,
      },
    })

    // Group by date for chart data
    const chartData = performanceData.reduce(
      (acc, data) => {
        const dateKey = data.date.toISOString().split('T')[0]
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            impressions: 0,
            clicks: 0,
            spend: 0,
            conversions: 0,
          }
        }
        acc[dateKey].impressions += data.impressions || 0
        acc[dateKey].clicks += data.clicks || 0
        acc[dateKey].spend += Number(data.spend || 0)
        acc[dateKey].conversions += data.conversions || 0
        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(chartData)
  }

  async getRevenueData(userId: string, query: MetricsQuery) {
    const { startDate, endDate, platforms } = query

    const revenueData = await prisma.analyticsData.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(platforms &&
          platforms.length > 0 && {
            platform: { in: platforms },
          }),
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        platform: true,
        spend: true,
        conversions: true,
        platformMetrics: true,
      },
    })

    // Calculate revenue based on conversions and platform-specific data
    const chartData = revenueData.reduce(
      (acc, data) => {
        const dateKey = data.date.toISOString().split('T')[0]
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            revenue: 0,
            spend: 0,
            profit: 0,
          }
        }

        // Estimate revenue (this would be replaced with actual revenue tracking)
        const estimatedRevenue = (data.conversions || 0) * 50 // $50 per conversion estimate
        acc[dateKey].revenue += estimatedRevenue
        acc[dateKey].spend += Number(data.spend || 0)
        acc[dateKey].profit = acc[dateKey].revenue - acc[dateKey].spend

        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(chartData)
  }

  async getIntegrationStatus(userId: string) {
    const integrations = await prisma.oAuthIntegration.findMany({
      where: { userId },
      select: {
        platform: true,
        isActive: true,
        lastSyncAt: true,
        syncStatus: true,
      },
    })

    // Map to the format expected by DashboardProvider
    const integrationStatus = {
      googleAds: { connected: false, lastSync: null as Date | null },
      facebookAds: { connected: false, lastSync: null as Date | null },
      googleAnalytics: { connected: false, lastSync: null as Date | null },
    }

    integrations.forEach((integration) => {
      switch (integration.platform) {
        case 'GOOGLE_ADS':
          integrationStatus.googleAds = {
            connected: integration.isActive,
            lastSync: integration.lastSyncAt,
          }
          break
        case 'META_ADS':
          integrationStatus.facebookAds = {
            connected: integration.isActive,
            lastSync: integration.lastSyncAt,
          }
          break
        case 'GOOGLE_ANALYTICS':
          integrationStatus.googleAnalytics = {
            connected: integration.isActive,
            lastSync: integration.lastSyncAt,
          }
          break
      }
    })

    return integrationStatus
  }

  async getClientSummary(userId: string) {
    // Get clients for admin users, or return current user info for client users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      throw new APIError('USER_NOT_FOUND', 'User not found', 404)
    }

    if (user.role === 'ADMIN') {
      // Return client list for admin users
      const clients = await prisma.client.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      })

      return clients.map((client) => ({
        id: client.id,
        name: client.businessName,
        industry: client.industry || 'Not specified',
        status: client.status.toLowerCase() as 'active' | 'trial' | 'inactive',
        lastLogin: this.formatRelativeTime(
          client.lastLoginAt || client.updatedAt
        ),
        monthlySpend: '$0', // Would be calculated from analytics data
        campaigns: 0, // Would be calculated from campaigns
        roas: '0x', // Would be calculated from performance data
      }))
    } else {
      // Return current user as single client
      return [
        {
          id: user.id,
          name: user.profile?.businessName || user.name || 'Unknown',
          industry: 'Not specified',
          status: 'active' as const,
          lastLogin: 'Current session',
          monthlySpend: '$0',
          campaigns: 0,
          roas: '0x',
        },
      ]
    }
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString()
  }
}
