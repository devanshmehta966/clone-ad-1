import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { OAuthService } from './oauth.service'
import { decrypt } from '../utils/crypto'

export class IntegrationsService {
  private oauthService = new OAuthService()

  async getUserIntegrations(userId: string) {
    const integrations = await prisma.oAuthIntegration.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        syncStatus: true,
        lastSyncAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return integrations
  }

  async getIntegrationStatus(integrationId: string, userId: string) {
    const integration = await prisma.oAuthIntegration.findFirst({
      where: {
        id: integrationId,
        userId
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        isActive: true,
        syncStatus: true,
        lastSyncAt: true,
        lastError: true,
        tokenExpiresAt: true
      }
    })

    if (!integration) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found', 404)
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt 
      ? new Date() > integration.tokenExpiresAt
      : false

    return {
      ...integration,
      isTokenExpired,
      needsReauth: isTokenExpired && !integration.isActive
    }
  }

  async disconnectIntegration(integrationId: string, userId: string) {
    const integration = await prisma.oAuthIntegration.findFirst({
      where: {
        id: integrationId,
        userId
      }
    })

    if (!integration) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found', 404)
    }

    // Try to revoke tokens before disconnecting
    if (integration.accessToken) {
      try {
        await this.revokeTokens(integration)
      } catch (error) {
        console.error(`Failed to revoke tokens for integration ${integrationId}:`, error)
        // Continue with disconnection even if revocation fails
      }
    }

    // Update integration to inactive and clear tokens
    await prisma.oAuthIntegration.update({
      where: { id: integrationId },
      data: {
        isActive: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        syncStatus: 'IDLE',
        lastError: null
      }
    })
  }

  private async revokeTokens(integration: any) {
    if (!integration.accessToken) return

    try {
      const decryptedToken = decrypt(integration.accessToken)
      
      switch (integration.platform) {
        case 'GOOGLE_ADS':
        case 'GOOGLE_ANALYTICS':
          await this.revokeGoogleToken(decryptedToken)
          break
        case 'META_ADS':
          await this.revokeFacebookToken(decryptedToken)
          break
        case 'LINKEDIN_ADS':
          await this.revokeLinkedInToken(decryptedToken)
          break
      }
    } catch (error) {
      console.error(`Token revocation failed for ${integration.platform}:`, error)
      throw error
    }
  }

  private async revokeGoogleToken(accessToken: string) {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error(`Google token revocation failed: ${response.status}`)
    }
  }

  private async revokeFacebookToken(accessToken: string) {
    const response = await fetch(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Facebook token revocation failed: ${response.status}`)
    }
  }

  private async revokeLinkedInToken(accessToken: string) {
    // LinkedIn doesn't have a standard revocation endpoint
    // The token will expire naturally or can be revoked from LinkedIn's developer console
    console.log('LinkedIn token marked for disconnection (no revocation endpoint available)')
  }

  async syncIntegration(integrationId: string, userId: string) {
    const integration = await prisma.oAuthIntegration.findFirst({
      where: {
        id: integrationId,
        userId
      }
    })

    if (!integration) {
      throw new APIError('INTEGRATION_NOT_FOUND', 'Integration not found', 404)
    }

    if (!integration.isActive) {
      throw new APIError('INTEGRATION_INACTIVE', 'Integration is not active', 400)
    }

    // Check if token needs refresh
    const needsRefresh = integration.tokenExpiresAt 
      ? new Date() > new Date(integration.tokenExpiresAt.getTime() - 300000) // 5 minutes before expiry
      : false

    if (needsRefresh && integration.refreshToken) {
      try {
        await this.oauthService.refreshTokens(integrationId)
      } catch (error) {
        // If refresh fails with invalid token, mark as needing re-auth
        if (error instanceof APIError && error.code === 'REFRESH_TOKEN_INVALID') {
          await prisma.oAuthIntegration.update({
            where: { id: integrationId },
            data: {
              isActive: false,
              syncStatus: 'PENDING_AUTH',
              lastError: 'Refresh token invalid, re-authentication required'
            }
          })
          throw new APIError(
            'REAUTH_REQUIRED',
            'Integration requires re-authentication',
            401
          )
        }
        throw error
      }
    }

    // Update sync status
    await prisma.oAuthIntegration.update({
      where: { id: integrationId },
      data: {
        syncStatus: 'SYNCING',
        lastError: null
      }
    })

    try {
      // Perform actual sync based on platform
      await this.performPlatformSync(integration)

      // Update successful sync
      await prisma.oAuthIntegration.update({
        where: { id: integrationId },
        data: {
          syncStatus: 'IDLE',
          lastSyncAt: new Date()
        }
      })

      return { success: true, message: 'Sync completed successfully' }
    } catch (error) {
      // Update failed sync
      await prisma.oAuthIntegration.update({
        where: { id: integrationId },
        data: {
          syncStatus: 'ERROR',
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw new APIError('SYNC_FAILED', 'Failed to sync integration', 500, error)
    }
  }

  private async performPlatformSync(integration: any) {
    // This would implement actual platform-specific sync logic
    // For now, simulate sync with a delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock creating some analytics data
    const mockData = {
      userId: integration.userId,
      platform: integration.platform,
      date: new Date(),
      impressions: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 1000),
      spend: Math.random() * 500,
      conversions: Math.floor(Math.random() * 50)
    }

    // Create or update analytics data
    const existingData = await prisma.analyticsData.findFirst({
      where: {
        userId: mockData.userId,
        platform: mockData.platform,
        date: mockData.date,
        campaignId: null
      }
    })

    if (existingData) {
      await prisma.analyticsData.update({
        where: { id: existingData.id },
        data: mockData
      })
    } else {
      await prisma.analyticsData.create({
        data: mockData
      })
    }
  }
}