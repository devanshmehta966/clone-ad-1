import { randomBytes } from 'crypto'
import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { encrypt, decrypt } from '../utils/crypto'
import { OAuthLogger } from '../utils/oauth-logger'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  account_id?: string
  account_name?: string
}

interface ProviderConfig {
  authUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  scopes: string
  additionalParams?: Record<string, string>
}

export class OAuthService {
  private readonly redirectUri = process.env.NEXTAUTH_URL + '/api/integrations/oauth/callback'

  async initiateOAuth(provider: string, userId: string) {
    OAuthLogger.logOAuthFlow('initiate', provider, userId)
    
    try {
      // Generate secure state parameter
      const state = randomBytes(32).toString('hex')
      
      // Store state temporarily with user context
      await prisma.oAuthIntegration.upsert({
        where: {
          userId_platform: {
            userId,
            platform: provider.toUpperCase() as any
          }
        },
        create: {
          userId,
          platform: provider.toUpperCase() as any,
          metadata: { 
            state, 
            expiresAt: Date.now() + 600000, // 10 minutes
            userId // Store userId in metadata for callback verification
          }
        },
        update: {
          metadata: { 
            state, 
            expiresAt: Date.now() + 600000,
            userId
          }
        }
      })

      // Build OAuth URL based on provider
      const authUrl = this.buildAuthUrl(provider, state)
      
      OAuthLogger.logOAuthSuccess('initiate', provider, userId, undefined, { 
        authUrlLength: authUrl.length 
      })
      
      return authUrl
    } catch (error) {
      OAuthLogger.logOAuthError('initiate', provider, error, userId)
      throw new APIError(
        'OAUTH_INIT_FAILED',
        `Failed to initiate OAuth flow for ${provider}`,
        500,
        error
      )
    }
  }

