import { PrismaClient } from '../node_modules/.prisma/customer-client'

const globalForCustomerPrisma = globalThis as unknown as {
  customerPrisma: PrismaClient | undefined
}

export const customerPrisma =
  globalForCustomerPrisma.customerPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production')
  globalForCustomerPrisma.customerPrisma = customerPrisma
