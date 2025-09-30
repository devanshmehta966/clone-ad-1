import { DashboardService } from '@/lib/services/dashboard.service'
import prisma from '@/lib/prisma'
import { createMockAnalyticsData, createMockCampaign } from '../../utils/test-factories'

// Mock dependencies
jest.mock('@/lib/prisma')

describe('DashboardService', () => {
  let mockPrisma: jest.Mocked<typeof prisma>

  beforeEach(() => {
    mockPrisma = prisma as jest.Mocked<typeof prisma>
    jest.clearAllMocks()
  })

  describe('calculateMetrics', () => {
    it('should calculate dashboard metrics correctly', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockAnalyticsData = [
        createMockAnalyticsData({
          spend: 100,
          clicks: 500,
          impressions: 10000,
          conversions: 25,
        }),
        createMockAnalyticsData({
          spend: 200,
          clicks: 800,
          impressions: 15000,
          conversions: 40,
        }),
      ]

      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.calculateMetrics(userId, dateRange)

      expect(mockPrisma.analyticsData.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      })

      expect(result).toEqual({
        totalSpend: 300,
        totalClicks: 1300,
        totalImpressions: 25000,
        totalConversions: 65,
        averageCPC: 0.23, // 300 / 1300
        averageCTR: 5.2, // (1300 / 25000) * 100
        conversionRate: 5.0, // (65 / 1300) * 100
      })
    })

    it('should handle empty analytics data', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      mockPrisma.analyticsData.findMany.mockResolvedValue([])

      const result = await DashboardService.calculateMetrics(userId, dateRange)

      expect(result).toEqual({
        totalSpend: 0,
        totalClicks: 0,
        totalImpressions: 0,
        totalConversions: 0,
        averageCPC: 0,
        averageCTR: 0,
        conversionRate: 0,
      })
    })

    it('should handle division by zero gracefully', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockAnalyticsData = [
        createMockAnalyticsData({
          spend: 100,
          clicks: 0, // Zero clicks
          impressions: 1000,
          conversions: 0,
        }),
      ]

      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.calculateMetrics(userId, dateRange)

      expect(result.averageCPC).toBe(0)
      expect(result.conversionRate).toBe(0)
    })
  })

  describe('getPerformanceData', () => {
    it('should return performance data grouped by platform', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockAnalyticsData = [
        createMockAnalyticsData({ platform: 'GOOGLE_ADS', spend: 500, conversions: 25 }),
        createMockAnalyticsData({ platform: 'META_ADS', spend: 300, conversions: 15 }),
        createMockAnalyticsData({ platform: 'LINKEDIN_ADS', spend: 200, conversions: 10 }),
      ]

      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.getPerformanceData(userId, dateRange)

      expect(result).toEqual(mockAnalyticsData)
    })
  })

  describe('getTopPerformers', () => {
    it('should return top performing campaigns', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockCampaigns = [
        createMockCampaign({ id: 'campaign-1', name: 'Top Campaign' }),
        createMockCampaign({ id: 'campaign-2', name: 'Second Campaign' }),
      ]
      const mockAnalyticsData = [
        createMockAnalyticsData({
          campaignId: 'campaign-1',
          spend: 500,
          conversions: 100,
        }),
        createMockAnalyticsData({
          campaignId: 'campaign-2',
          spend: 400,
          conversions: 80,
        }),
      ]

      // Mock the aggregation query
      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns)

      const result = await DashboardService.getTopPerformers(userId, dateRange)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        campaignId: 'campaign-1',
        campaignName: 'Top Campaign',
        conversions: 100,
        spend: 500,
      })
    })

    it('should limit results to top 5 performers', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      // Create 10 campaigns but expect only top 5
      const mockCampaigns = Array.from({ length: 10 }, (_, i) =>
        createMockCampaign({ id: `campaign-${i + 1}`, name: `Campaign ${i + 1}` })
      )
      const mockAnalyticsData = Array.from({ length: 10 }, (_, i) =>
        createMockAnalyticsData({
          campaignId: `campaign-${i + 1}`,
          conversions: 100 - i * 10, // Descending performance
        })
      )

      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns)

      const result = await DashboardService.getTopPerformers(userId, dateRange)

      expect(result).toHaveLength(5)
    })
  })

  describe('getActiveAlerts', () => {
    it('should return budget exceeded alerts', async () => {
      const userId = 'user-1'
      const mockCampaigns = [
        createMockCampaign({
          id: 'campaign-1',
          name: 'Over Budget Campaign',
          budgetDaily: 100,
        }),
      ]
      const mockAnalyticsData = [
        createMockAnalyticsData({
          campaignId: 'campaign-1',
          spend: 120, // Exceeds daily budget
          date: new Date(), // Today
        }),
      ]

      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns)
      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.getActiveAlerts(userId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        type: 'BUDGET_EXCEEDED',
        severity: 'HIGH',
        campaignId: 'campaign-1',
      })
    })

    it('should return low performance alerts', async () => {
      const userId = 'user-1'
      const mockCampaigns = [
        createMockCampaign({
          id: 'campaign-1',
          name: 'Low Performance Campaign',
        }),
      ]
      const mockAnalyticsData = [
        createMockAnalyticsData({
          campaignId: 'campaign-1',
          ctr: 1.0, // Low CTR (below 2% threshold)
          date: new Date(),
        }),
      ]

      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns)
      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.getActiveAlerts(userId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        type: 'LOW_PERFORMANCE',
        severity: 'MEDIUM',
        campaignId: 'campaign-1',
      })
    })

    it('should return empty array when no alerts', async () => {
      const userId = 'user-1'

      mockPrisma.campaign.findMany.mockResolvedValue([])
      mockPrisma.analyticsData.findMany.mockResolvedValue([])

      const result = await DashboardService.getActiveAlerts(userId)

      expect(result).toEqual([])
    })
  })

  describe('getRevenueData', () => {
    it('should return daily revenue data', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
      }
      const mockAnalyticsData = [
        createMockAnalyticsData({
          date: new Date('2024-01-01'),
          spend: 200,
          conversions: 10,
        }),
        createMockAnalyticsData({
          date: new Date('2024-01-02'),
          spend: 240,
          conversions: 12,
        }),
        createMockAnalyticsData({
          date: new Date('2024-01-03'),
          spend: 160,
          conversions: 8,
        }),
      ]

      mockPrisma.analyticsData.findMany.mockResolvedValue(mockAnalyticsData)

      const result = await DashboardService.getRevenueData(userId, dateRange)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        date: '2024-01-01',
        spend: 200,
        revenue: 1000, // Assuming 10 conversions * $100 average value
      })
    })

    it('should handle missing data gracefully', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      mockPrisma.analyticsData.findMany.mockResolvedValue([])

      const result = await DashboardService.getRevenueData(userId, dateRange)

      expect(result).toEqual([])
    })
  })
})