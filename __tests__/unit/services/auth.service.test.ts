import { AuthService } from '@/lib/services/auth.service'
import prisma from '@/lib/prisma'
import { hash, verify } from 'argon2'
import { createMockUser } from '../../utils/test-factories'

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('argon2')

describe('AuthService', () => {
  let mockPrisma: jest.Mocked<typeof prisma>
  let mockHash: jest.MockedFunction<typeof hash>
  let mockVerify: jest.MockedFunction<typeof verify>

  beforeEach(() => {
    mockPrisma = prisma as jest.Mocked<typeof prisma>
    mockHash = hash as jest.MockedFunction<typeof hash>
    mockVerify = verify as jest.MockedFunction<typeof verify>
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const hashedPassword = 'hashed-password'
      const mockUser = createMockUser({ ...userData, password: hashedPassword })

      mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      mockHash.mockResolvedValue(hashedPassword)
      mockPrisma.user.create.mockResolvedValue(mockUser)

      const result = await AuthService.register(userData)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      })
      expect(mockHash).toHaveBeenCalledWith(userData.password)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
        },
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }
      const existingUser = createMockUser({ email: userData.email })

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      await expect(AuthService.register(userData)).rejects.toThrow('User already exists')
      expect(mockHash).not.toHaveBeenCalled()
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockHash.mockResolvedValue('hashed-password')
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

      await expect(AuthService.register(userData)).rejects.toThrow('Database error')
    })
  })

  describe('validateCredentials', () => {
    it('should return user for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }
      const mockUser = createMockUser({
        email: credentials.email,
        password: 'hashed-password',
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockVerify.mockResolvedValue(true)

      const result = await AuthService.validateCredentials(credentials)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      })
      expect(mockVerify).toHaveBeenCalledWith('hashed-password', credentials.password)
      expect(result).toEqual(mockUser)
    })

    it('should return null for invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }
      const mockUser = createMockUser({
        email: credentials.email,
        password: 'hashed-password',
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockVerify.mockResolvedValue(false)

      const result = await AuthService.validateCredentials(credentials)

      expect(result).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.validateCredentials(credentials)

      expect(result).toBeNull()
      expect(mockVerify).not.toHaveBeenCalled()
    })

    it('should return null for user without password (OAuth only)', async () => {
      const credentials = {
        email: 'oauth@example.com',
        password: 'password123',
      }
      const mockUser = createMockUser({
        email: credentials.email,
        password: null, // OAuth user without password
      })

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await AuthService.validateCredentials(credentials)

      expect(result).toBeNull()
      expect(mockVerify).not.toHaveBeenCalled()
    })
  })

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-1'
      const mockUser = createMockUser({ id: userId })

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await AuthService.getUserById(userId)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      const userId = 'non-existent'

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.getUserById(userId)

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1'
      const updateData = { name: 'Updated Name' }
      const mockUser = createMockUser({ id: userId, ...updateData })

      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await AuthService.updateUser(userId, updateData)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('should handle password updates with hashing', async () => {
      const userId = 'user-1'
      const updateData = { password: 'newpassword123' }
      const hashedPassword = 'new-hashed-password'
      const mockUser = createMockUser({ id: userId, password: hashedPassword })

      mockHash.mockResolvedValue(hashedPassword)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await AuthService.updateUser(userId, updateData)

      expect(mockHash).toHaveBeenCalledWith(updateData.password)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedPassword },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('createOAuthUser', () => {
    it('should create OAuth user without password', async () => {
      const oauthData = {
        email: 'oauth@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
      }
      const mockUser = createMockUser({ ...oauthData, password: null })

      mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockUser)

      const result = await AuthService.createOAuthUser(oauthData)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: oauthData,
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return existing OAuth user', async () => {
      const oauthData = {
        email: 'existing@example.com',
        name: 'Existing User',
        image: 'https://example.com/avatar.jpg',
      }
      const existingUser = createMockUser({ email: oauthData.email })

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      const result = await AuthService.createOAuthUser(oauthData)

      expect(mockPrisma.user.create).not.toHaveBeenCalled()
      expect(result).toEqual(existingUser)
    })
  })
})