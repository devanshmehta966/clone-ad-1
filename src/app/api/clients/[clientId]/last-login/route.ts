import { NextRequest } from 'next/server'
import { ClientsController } from '@/lib/controllers/clients.controller'

export const runtime = 'nodejs'

export async function PUT(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  const params = await context.params
  return ClientsController.updateClientLastLogin(request, { params })
}