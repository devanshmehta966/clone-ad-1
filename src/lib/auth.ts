import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import CredentialsProvider from 'next-auth/providers/credentials'
import { customerAdapter } from '../../lib/customer-adapter'
import { customerPrisma } from '../../lib/customer-prisma'
import { verifyPassword, loginRateLimiter } from './auth-utils'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const authOptions: NextAuthOptions = {
  adapter: customerAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          // Validate input
          const validatedCredentials = credentialsSchema.parse(credentials)
          const { email, password } = validatedCredentials
          
          // Rate limiting check
          const clientIP = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
          const identifier = `${email}:${clientIP}`
          
          if (!loginRateLimiter.isAllowed(identifier)) {
            const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(identifier) / 1000 / 60)
            throw new Error(`Too many login attempts. Please try again in ${remainingTime} minutes.`)
          }
          
          // Find user in database
          const user = await customerPrisma.user.findUnique({
            where: { email },
            include: { profile: true }
          })
          
          if (!user || !user.password) {
            throw new Error('Invalid credentials')
          }
          
          // Verify password
          const isValidPassword = await verifyPassword(user.password, password)
          
          if (!isValidPassword) {
            throw new Error('Invalid credentials')
          }
          
          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.profile?.fullName,
            image: user.image || user.profile?.avatarUrl,
            role: user.role
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      
      // OAuth account linking
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true
      }
      
      // For credentials, user validation is handled in authorize
      return !!user
    },
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    },
    async signOut({ session, token }) {
      console.log(`User signed out`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}