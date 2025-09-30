import { hash, verify } from 'argon2'
import { customerPrisma } from '../../../lib/customer-prisma'
import { APIError } from '../types/api'
import { SignUpData, SignInData } from '../validation/auth.schemas'

export class AuthService {
  async createUser(data: SignUpData) {
    // Check if user already exists
    const existingUser = await customerPrisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new APIError('USER_EXISTS', 'User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hash(data.password)

    // Create user with profile
    const user = await customerPrisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        profile: {
          create: {
            fullName: data.name,
            businessName: data.businessName,
            businessEmail: data.businessEmail,
            businessPhone: data.businessPhone,
            businessWebsite: data.businessWebsite
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async validateCredentials(data: SignInData) {
    const user = await customerPrisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true }
    })

    if (!user || !user.password) {
      throw new APIError('INVALID_CREDENTIALS', 'Invalid email or password', 401)
    }

    const isValidPassword = await verify(user.password, data.password)
    if (!isValidPassword) {
      throw new APIError('INVALID_CREDENTIALS', 'Invalid email or password', 401)
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async getUserProfile(userId: string) {
    const user = await customerPrisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
      throw new APIError('USER_NOT_FOUND', 'User not found', 404)
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async updateUserProfile(userId: string, data: Partial<SignUpData>) {
    const updateData: any = {}
    const profileUpdateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.password) updateData.password = await hash(data.password)

    if (data.name) profileUpdateData.fullName = data.name
    if (data.businessName) profileUpdateData.businessName = data.businessName
    if (data.businessEmail) profileUpdateData.businessEmail = data.businessEmail
    if (data.businessPhone) profileUpdateData.businessPhone = data.businessPhone
    if (data.businessWebsite) profileUpdateData.businessWebsite = data.businessWebsite

    const user = await customerPrisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        profile: Object.keys(profileUpdateData).length > 0 ? {
          upsert: {
            create: profileUpdateData,
            update: profileUpdateData
          }
        } : undefined
      },
      include: { profile: true }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}