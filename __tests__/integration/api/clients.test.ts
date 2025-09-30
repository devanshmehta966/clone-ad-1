import { GET, POST } from '@/app/api/clients/route'
import { createMockNextRequest, createMockClient } from '../../utils/test-factories'
import { ClientsService } from '@/lib/services/clients.service'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('@/lib/services/clients.service')
jest.mock('next-auth')

describe('/api/clients', () => {
  let mockClientsService: jest.Mocked<typeof ClientsService>
  let mockGetServerSession: jest.MockedFunction<typeof getServerSession>

  beforeEach(() => {
    mockClientsService = ClientsService as jest.Mocked<typeof ClientsService>
    mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return paginated clients for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }
      const mockClients = [
        createMockClient({ id: 'client-1', businessName: 'Client 1' }),
        createMockClient({ id: 'client-2', businessName: 'Client 2' }),
      ]
      const mockResult = {
        clients: mockClients,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockClientsService.getClients.mockResolvedValue(mockResult)

      const url = new URL('http://localhost:3000/api/clients')
      url.searchParams.set('page', '1')
      url.searchParams.set('limit', '10')

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockResult)
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/clients')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
    })

    it('should handle invalid pagination parameters', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const url = new URL('http://localhost:3000/api/clients')
      url.searchParams.set('page', '-1') // Invalid page
      url.searchParams.set('limit', '0') // Invalid limit

      const request = createMockNextRequest(url.toString())
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
    })
  })

  describe('POST', () => {
    it('should create a new client successfully', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }
      const clientData = {
        businessName: 'New Client',
        businessEmail: 'client@example.com',
        businessPhone: '+1234567890',
        businessWebsite: 'https://client.com',
        industry: 'Technology',
      }
      const mockClient = createMockClient({ ...clientData, userId: 'user-1' })

      mockGetServerSession.mockResolvedValue(mockSession)
      mockClientsService.createClient.mockResolvedValue(mockClient)

      const request = createMockNextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(201)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockClient)
    })

    it('should return 400 for invalid client data', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }
      const invalidData = {
        businessName: '', // Required field empty
        businessEmail: 'invalid-email',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const request = createMockNextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('validation')
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const clientData = {
        businessName: 'New Client',
        businessEmail: 'client@example.com',
      }

      const request = createMockNextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
    })

    it('should handle service errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
      }
      const clientData = {
        businessName: 'New Client',
        businessEmail: 'client@example.com',
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockClientsService.createClient.mockRejectedValue(new Error('Database error'))

      const request = createMockNextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Internal server error')
    })
  })
})