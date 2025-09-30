import { ClientsController } from '@/lib/controllers/clients.controller'
import { ClientsService } from '@/lib/services/clients.service'
import { createMockClient } from '../../utils/test-factories'

// Mock the ClientsService
jest.mock('@/lib/services/clients.service')

describe('ClientsController', () => {
  let clientsController: ClientsController
  let mockClientsService: jest.Mocked<typeof ClientsService>

  beforeEach(() => {
    clientsController = new ClientsController()
    mockClientsService = ClientsService as jest.Mocked<typeof ClientsService>
    jest.clearAllMocks()
  })

  describe('getClients', () => {
    it('should return paginated clients for user', async () => {
      const userId = 'user-1'
      const pagination = { page: 1, limit: 10 }
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

      mockClientsService.getClients.mockResolvedValue(mockResult)

      const result = await clientsController.getClients(userId, pagination)

      expect(mockClientsService.getClients).toHaveBeenCalledWith(userId, pagination)
      expect(result).toEqual(mockResult)
    })

    it('should handle empty client list', async () => {
      const userId = 'user-1'
      const pagination = { page: 1, limit: 10 }
      const mockResult = {
        clients: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      mockClientsService.getClients.mockResolvedValue(mockResult)

      const result = await clientsController.getClients(userId, pagination)

      expect(result).toEqual(mockResult)
    })
  })

  describe('getClientById', () => {
    it('should return client by id', async () => {
      const userId = 'user-1'
      const clientId = 'client-1'
      const mockClient = createMockClient({ id: clientId, userId })

      mockClientsService.getClientById.mockResolvedValue(mockClient)

      const result = await clientsController.getClientById(userId, clientId)

      expect(mockClientsService.getClientById).toHaveBeenCalledWith(userId, clientId)
      expect(result).toEqual(mockClient)
    })

    it('should return null for non-existent client', async () => {
      const userId = 'user-1'
      const clientId = 'non-existent'

      mockClientsService.getClientById.mockResolvedValue(null)

      const result = await clientsController.getClientById(userId, clientId)

      expect(result).toBeNull()
    })
  })

  describe('createClient', () => {
    it('should create new client successfully', async () => {
      const userId = 'user-1'
      const clientData = {
        businessName: 'New Client',
        businessEmail: 'client@example.com',
        businessPhone: '+1234567890',
        businessWebsite: 'https://client.com',
        industry: 'Technology',
      }
      const mockClient = createMockClient({ ...clientData, userId })

      mockClientsService.createClient.mockResolvedValue(mockClient)

      const result = await clientsController.createClient(userId, clientData)

      expect(mockClientsService.createClient).toHaveBeenCalledWith(userId, clientData)
      expect(result).toEqual(mockClient)
    })

    it('should handle validation errors', async () => {
      const userId = 'user-1'
      const invalidClientData = {
        businessName: '', // Invalid empty name
        businessEmail: 'invalid-email',
      }

      mockClientsService.createClient.mockRejectedValue(new Error('Validation failed'))

      await expect(
        clientsController.createClient(userId, invalidClientData)
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('updateClient', () => {
    it('should update client successfully', async () => {
      const userId = 'user-1'
      const clientId = 'client-1'
      const updateData = {
        businessName: 'Updated Client Name',
        industry: 'Healthcare',
      }
      const mockClient = createMockClient({ id: clientId, userId, ...updateData })

      mockClientsService.updateClient.mockResolvedValue(mockClient)

      const result = await clientsController.updateClient(userId, clientId, updateData)

      expect(mockClientsService.updateClient).toHaveBeenCalledWith(userId, clientId, updateData)
      expect(result).toEqual(mockClient)
    })

    it('should handle non-existent client update', async () => {
      const userId = 'user-1'
      const clientId = 'non-existent'
      const updateData = { businessName: 'Updated Name' }

      mockClientsService.updateClient.mockRejectedValue(new Error('Client not found'))

      await expect(
        clientsController.updateClient(userId, clientId, updateData)
      ).rejects.toThrow('Client not found')
    })
  })

  describe('deleteClient', () => {
    it('should delete client successfully', async () => {
      const userId = 'user-1'
      const clientId = 'client-1'

      mockClientsService.deleteClient.mockResolvedValue(true)

      const result = await clientsController.deleteClient(userId, clientId)

      expect(mockClientsService.deleteClient).toHaveBeenCalledWith(userId, clientId)
      expect(result).toBe(true)
    })

    it('should handle non-existent client deletion', async () => {
      const userId = 'user-1'
      const clientId = 'non-existent'

      mockClientsService.deleteClient.mockRejectedValue(new Error('Client not found'))

      await expect(
        clientsController.deleteClient(userId, clientId)
      ).rejects.toThrow('Client not found')
    })
  })

  describe('getClientStats', () => {
    it('should return client statistics', async () => {
      const userId = 'user-1'
      const mockStats = {
        totalClients: 25,
        activeClients: 20,
        trialClients: 3,
        inactiveClients: 2,
        recentSignups: 5,
        churnRate: 8.0,
      }

      mockClientsService.getClientStats.mockResolvedValue(mockStats)

      const result = await clientsController.getClientStats(userId)

      expect(mockClientsService.getClientStats).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockStats)
    })
  })

  describe('updateLastLogin', () => {
    it('should update client last login timestamp', async () => {
      const userId = 'user-1'
      const clientId = 'client-1'
      const loginTime = new Date()
      const mockClient = createMockClient({ id: clientId, userId, lastLoginAt: loginTime })

      mockClientsService.updateLastLogin.mockResolvedValue(mockClient)

      const result = await clientsController.updateLastLogin(userId, clientId)

      expect(mockClientsService.updateLastLogin).toHaveBeenCalledWith(userId, clientId)
      expect(result).toEqual(mockClient)
    })
  })
})