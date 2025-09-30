import { POST } from '@/app/api/auth/register/route'
import { createMockNextRequest, createMockUser } from '../../utils/test-factories'
import { AuthService } from '@/lib/services/auth.service'

// Mock the AuthService
jest.mock('@/lib/services/auth.service')

describe('/api/auth/register', () => {
  let mockAuthService: jest.Mocked<typeof AuthService>

  beforeEach(() => {
    mockAuthService = AuthService as jest.Mocked<typeof AuthService>
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const mockUser = createMockUser(userData)

      mockAuthService.register.mockResolvedValue(mockUser)

      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(201)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
      expect(responseData.data.password).toBeUndefined() // Password should not be returned
    })

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        name: '',
      }

      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('validation')
    })

    it('should return 409 for existing user', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }

      mockAuthService.register.mockRejectedValue(new Error('User already exists'))

      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(409)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('User already exists')
    })

    it('should return 500 for server errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      mockAuthService.register.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Internal server error')
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing password and name
      }

      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
    })

    it('should return 400 for malformed JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
    })
  })
})