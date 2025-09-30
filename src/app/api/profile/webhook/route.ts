import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Stores webhook provider/url for the current user.
export async function PUT(req: NextRequest) {
  try {
    const { provider, url } = (await req.json()) as {
      provider: 'slack' | 'generic' | 'email'
      url?: string
    }

    if (!provider) {
      return Response.json({ error: 'provider is required' }, { status: 400 })
    }

    if (provider !== 'email') {
      if (!url) return Response.json({ error: 'url is required' }, { status: 400 })
      try {
        new URL(url)
      } catch {
        return Response.json({ error: 'invalid url' }, { status: 400 })
      }
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Ensure profile exists
    let profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.user.id } })
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        webhookProvider: provider,
        webhookUrl: provider === 'email' ? null : url,
      },
    })

    return Response.json({ ok: true })
  } catch (e: any) {
    console.error('webhook save error', e)
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }
}
