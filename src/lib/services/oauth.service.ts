import { randomBytes } from 'crypto'
import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { encrypt, decrypt } from '../utils/crypto'

export class OAuthService {
  private readonly redirectUri = process.env.NEXTAUTH_URL + '/api/integrations/oauth/callback'

  async initiateOAuth(provider: string, userId: string) {
    // Generate secure state parameter with provider encoded
    const stateData = {
      random: randomBytes(16).toString('hex'),
      provider,
      userId,
      timestamp: Date.now()
    }
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url')
    
    // Store state temporarily (in production, use Redis or similar)
    // For now, we'll store it in the database with a short expiry
    await prisma.oAuthIntegration.upsert({
      where: {
        userId_platform: {
          userId,
          platform: this.mapProviderToPlatform(provider)
        }
      },
      create: {
        userId,
        platform: this.mapProviderToPlatform(provider),
        metadata: { state, expiresAt: Date.now() + 600000 } // 10 minutes
      },
      update: {
        metadata: { state, expiresAt: Date.now() + 600000 }
      }
    })

    // Build OAuth URL based on provider
    const authUrl = this.buildAuthUrl(provider, state)
    return authUrl
  }

  async handleCallback(code: string, state: string, provider?: string) {
    // Decode state to get provider and other info
    let stateData: any
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch (error) {
      throw new APIError('INVALID_STATE', 'Invalid OAuth state parameter format', 400)
    }

    // Use provider from state if not provided
    const actualProvider = provider || stateData.provider
    if (!actualProvider) {
      throw new APIError('MISSING_PROVIDER', 'Provider not specified in callback', 400)
    }

    // Find the integration with matching state
    const integration = await prisma.oAuthIntegration.findFirst({
      where: {
        userId: stateData.userId,
        platform: this.mapProviderToPlatform(actualProvider),
        metadata: {
          path: ['state'],
          equals: state
        }
      }
    })

    if (!integration) {
      throw new APIError('INVALID_STATE', 'Invalid OAuth state parameter', 400)
    }

    // Check if state has expired
    const metadata = integration.metadata as any
    if (Date.now() > metadata.expiresAt) {
      throw new APIError('EXPIRED_STATE', 'OAuth state has expired', 400)
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, actualProvider)

    // Encrypt and store tokens
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null

    // Update integration with tokens
    const updatedIntegration = await prisma.oAuthIntegration.update({
      where: { id: integration.id },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        accountId: tokens.account_id,
        accountName: tokens.account_name,
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        isActive: true,
        syncStatus: 'IDLE',
        metadata: {} // Clear temporary state
      }
    })

    return {
      integrationId: updatedIntegration.id,
      platform: updatedIntegration.platform,
      accountName: updatedIntegration.accountName,
      isActive: updatedIntegration.isActive
    }
  }

  async refreshTokens(integrationId: string) {
    const integration = await prisma.oAuthIntegration.findUnique({
      where: { id: integrationId }
    })

    if (!integration || !integration.refreshToken) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found or no refresh token', 404)
    }

    const decryptedRefreshToken = decrypt(integration.refreshToken)
    const newTokens = await this.refreshAccessToken(decryptedRefreshToken, integration.platform)

    // Encrypt and update tokens
    const encryptedAccessToken = encrypt(newTokens.access_token)
    const encryptedRefreshToken = newTokens.refresh_token 
      ? encrypt(newTokens.refresh_token) 
      : integration.refreshToken

    await prisma.oAuthIntegration.update({
      where: { id: integrationId },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: newTokens.expires_in 
          ? new Date(Date.now() + newTokens.expires_in * 1000)
          : null
      }
    })

    return { success: true }
  }

  private buildAuthUrl(provider: string, state: string): string {
    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      linkedin: 'https://www.linkedin.com/oauth/v2/authorization'
    }

    const clientIds = {
      google: process.env.GOOGLE_CLIENT_ID,
      facebook: process.env.FACEBOOK_CLIENT_ID,
      linkedin: process.env.LINKEDIN_CLIENT_ID
    }

    const scopes = {
      google: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly',
      facebook: 'ads_read business_management',
      linkedin: 'r_ads r_ads_reporting'
    }

    const baseUrl = baseUrls[provider as keyof typeof baseUrls]
    const clientId = clientIds[provider as keyof typeof clientIds]
    const scope = scopes[provider as keyof typeof scopes]

    if (!baseUrl || !clientId) {
      throw new APIError('UNSUPPORTED_PROVIDER', `Provider ${provider} is not supported`, 400)
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.redirectUri,
      scope,
      response_type: 'code',
      state,
      access_type: 'offline', // For Google to get refresh token
      prompt: 'consent' // Force consent to get refresh token
    })

    return `${baseUrl}?${params.toString()}`
  }

  private async exchangeCodeForTokens(code: string, provider: string) {
    // This would implement the actual token exchange for each provider
    // For now, return mock tokens
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
      account_id: 'mock_account_id',
      account_name: 'Mock Account',
      scope: 'ads_read business_management'
    }
  }

  private async refreshAccessToken(refreshToken: string, platform: string) {
    // This would implement the actual token refresh for each provider
    // For now, return mock tokens
    return {
      access_token: 'refreshed_access_token_' + Date.now(),
      refresh_token: refreshToken, // Usually stays the same
      expires_in: 3600
    }
  }

  private mapProviderToPlatform(provider: string): 'GOOGLE_ADS' | 'META_ADS' | 'LINKEDIN_ADS' | 'GOOGLE_ANALYTICS' {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'GOOGLE_ADS' // Default to Google Ads, could be enhanced to support both Ads and Analytics
      case 'facebook':
        return 'META_ADS'
      case 'linkedin':
        return 'LINKEDIN_ADS'
      default:
        throw new APIError('UNSUPPORTED_PROVIDER', `Provider ${provider} is not supported`, 400)
    }
  }

  async checkIntegrationHealth(integrationId: string) {
    const integration = await prisma.oAuthIntegration.findUnique({
      where: { id: integrationId }
    })

    if (!integration) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found', 404)
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt 
      ? new Date() > integration.tokenExpiresAt
      : false

    // Mock health check - in real implementation, this would make API calls to verify connectivity
    const isHealthy = integration.isActive && !isTokenExpired

    return {
      isHealthy,
      status: isHealthy ? 'HEALTHY' : (isTokenExpired ? 'TOKEN_EXPIRED' : 'INACTIVE'),
      lastChecked: new Date(),
      issues: isHealthy ? [] : [
        ...(isTokenExpired ? ['Token expired'] : []),
        ...(!integration.isActive ? ['Integration inactive'] : [])
      ]
    }
  }
}