import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthController } from '../../../../../lib/controllers/auth.controller'

export const runtime = 'nodejs'

const authController = new AuthController()

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return authController.updateNotificationPreferences(request, session.user.id)
}