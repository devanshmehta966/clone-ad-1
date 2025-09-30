import { NextRequest } from 'next/server'
import { BaseController } from './base.controller'
import { OAuthService } from '../services/oauth.service'
import { IntegrationsService } from '../services/integrations.service'
import { OAuthStartSchema, OAuthCallbackSchema } from '../validation/integrations.schemas'

export class IntegrationsController extends BaseController {
  private oauthService = new OAuthService()
  private integrationsService = new IntegrationsService()

  async getIntegrations(userId: string) {
    return this.handleRequest(async () => {
      const integrations = await this.integrationsService.getUserIntegrations(userId)
      return integrations
    })
  }

  async startOAuth(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, OAuthStartSchema)
      const authUrl = await this.oauthService.initiateOAuth(data.provider, userId)
      return { authUrl }
    })
  }

  async handleOAuthCallback(request: NextRequest) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, OAuthCallbackSchema)
      const result = await this.oauthService.handleCallback(
        data.code,
        data.state,
        data.provider
      )
      return result
    })
  }

  async disconnectIntegration(integrationId: string, userId: string) {
    return this.handleRequest(async () => {
      await this.integrationsService.disconnectIntegration(integrationId, userId)
      return { message: 'Integration disconnected successfully' }
    })
  }

  async getIntegrationStatus(integrationId: string, userId: string) {
    return this.handleRequest(async () => {
      const status = await this.integrationsService.getIntegrationStatus(integrationId, userId)
      return status
    })
  }

  async syncIntegration(integrationId: string, userId: string) {
    return this.handleRequest(async () => {
      const result = await this.integrationsService.syncIntegration(integrationId, userId)
      return result
    })
  }

  async checkIntegrationHealth(integrationId: string, userId: string) {
    return this.handleRequest(async () => {
      // Verify the integration belongs to the user
      const integration = await this.integrationsService.getIntegrationStatus(integrationId, userId)
      if (!integration) {
        throw new Error('Integration not found')
      }
      
      const health = await this.oauthService.checkIntegrationHealth(integrationId)
      return health
    })
  }

  async checkAllIntegrationsHealth(userId: string) {
    return this.handleRequest(async () => {
      const integrations = await this.integrationsService.getUserIntegrations(userId)
      
      const healthChecks = await Promise.allSettled(
        integrations.map(async (integration) => {
          const health = await this.oauthService.checkIntegrationHealth(integration.id)
          return {
            integrationId: integration.id,
            platform: integration.platform,
            accountName: integration.accountName,
            ...health
          }
        })
      )

      const results = healthChecks.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            integrationId: integrations[index].id,
            platform: integrations[index].platform,
            accountName: integrations[index].accountName,
            isHealthy: false,
            status: 'ERROR',
            lastChecked: new Date(),
            issues: ['Health check failed']
          }
        }
      })

      const summary = {
        totalIntegrations: results.length,
        healthyIntegrations: results.filter(r => r.isHealthy).length,
        unhealthyIntegrations: results.filter(r => !r.isHealthy).length,
        lastChecked: new Date()
      }

      return {
        summary,
        integrations: results
      }
    })
  }
}