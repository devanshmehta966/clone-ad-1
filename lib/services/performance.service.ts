import { prisma } from '../prisma'
import { Platform, ClientStatus } from '@prisma/client'
import { withQueryPerformance } from '../utils/performance'

export class PerformanceService {
  /**
   * Get dashboard metrics with optimized queries
   */
  static getDashboardMetrics = withQueryPerformance(
    'getDashboardMetrics',
    async (userId: string, dateRange?: { start: Date; end: Date }) => {
    const endDate = dateRange?.end || new Date()
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    // Use Promise.all for parallel queries
    const [
      analyticsData,
      campaignCount,
      integrationCount,
      totalSpend,
      totalConversions
    ] = await Promise.all([
      // Optimized analytics query with selective fields
      prisma.analyticsData.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          date: true,
          platform: true,
          impressions: true,
          clicks: true,
          spend: true,
          conversions: true,
          cpc: true,
          cpa: true,
          ctr: true
        },
        orderBy: {
          date: 'desc'
        }
      }),

      // Campaign count
      prisma.campaign.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }),

      // Active integrations count
      prisma.oAuthIntegration.count({
        where: {
          userId,
          isActive: true
        }
      }),

      // Total spend aggregation
      prisma.analyticsData.aggregate({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          spend: true
        }
      }),

      // Total conversions aggregation
      prisma.analyticsData.aggregate({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          conversions: true
        }
      })
    ])

    return {
      analyticsData,
      campaignCount,
      integrationCount,
      totalSpend: totalSpend._sum.spend || 0,
      totalConversions: totalConversions._sum.conversions || 0
    }
  })

  /**
   * Get paginated analytics data
   */
  static getPaginatedAnalytics = withQueryPerformance(
    'getPaginatedAnalytics',
    async (
      userId: string,
      options: {
        page?: number
        limit?: number
        platform?: Platform
        startDate?: Date
        endDate?: Date
      } = {}
    ) => {
    const {
      page = 1,
      limit = 50,
      platform,
      startDate,
      endDate
    } = options

    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(platform && { platform }),
      ...(startDate || endDate) && {
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate })
        }
      }
    }

    const [data, total] = await Promise.all([
      prisma.analyticsData.findMany({
        where,
        select: {
          id: true,
          date: true,
          platform: true,
          impressions: true,
          clicks: true,
          spend: true,
          conversions: true,
          cpc: true,
          cpa: true,
          ctr: true,
          campaign: {
            select: {
              name: true,
              status: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.analyticsData.count({ where })
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  })

  /**
   * Get platform performance summary
   */
  static getPlatformSummary = withQueryPerformance(
    'getPlatformSummary',
    async (userId: string, dateRange?: { start: Date; end: Date }) => {
    const endDate = dateRange?.end || new Date()
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const platformSummary = await prisma.analyticsData.groupBy({
      by: ['platform'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true
      },
      _avg: {
        cpc: true,
        cpa: true,
        ctr: true
      }
    })

    return platformSummary
  })

  /**
   * Get top performing campaigns
   */
  static getTopCampaigns = withQueryPerformance(
    'getTopCampaigns',
    async (userId: string, limit: number = 10) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const topCampaigns = await prisma.campaign.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        platform: true,
        budgetDaily: true,
        analytics: {
          where: {
            date: {
              gte: thirtyDaysAgo
            }
          },
          select: {
            spend: true,
            conversions: true,
            impressions: true,
            clicks: true
          }
        }
      },
      take: limit
    })

    // Calculate performance metrics
    return topCampaigns.map(campaign => {
      const totalSpend = campaign.analytics.reduce((sum, a) => sum + (Number(a.spend) || 0), 0)
      const totalConversions = campaign.analytics.reduce((sum, a) => sum + (a.conversions || 0), 0)
      const totalImpressions = campaign.analytics.reduce((sum, a) => sum + (a.impressions || 0), 0)
      const totalClicks = campaign.analytics.reduce((sum, a) => sum + (a.clicks || 0), 0)

      return {
        ...campaign,
        analytics: undefined, // Remove raw analytics data
        performance: {
          totalSpend,
          totalConversions,
          totalImpressions,
          totalClicks,
          cpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
        }
      }
    }).sort((a, b) => b.performance.totalConversions - a.performance.totalConversions)
  })

  /**
   * Get user's clients with pagination
   */
  static getPaginatedClients = withQueryPerformance(
    'getPaginatedClients',
    async (
      userId: string,
      options: {
        page?: number
        limit?: number
        status?: ClientStatus
        search?: string
      } = {}
    ) => {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = options

    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' as const } },
          { businessEmail: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          businessPhone: true,
          businessWebsite: true,
          industry: true,
          status: true,
          subscriptionPlan: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ])

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  })
}