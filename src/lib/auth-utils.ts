import * as argon2 from 'argon2'

/**
 * Hash a password using argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  })
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Generate a secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>()

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      return false
    }

    // Increment attempts
    record.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0
    
    const now = Date.now()
    return Math.max(0, record.resetTime - now)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Global rate limiters
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const registrationRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour