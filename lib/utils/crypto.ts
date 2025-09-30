import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combine iv + tag + encrypted data
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')])
    return combined.toString('base64')
  } catch (error) {
    throw new Error('Encryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Extract iv, tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH)
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH)
    
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error('Decryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex')
}