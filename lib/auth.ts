import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import CredentialsProvider from 'next-auth/providers/credentials'
import { customerAdapter } from './customer-adapter'
import { customerPrisma } from './customer-prisma'
import { verifyPassword, loginRateLimiter } from './auth-utils'
// Import environment variables directly to avoid validation during build
const isProduction = process.env.NODE_ENV === 'production'
import { InputSanitizer } from './security'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128)
})

export const authOptions: NextAuthOptions = {
  adapter: customerAdapter,
  providers: [
    // Only add providers if environment variables are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET ? [
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      })
    ] : []),
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
          let { email, password } = validatedCredentials
          
          // Sanitize inputs
          email = InputSanitizer.sanitizeEmail(email)
          
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
            // Record failed attempt
            loginRateLimiter.recordAttempt(identifier)
            throw new Error('Invalid credentials')
          }
          
          // Verify password
          const isValidPassword = await verifyPassword(user.password, password)
          
          if (!isValidPassword) {
            // Record failed attempt
            loginRateLimiter.recordAttempt(identifier)
            throw new Error('Invalid credentials')
          }
          
          // Clear rate limit on successful login
          loginRateLimiter.reset(identifier)
          
          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.profile?.fullName,
            image: user.image || user.profile?.avatarUrl,
            role: user.role
          }
        } catch (error) {
          // Don't log sensitive information in production
          if (!isProduction) {
            console.error('Authentication error:', error)
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: isProduction ? 24 * 60 * 60 : 30 * 24 * 60 * 60, // 1 day in prod, 30 days in dev
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: isProduction ? 24 * 60 * 60 : 30 * 24 * 60 * 60, // 1 day in prod, 30 days in dev
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
  },
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: isProduction && process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined,
      },
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: isProduction && process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined,
      },
    },
    csrfToken: {
      name: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role
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
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string
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
    signOut: '/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account }) {
      if (!isProduction) {
        console.log(`User ${user.email} signed in with ${account?.provider}`)
      }
      
      // Update last login time
      if (user.id) {
        await customerPrisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }
        }).catch(() => {
          // Ignore errors to prevent login failure
        })
      }
    },
    async signOut() {
      if (!isProduction) {
        console.log('User signed out')
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}