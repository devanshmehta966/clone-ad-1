import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { customerPrisma } from './customer-prisma'

// Custom adapter that uses the customer database for NextAuth
export const customerAdapter = PrismaAdapter(customerPrisma)
