import { GET } from '@/app/api/dashboard/metrics/route'
import { createMockNextRequest } from '../../utils/test-factories'
import { DashboardService } from '@/lib/services/dashboard.service'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('@/lib/services/dashboard.service')
jest.mock('next-auth')

describe('/api/dashboard/metrics', () => {
  let mockDashboardService: jest.Mocked<typeof DashboardService>
  let mockGetServerSession: jest.MockedFunction<typeof getServerSession>

  beforeEach(() => {
    mockDashboardService = DashboardService as jest.Mocked<typeof DashboardService>
    mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return dashboard metrics for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
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

      mockGetServerSession.mockResolvedValue(mockSession)
      mockDashboardService.calculateMetrics.mockResolvedValue(mockMetrics)

      const url = new URL('http://localhost:3000/api/dashboard/metrics')
      url.searchParams.set('startDate', '2024-01-01')
      url.searchParams.set('endDate', '2024-01-31')

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockMetrics)
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/dashboard/metrics')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid date parameters', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const url = new URL('http://localhost:3000/api/dashboard/metrics')
      url.searchParams.set('startDate', 'invalid-date')
      url.searchParams.set('endDate', '2024-01-31')

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('validation')
    })

    it('should return 400 when end date is before start date', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const url = new URL('http://localhost:3000/api/dashboard/metrics')
      url.searchParams.set('startDate', '2024-01-31')
      url.searchParams.set('endDate', '2024-01-01') // End before start

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
    })

    it('should handle service errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockDashboardService.calculateMetrics.mockRejectedValue(new Error('Database error'))

      const url = new URL('http://localhost:3000/api/dashboard/metrics')
      url.searchParams.set('startDate', '2024-01-01')
      url.searchParams.set('endDate', '2024-01-31')

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Internal server error')
    })

    it('should use default date range when not provided', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }
      const mockMetrics = {
        totalSpend: 500,
        totalClicks: 2500,
        totalImpressions: 50000,
        totalConversions: 125,
        averageCPC: 0.20,
        averageCTR: 5.0,
        conversionRate: 5.0,
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockDashboardService.calculateMetrics.mockResolvedValue(mockMetrics)

      const request = createMockNextRequest('http://localhost:3000/api/dashboard/metrics')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(mockDashboardService.calculateMetrics).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      )
    })
  })
})