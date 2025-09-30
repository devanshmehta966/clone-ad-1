import NextAuth from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

// Export runtime config for Prisma compatibility
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }