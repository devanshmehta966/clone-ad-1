import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  CUSTOMER_DATABASE_URL: z.string().url('CUSTOMER_DATABASE_URL must be a valid URL'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // OAuth Providers (optional for build time)
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required').optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required').optional(),
  FACEBOOK_CLIENT_ID: z.string().min(1, 'FACEBOOK_CLIENT_ID is required').optional(),
  FACEBOOK_CLIENT_SECRET: z.string().min(1, 'FACEBOOK_CLIENT_SECRET is required').optional(),
  LINKEDIN_CLIENT_ID: z.string().min(1, 'LINKEDIN_CLIENT_ID is required').optional(),
  LINKEDIN_CLIENT_SECRET: z.string().min(1, 'LINKEDIN_CLIENT_SECRET is required').optional(),
  
  // Encryption (optional for build time)
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),
  
  // Rate Limiting
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Security
  ALLOWED_ORIGINS: z.string().optional(),
  
  // API Keys (for external integrations)
  GOOGLE_ADS_CLIENT_ID: z.string().optional(),
  GOOGLE_ADS_CLIENT_SECRET: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID_ADS: z.string().optional(),
  LINKEDIN_CLIENT_SECRET_ADS: z.string().optional(),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      )
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'