  async handleCallback(code: string, state: string, provider: string) {
    OAuthLogger.logOAuthFlow('callback', provider)
    
    try {
      // Find the integration with matching state
      const integration = await prisma.oAuthIntegration.findFirst({
        where: {
          platform: provider.toUpperCase() as any,
          metadata: {
            path: ['state'],
            equals: state
          }
        }
      })

      if (!integration) {
        OAuthLogger.logSecurityEvent('invalid_state', { provider, state })
        throw new APIError('INVALID_STATE', 'Invalid OAuth state parameter', 400)
      }

      // Check if state has expired
      const metadata = integration.metadata as any
      if (Date.now() > metadata.expiresAt) {
        OAuthLogger.logSecurityEvent('invalid_state', { 
          provider, 
          state, 
          reason: 'expired',
          expiresAt: metadata.expiresAt 
        })
        throw new APIError('EXPIRED_STATE', 'OAuth state has expired', 400)
      }

      // Exchange code for tokens
      OAuthLogger.debug('Exchanging authorization code for tokens', { provider })
      const tokens = await this.exchangeCodeForTokens(code, provider)

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
          lastError: null, // Clear any previous errors
          metadata: {} // Clear temporary state
        }
      })

      OAuthLogger.logTokenEvent('issued', provider, updatedIntegration.id, {
        accountName: tokens.account_name,
        scopes: tokens.scope
      })

      OAuthLogger.logOAuthSuccess('callback', provider, integration.userId, updatedIntegration.id, {
        accountName: tokens.account_name
      })
      
      return {
        integrationId: updatedIntegration.id,
        platform: updatedIntegration.platform,
        accountName: updatedIntegration.accountName,
        isActive: updatedIntegration.isActive
      }
    } catch (error) {
      OAuthLogger.logOAuthError('callback', provider, error)
      
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError(
        'OAUTH_CALLBACK_FAILED',
        `Failed to complete OAuth flow for ${provider}`,
        500,
        error
      )
    }
  }

  async refreshTokens(integrationId: string) {
    const integration = await prisma.oAuthIntegration.findUnique({
      where: { id: integrationId }
    })

    if (!integration) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found', 404)
    }

    OAuthLogger.logOAuthFlow('refresh', integration.platform, integration.userId, integrationId)
    
    try {
      if (!integration.refreshToken) {
        throw new APIError('NO_REFRESH_TOKEN', 'No refresh token available', 404)
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
            : null,
          lastError: null // Clear any previous errors
        }
      })

      OAuthLogger.logTokenEvent('refreshed', integration.platform, integrationId)
      OAuthLogger.logOAuthSuccess('refresh', integration.platform, integration.userId, integrationId)
      
      return { success: true }
    } catch (error) {
      // Update integration with error status
      await prisma.oAuthIntegration.update({
        where: { id: integrationId },
        data: {
          syncStatus: 'ERROR',
          lastError: error instanceof Error ? error.message : 'Token refresh failed'
        }
      }).catch(updateError => {
        OAuthLogger.error('Failed to update integration error status', updateError, { integrationId })
      })

      OAuthLogger.logTokenEvent('invalid', integration.platform, integrationId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      OAuthLogger.logOAuthError('refresh', integration.platform, error, integration.userId, integrationId)
      
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError(
        'TOKEN_REFRESH_FAILED',
        'Failed to refresh access token',
        500,
        error
      )
    }
  }

  private getProviderConfig(provider: string): ProviderConfig {
    const configs: Record<string, ProviderConfig> = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly',
        additionalParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
      facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        scopes: 'ads_read,business_management'
      },
      linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        scopes: 'r_ads,r_ads_reporting'
      }
    }

    const config = configs[provider]
    if (!config) {
      throw new APIError('UNSUPPORTED_PROVIDER', `Provider ${provider} is not supported`, 400)
    }

    if (!config.clientId || !config.clientSecret) {
      throw new APIError('PROVIDER_NOT_CONFIGURED', `Provider ${provider} is not properly configured`, 500)
    }

    return config
  }

  private buildAuthUrl(provider: string, state: string): string {
    const config = this.getProviderConfig(provider)

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: this.redirectUri,
      scope: config.scopes,
      response_type: 'code',
      state,
      ...config.additionalParams
    })

    return `${config.authUrl}?${params.toString()}`
  }

  private async exchangeCodeForTokens(code: string, provider: string): Promise<TokenResponse> {
    const config = this.getProviderConfig(provider)

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: this.redirectUri,
      code
    })

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: tokenParams.toString()
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Token exchange failed for ${provider}:`, response.status, errorText)
        throw new APIError(
          'TOKEN_EXCHANGE_FAILED',
          `Failed to exchange authorization code: ${response.status}`,
          400,
          { provider, status: response.status, error: errorText }
        )
      }

      const tokens = await response.json()
      
      // Get account information based on provider
      const accountInfo = await this.getAccountInfo(tokens.access_token, provider)
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        account_id: accountInfo.account_id,
        account_name: accountInfo.account_name
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      console.error(`Token exchange error for ${provider}:`, error)
      throw new APIError(
        'TOKEN_EXCHANGE_FAILED',
        `Failed to exchange authorization code for ${provider}`,
        500,
        error
      )
    }
  }

  private async refreshAccessToken(refreshToken: string, platform: string): Promise<TokenResponse> {
    const config = this.getProviderConfig(platform.toLowerCase())

    const refreshParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken
    })

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: refreshParams.toString()
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Token refresh failed for ${platform}:`, response.status, errorText)
        
        // If refresh token is invalid, mark integration as needing re-auth
        if (response.status === 400 || response.status === 401) {
          throw new APIError(
            'REFRESH_TOKEN_INVALID',
            'Refresh token is invalid, re-authentication required',
            401,
            { platform, status: response.status }
          )
        }
        
        throw new APIError(
          'TOKEN_REFRESH_FAILED',
          `Failed to refresh token: ${response.status}`,
          500,
          { platform, status: response.status, error: errorText }
        )
      }

      const tokens = await response.json()
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refreshToken, // Some providers don't return new refresh token
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      console.error(`Token refresh error for ${platform}:`, error)
      throw new APIError(
        'TOKEN_REFRESH_FAILED',
        `Failed to refresh token for ${platform}`,
        500,
        error
      )
    }
  }

  private async getAccountInfo(accessToken: string, provider: string): Promise<{ account_id: string; account_name: string }> {
    try {
      switch (provider) {
        case 'google':
          return await this.getGoogleAccountInfo(accessToken)
        case 'facebook':
          return await this.getFacebookAccountInfo(accessToken)
        case 'linkedin':
          return await this.getLinkedInAccountInfo(accessToken)
        default:
          return {
            account_id: 'unknown',
            account_name: `${provider} Account`
          }
      }
    } catch (error) {
      console.error(`Failed to get account info for ${provider}:`, error)
      return {
        account_id: 'unknown',
        account_name: `${provider} Account`
      }
    }
  }

  private async getGoogleAccountInfo(accessToken: string): Promise<{ account_id: string; account_name: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get Google account info: ${response.status}`)
    }

    const userInfo = await response.json()
    return {
      account_id: userInfo.id,
      account_name: userInfo.name || userInfo.email
    }
  }

  private async getFacebookAccountInfo(accessToken: string): Promise<{ account_id: string; account_name: string }> {
    const response = await fetch('https://graph.facebook.com/me?fields=id,name', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get Facebook account info: ${response.status}`)
    }

    const userInfo = await response.json()
    return {
      account_id: userInfo.id,
      account_name: userInfo.name
    }
  }

  private async getLinkedInAccountInfo(accessToken: string): Promise<{ account_id: string; account_name: string }> {
    const response = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get LinkedIn account info: ${response.status}`)
    }

    const userInfo = await response.json()
    const firstName = userInfo.firstName?.localized?.en_US || ''
    const lastName = userInfo.lastName?.localized?.en_US || ''
    
    return {
      account_id: userInfo.id,
      account_name: `${firstName} ${lastName}`.trim() || 'LinkedIn User'
    }
  }

  async checkIntegrationHealth(integrationId: string): Promise<{
    isHealthy: boolean
    status: string
    lastChecked: Date
    issues?: string[]
  }> {
    try {
      const integration = await prisma.oAuthIntegration.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        OAuthLogger.warn('Health check: Integration not found', { integrationId })
        return {
          isHealthy: false,
          status: 'NOT_FOUND',
          lastChecked: new Date(),
          issues: ['Integration not found']
        }
      }

      OAuthLogger.logOAuthFlow('health_check', integration.platform, integration.userId, integrationId)

      const issues: string[] = []
      let isHealthy = true

      // Check if integration is active
      if (!integration.isActive) {
        issues.push('Integration is not active')
        isHealthy = false
      }

      // Check if tokens exist
      if (!integration.accessToken) {
        issues.push('No access token available')
        isHealthy = false
      }

      // Check if token is expired
      if (integration.tokenExpiresAt && new Date() > integration.tokenExpiresAt) {
        if (!integration.refreshToken) {
          issues.push('Access token expired and no refresh token available')
          isHealthy = false
          OAuthLogger.logTokenEvent('expired', integration.platform, integrationId, {
            hasRefreshToken: false
          })
        } else {
          issues.push('Access token expired but refresh token available')
          OAuthLogger.logTokenEvent('expired', integration.platform, integrationId, {
            hasRefreshToken: true
          })
        }
      }

      // Check sync status
      if (integration.syncStatus === 'ERROR') {
        issues.push(`Sync error: ${integration.lastError || 'Unknown error'}`)
        isHealthy = false
      }

      // Check last sync time
      if (integration.lastSyncAt) {
        const daysSinceLastSync = (Date.now() - integration.lastSyncAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceLastSync > 7) {
          issues.push(`No sync in ${Math.floor(daysSinceLastSync)} days`)
        }
      }

      const result = {
        isHealthy,
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        lastChecked: new Date(),
        issues: issues.length > 0 ? issues : undefined
      }

      OAuthLogger.logOAuthSuccess('health_check', integration.platform, integration.userId, integrationId, {
        isHealthy,
        issueCount: issues.length
      })

      return result
    } catch (error) {
      OAuthLogger.logOAuthError('health_check', 'unknown', error, undefined, integrationId)
      return {
        isHealthy: false,
        status: 'ERROR',
        lastChecked: new Date(),
        issues: ['Health check failed']
      }
    }
  }
}