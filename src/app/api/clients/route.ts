import { NextRequest } from 'next/server'
import { ClientsController } from '@/lib/controllers/clients.controller'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return ClientsController.getClients(request)
}

export async function POST(request: NextRequest) {
  return ClientsController.createClient(request)
}