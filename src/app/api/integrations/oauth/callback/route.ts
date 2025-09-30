import { NextRequest } from 'next/server'
import { IntegrationsController } from '../../../../../../lib/controllers/integrations.controller'
import { integrationRateLimit } from '../../../../../../lib/utils/rate-limit'

export const runtime = 'nodejs'

const integrationsController = new IntegrationsController()

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await integrationRateLimit.checkRateLimit(request)

    return await integrationsController.handleOAuthCallback(request)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return integrationsController.error(
      'OAUTH_CALLBACK_FAILED',
      'Failed to handle OAuth callback',
      500
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Handle OAuth callback via GET (some providers use GET)
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const settingsUrl = new URL('/settings', baseUrl)

    if (error) {
      console.error(`OAuth error from provider: ${error} - ${errorDescription}`)
      settingsUrl.searchParams.set('oauth_result', 'error')
      settingsUrl.searchParams.set('message', errorDescription || error)
      return Response.redirect(settingsUrl.toString())
    }

    if (!code || !state) {
      settingsUrl.searchParams.set('oauth_result', 'error')
      settingsUrl.searchParams.set('message', 'Missing required OAuth parameters')
      return Response.redirect(settingsUrl.toString())
    }

    // Extract provider from state
    let provider = 'google' // Default fallback
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
      provider = stateData.provider || 'google'
    } catch (error) {
      console.warn('Could not decode state parameter, using default provider')
    }

    try {
      // Create a mock request with the callback data
      const mockRequest = new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state, provider })
      })

      const result = await integrationsController.handleOAuthCallback(mockRequest as NextRequest)
      
      if (result.ok) {
        const data = await result.json()
        settingsUrl.searchParams.set('oauth_result', 'success')
        settingsUrl.searchParams.set('provider', data.platform || provider)
        settingsUrl.searchParams.set('account', data.accountName || 'Unknown Account')
      } else {
        const errorData = await result.json()
        settingsUrl.searchParams.set('oauth_result', 'error')
        settingsUrl.searchParams.set('message', errorData.message || 'OAuth callback failed')
      }
    } catch (callbackError) {
      console.error('OAuth callback processing error:', callbackError)
      settingsUrl.searchParams.set('oauth_result', 'error')
      settingsUrl.searchParams.set('message', 'Failed to process OAuth callback')
    }

    return Response.redirect(settingsUrl.toString())
  } catch (error) {
    console.error('OAuth GET callback error:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const settingsUrl = new URL('/settings', baseUrl)
    settingsUrl.searchParams.set('oauth_result', 'error')
    settingsUrl.searchParams.set('message', 'Internal server error')
    return Response.redirect(settingsUrl.toString())
  }
}