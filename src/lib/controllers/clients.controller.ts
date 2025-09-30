import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ClientsService } from '@/lib/services/clients.service'
import { CreateClientSchema, UpdateClientSchema, ClientQuerySchema } from '@/lib/validation/clients.schemas'
import { z } from 'zod'

export class ClientsController {
  static async getClients(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const queryParams = {
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
      }

      const validatedQuery = ClientQuerySchema.parse(queryParams)
      const result = await ClientsService.getClients(session.user.id, validatedQuery)

      return Response.json(result)
    } catch (error) {
      console.error('Error fetching clients:', error)
      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async getClientById(request: NextRequest, { params }: { params: { clientId: string } }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const client = await ClientsService.getClientById(session.user.id, params.clientId)
      return Response.json(client)
    } catch (error) {
      console.error('Error fetching client:', error)
      if (error instanceof Error && error.message === 'Client not found') {
        return Response.json({ error: 'Client not found' }, { status: 404 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async createClient(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const validatedData = CreateClientSchema.parse(body)
      
      const client = await ClientsService.createClient(session.user.id, validatedData)
      return Response.json(client, { status: 201 })
    } catch (error) {
      console.error('Error creating client:', error)
      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async updateClient(request: NextRequest, { params }: { params: { clientId: string } }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const validatedData = UpdateClientSchema.parse(body)
      
      const client = await ClientsService.updateClient(session.user.id, params.clientId, validatedData)
      return Response.json(client)
    } catch (error) {
      console.error('Error updating client:', error)
      if (error instanceof Error && error.message === 'Client not found') {
        return Response.json({ error: 'Client not found' }, { status: 404 })
      }
      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async deleteClient(request: NextRequest, { params }: { params: { clientId: string } }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      await ClientsService.deleteClient(session.user.id, params.clientId)
      return Response.json({ success: true })
    } catch (error) {
      console.error('Error deleting client:', error)
      if (error instanceof Error && error.message === 'Client not found') {
        return Response.json({ error: 'Client not found' }, { status: 404 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async getClientStats(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const stats = await ClientsService.getClientStats(session.user.id)
      return Response.json(stats)
    } catch (error) {
      console.error('Error fetching client stats:', error)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  static async updateClientLastLogin(request: NextRequest, { params }: { params: { clientId: string } }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      await ClientsService.updateClientLastLogin(session.user.id, params.clientId)
      return Response.json({ success: true })
    } catch (error) {
      console.error('Error updating client last login:', error)
      if (error instanceof Error && error.message === 'Client not found') {
        return Response.json({ error: 'Client not found' }, { status: 404 })
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}