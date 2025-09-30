import { DashboardController } from '@/lib/controllers/dashboard.controller'
import { DashboardService } from '@/lib/services/dashboard.service'
import { createMockAnalyticsData } from '../../utils/test-factories'

// Mock the DashboardService
jest.mock('@/lib/services/dashboard.service')

describe('DashboardController', () => {
  let dashboardController: DashboardController
  let mockDashboardService: jest.Mocked<typeof DashboardService>

  beforeEach(() => {
    dashboardController = new DashboardController()
    mockDashboardService = DashboardService as jest.Mocked<typeof DashboardService>
    jest.clearAllMocks()
  })

  describe('getMetrics', () => {
    it('should return dashboard metrics for user', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockMetrics = {
        totalSpend: 1000,
        totalClicks: 5000,
        totalImpressions: 100000,
        totalConversions: 250,
        averageCPC: 0.20,
        averageCTR: 5.0,
        conversionRate: 5.0,
      }

      mockDashboardService.calculateMetrics.mockResolvedValue(mockMetrics)

      const result = await dashboardController.getMetrics(userId, dateRange)

      expect(mockDashboardService.calculateMetrics).toHaveBeenCalledWith(userId, dateRange)
      expect(result).toEqual(mockMetrics)
    })

    it('should handle empty metrics gracefully', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const emptyMetrics = {
        totalSpend: 0,
        totalClicks: 0,
        totalImpressions: 0,
        totalConversions: 0,
        averageCPC: 0,
        averageCTR: 0,
        conversionRate: 0,
      }

      mockDashboardService.calculateMetrics.mockResolvedValue(emptyMetrics)

      const result = await dashboardController.getMetrics(userId, dateRange)

      expect(result).toEqual(emptyMetrics)
    })
  })

  describe('getPerformanceData', () => {
    it('should return performance data by platform', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockPerformanceData = [
        createMockAnalyticsData({ platform: 'GOOGLE_ADS', spend: 500 }),
        createMockAnalyticsData({ platform: 'META_ADS', spend: 300 }),
        createMockAnalyticsData({ platform: 'LINKEDIN_ADS', spend: 200 }),
      ]

      mockDashboardService.getPerformanceData.mockResolvedValue(mockPerformanceData)

      const result = await dashboardController.getPerformanceData(userId, dateRange)

      expect(mockDashboardService.getPerformanceData).toHaveBeenCalledWith(userId, dateRange)
      expect(result).toEqual(mockPerformanceData)
    })
  })

  describe('getTopPerformers', () => {
    it('should return top performing campaigns', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockTopPerformers = [
        {
          campaignId: 'campaign-1',
          campaignName: 'Top Campaign',
          platform: 'GOOGLE_ADS',
          conversions: 100,
          spend: 500,
          roas: 4.0,
        },
        {
          campaignId: 'campaign-2',
          campaignName: 'Second Campaign',
          platform: 'META_ADS',
          conversions: 80,
          spend: 400,
          roas: 3.5,
        },
      ]

      mockDashboardService.getTopPerformers.mockResolvedValue(mockTopPerformers)

      const result = await dashboardController.getTopPerformers(userId, dateRange)

      expect(mockDashboardService.getTopPerformers).toHaveBeenCalledWith(userId, dateRange)
      expect(result).toEqual(mockTopPerformers)
    })
  })

  describe('getAlerts', () => {
    it('should return active alerts for user', async () => {
      const userId = 'user-1'
      const mockAlerts = [
        {
          id: 'alert-1',
          type: 'BUDGET_EXCEEDED',
          message: 'Campaign budget exceeded by 20%',
          severity: 'HIGH',
          campaignId: 'campaign-1',
          createdAt: new Date(),
        },
        {
          id: 'alert-2',
          type: 'LOW_PERFORMANCE',
          message: 'Campaign performance below threshold',
          severity: 'MEDIUM',
          campaignId: 'campaign-2',
          createdAt: new Date(),
        },
      ]

      mockDashboardService.getActiveAlerts.mockResolvedValue(mockAlerts)

      const result = await dashboardController.getAlerts(userId)

      expect(mockDashboardService.getActiveAlerts).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockAlerts)
    })

    it('should return empty array when no alerts', async () => {
      const userId = 'user-1'

      mockDashboardService.getActiveAlerts.mockResolvedValue([])

      const result = await dashboardController.getAlerts(userId)

      expect(result).toEqual([])
    })
  })

  describe('getRevenueData', () => {
    it('should return revenue data over time', async () => {
      const userId = 'user-1'
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }
      const mockRevenueData = [
        { date: '2024-01-01', revenue: 1000, spend: 200 },
        { date: '2024-01-02', revenue: 1200, spend: 240 },
        { date: '2024-01-03', revenue: 800, spend: 160 },
      ]

      mockDashboardService.getRevenueData.mockResolvedValue(mockRevenueData)

      const result = await dashboardController.getRevenueData(userId, dateRange)

      expect(mockDashboardService.getRevenueData).toHaveBeenCalledWith(userId, dateRange)
      expect(result).toEqual(mockRevenueData)
    })
  })
})