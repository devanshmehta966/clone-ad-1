import { NextRequest } from 'next/server'
import { ClientsController } from '@/lib/controllers/clients.controller'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  const params = await context.params
  return ClientsController.getClientById(request, { params })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  const params = await context.params
  return ClientsController.updateClient(request, { params })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  const params = await context.params
  return ClientsController.deleteClient(request, { params })
}