import { prisma } from '@/lib/prisma'
import { ClientStatus } from '@prisma/client'
import type { CreateClientInput, UpdateClientInput, ClientQueryInput } from '@/lib/validation/clients.schemas'

export class ClientsService {
  static async getClients(userId: string, query: ClientQueryInput) {
    const { status, search, page, limit } = query
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' as const } },
          { businessEmail: { contains: search, mode: 'insensitive' as const } },
          { industry: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ])

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async getClientById(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    return client
  }

  static async createClient(userId: string, data: CreateClientInput) {
    const client = await prisma.client.create({
      data: {
        ...data,
        userId,
        businessEmail: data.businessEmail || null,
        businessWebsite: data.businessWebsite || null,
      },
    })

    return client
  }

  static async updateClient(userId: string, clientId: string, data: UpdateClientInput) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...data,
        businessEmail: data.businessEmail || null,
        businessWebsite: data.businessWebsite || null,
      },
    })

    return updatedClient
  }

  static async deleteClient(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    await prisma.client.delete({
      where: { id: clientId },
    })

    return { success: true }
  }

  static async getClientStats(userId: string) {
    const [total, active, trial, inactive] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.client.count({ where: { userId, status: ClientStatus.ACTIVE } }),
      prisma.client.count({ where: { userId, status: ClientStatus.TRIAL } }),
      prisma.client.count({ where: { userId, status: ClientStatus.INACTIVE } }),
    ])

    return {
      total,
      active,
      trial,
      inactive,
    }
  }

  static async updateClientLastLogin(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { lastLoginAt: new Date() },
    })

    return { success: true }
  }
}