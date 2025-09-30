import { AuthController } from '../../../lib/controllers/auth.controller'
import { AuthService } from '../../../lib/services/auth.service'
import { createMockUser } from '../../utils/test-factories'

// Mock the AuthService
jest.mock('../../../lib/services/auth.service')

describe('AuthController', () => {
  let authController: AuthController
  let mockAuthService: jest.Mocked<typeof AuthService>

  beforeEach(() => {
    authController = new AuthController()
    mockAuthService = AuthService as jest.Mocked<typeof AuthService>
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const mockUser = createMockUser(userData)

      mockAuthService.register.mockResolvedValue(mockUser)

      const result = await authController.register(userData)

      expect(mockAuthService.register).toHaveBeenCalledWith(userData)
      expect(result).toEqual(mockUser)
    })

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }

      mockAuthService.register.mockRejectedValue(new Error('Email already exists'))

      await expect(authController.register(userData)).rejects.toThrow('Email already exists')
    })
  })

  describe('validateCredentials', () => {
    it('should return user for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }
      const mockUser = createMockUser({ email: credentials.email })

      mockAuthService.validateCredentials.mockResolvedValue(mockUser)

      const result = await authController.validateCredentials(credentials)

      expect(mockAuthService.validateCredentials).toHaveBeenCalledWith(credentials)
      expect(result).toEqual(mockUser)
    })

    it('should return null for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      mockAuthService.validateCredentials.mockResolvedValue(null)

      const result = await authController.validateCredentials(credentials)

      expect(result).toBeNull()
    })
  })

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-1'
      const mockUser = createMockUser({ id: userId })

      mockAuthService.getUserById.mockResolvedValue(mockUser)

      const result = await authController.getUserById(userId)

      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      const userId = 'non-existent'

      mockAuthService.getUserById.mockResolvedValue(null)

      const result = await authController.getUserById(userId)

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1'
      const updateData = { name: 'Updated Name' }
      const mockUser = createMockUser({ id: userId, ...updateData })

      mockAuthService.updateUser.mockResolvedValue(mockUser)

      const result = await authController.updateUser(userId, updateData)

      expect(mockAuthService.updateUser).toHaveBeenCalledWith(userId, updateData)
      expect(result).toEqual(mockUser)
    })
  })
})