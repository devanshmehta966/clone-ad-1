import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role: session.user.role,
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Auth status error:', error)
    
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check authentication status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}