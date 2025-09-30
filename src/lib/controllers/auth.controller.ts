import { NextRequest } from 'next/server'
import { BaseController } from './base.controller'
import { AuthService } from '../services/auth.service'
import { SignUpSchema, SignInSchema } from '../validation/auth.schemas'

export class AuthController extends BaseController {
  private authService = new AuthService()

  async signUp(request: NextRequest) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, SignUpSchema)
      const result = await this.authService.createUser(data)
      return result
    })
  }

  async signIn(request: NextRequest) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, SignInSchema)
      const result = await this.authService.validateCredentials(data)
      return result
    })
  }

  async getProfile(userId: string) {
    return this.handleRequest(async () => {
      const profile = await this.authService.getUserProfile(userId)
      return profile
    })
  }

  async updateProfile(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, SignUpSchema.partial())
      const result = await this.authService.updateUserProfile(userId, data)
      return result
    })
  }
}