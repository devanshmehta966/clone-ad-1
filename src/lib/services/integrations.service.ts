import { prisma } from '../prisma'
import { APIError } from '../types/api'
import { OAuthService } from './oauth.service'

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
      await this.oauthService.refreshTokens(integrationId)
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