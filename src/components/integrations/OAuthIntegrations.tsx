'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  Globe,
  Zap,
  Link2,
  CheckCircle,
  AlertCircle,
  Settings,
  Loader2,
  RefreshCw,
} from 'lucide-react'

interface IntegrationConnection {
  id: string
  connected: boolean
  name: string
  description: string
  platform: string
  accountName?: string
  lastSync?: string
  status?: 'IDLE' | 'SYNCING' | 'ERROR' | 'PENDING_AUTH'
  lastError?: string
  isActive: boolean
}

interface IntegrationCardProps {
  integration?: IntegrationConnection
  onConnect: () => void
  onDisconnect: () => void
  onSync?: () => void
  navigateUrl?: string
  loading?: boolean
  syncLoading?: boolean
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
  navigateUrl,
  loading = false,
  syncLoading = false,
}: IntegrationCardProps) {
  const router = useRouter()

  // Provide default values if integration is undefined
  const safeIntegration = integration || {
    id: '',
    connected: false,
    name: 'Unknown Integration',
    description: 'Loading...',
    platform: '',
    isActive: false,
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'SYNCING':
        return 'bg-blue-500 text-white'
      case 'ERROR':
        return 'bg-red-500 text-white'
      case 'PENDING_AUTH':
        return 'bg-yellow-500 text-white'
      case 'IDLE':
      default:
        return safeIntegration.connected
          ? 'bg-green-500 text-white'
          : 'bg-gray-500 text-white'
    }
  }

  const getStatusText = () => {
    if (!safeIntegration.connected) return 'Not Connected'
    if (safeIntegration.status === 'SYNCING') return 'Syncing...'
    if (safeIntegration.status === 'ERROR') return 'Error'
    if (safeIntegration.status === 'PENDING_AUTH') return 'Needs Auth'
    return 'Connected'
  }

  return (
    <Card
      className={`transition-all duration-200 ${safeIntegration.connected ? 'border-green-200 bg-green-50/20' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                safeIntegration.connected
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Globe className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{safeIntegration.name}</CardTitle>
              <CardDescription>{safeIntegration.description}</CardDescription>
              {safeIntegration.accountName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Account: {safeIntegration.accountName}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(safeIntegration.status)}>
              {safeIntegration.connected ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {getStatusText()}
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Connected
                </>
              )}
            </Badge>
            {safeIntegration.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last sync: {new Date(safeIntegration.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {safeIntegration.lastError && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            Error: {safeIntegration.lastError}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {safeIntegration.connected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Disconnect
              </Button>
              {onSync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={syncLoading || safeIntegration.status === 'SYNCING'}
                >
                  {syncLoading || safeIntegration.status === 'SYNCING' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              {navigateUrl && (
                <Button
                  size="sm"
                  onClick={() => router.push(navigateUrl)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  View Details
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={onConnect}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function OAuthIntegrations() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<
    Record<string, IntegrationConnection>
  >({})
  const [connectionStates, setConnectionStates] = useState<
    Record<string, 'idle' | 'connecting' | 'disconnecting' | 'syncing'>
  >({})
  const [loading, setLoading] = useState(true)

  // Provider mapping from backend to frontend keys
  const providerMapping: Record<string, string> = {
    GOOGLE_ADS: 'googleAds',
    GOOGLE_ANALYTICS: 'googleAnalytics',
    META_ADS: 'metaAds',
  }

  // OAuth provider mapping for API calls
  const oauthProviderMapping: Record<string, string> = {
    googleAds: 'google',
    googleAnalytics: 'google',
    metaAds: 'facebook',
  }

  const integrations = {
    googleAds: {
      name: 'Google Ads',
      description: 'Manage ad campaigns and track performance',
      navigateUrl: '/google-ads',
    },
    googleAnalytics: {
      name: 'Google Analytics',
      description: 'Website traffic and conversion data',
      navigateUrl: '/google-analytics',
    },
    metaAds: {
      name: 'Meta Ads',
      description: 'Facebook and Instagram advertising',
      navigateUrl: '/meta-ads',
    },
  }

  // Fetch integration status on component mount
  useEffect(() => {
    fetchIntegrationStatus()

    // Check for OAuth callback results
    const oauthResult = searchParams.get('oauth_result')
    const provider = searchParams.get('provider')
    const message = searchParams.get('message')

    if (oauthResult === 'success' && provider) {
      toast({
        title: 'Integration Successful',
        description: `Successfully connected to ${provider}`,
      })
      // Refresh integration status
      fetchIntegrationStatus()

      // Clean up URL
      router.replace('/settings')
    } else if (oauthResult === 'error') {
      toast({
        title: 'Integration Failed',
        description: message || 'Failed to connect integration',
        variant: 'destructive',
      })

      // Clean up URL
      router.replace('/settings')
    }
  }, [searchParams, router])

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations')

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, show default state
          console.warn(
            'User not authenticated, showing default integration state'
          )
        } else {
          throw new Error(`Failed to fetch integrations: ${response.status}`)
        }
      }

      let data = null
      if (response.ok) {
        const result = await response.json()
        data = result.success ? result.data : result
      }

      // Convert backend data to frontend format
      const connectionData: Record<string, IntegrationConnection> = {}

      if (data && Array.isArray(data)) {
        data.forEach((integration: any) => {
          const frontendKey = providerMapping[integration.platform]
          if (
            frontendKey &&
            integrations[frontendKey as keyof typeof integrations]
          ) {
            connectionData[frontendKey] = {
              id: integration.id,
              connected: integration.isActive,
              name: integrations[frontendKey as keyof typeof integrations].name,
              description:
                integrations[frontendKey as keyof typeof integrations]
                  .description,
              platform: integration.platform,
              accountName: integration.accountName,
              lastSync: integration.lastSyncAt,
              status: integration.syncStatus,
              lastError: integration.lastError,
              isActive: integration.isActive,
            }
          }
        })
      }

      // Ensure all integrations are represented
      Object.keys(integrations).forEach((key) => {
        if (!connectionData[key]) {
          connectionData[key] = {
            id: '',
            connected: false,
            name: integrations[key as keyof typeof integrations].name,
            description:
              integrations[key as keyof typeof integrations].description,
            platform: '',
            isActive: false,
          }
        }
      })

      setConnections(connectionData)
    } catch (error) {
      console.error('Error fetching integrations:', error)

      // Set default state for all integrations
      const defaultConnections: Record<string, IntegrationConnection> = {}
      Object.keys(integrations).forEach((key) => {
        defaultConnections[key] = {
          id: '',
          connected: false,
          name: integrations[key as keyof typeof integrations].name,
          description:
            integrations[key as keyof typeof integrations].description,
          platform: '',
          isActive: false,
        }
      })
      setConnections(defaultConnections)

      toast({
        title: 'Error',
        description:
          'Failed to fetch integration status. Please try refreshing the page.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (frontendKey: string) => {
    // Map frontend key to OAuth provider
    const oauthProvider = oauthProviderMapping[frontendKey]

    if (!oauthProvider) {
      toast({
        title: 'Error',
        description: 'Invalid provider',
        variant: 'destructive',
      })
      return
    }

    try {
      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'connecting' }))

      const response = await fetch('/api/integrations/oauth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: oauthProvider,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to start OAuth flow')
      }

      const data = await response.json()

      if (data?.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error: any) {
      console.error('Connection error:', error)
      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'idle' }))

      toast({
        title: 'Connection Failed',
        description: `Failed to connect to ${integrations[frontendKey as keyof typeof integrations].name}: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async (frontendKey: string) => {
    const integration = connections[frontendKey]

    if (!integration?.id) {
      toast({
        title: 'Error',
        description: 'Integration not found',
        variant: 'destructive',
      })
      return
    }

    try {
      setConnectionStates((prev) => ({
        ...prev,
        [frontendKey]: 'disconnecting',
      }))

      const response = await fetch(
        `/api/integrations/${integration.id}/disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to disconnect integration')
      }

      // Update local state immediately
      setConnections((prev) => ({
        ...prev,
        [frontendKey]: {
          ...prev[frontendKey],
          connected: false,
          isActive: false,
          status: 'IDLE',
          lastError: undefined,
        },
      }))

      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'idle' }))
      toast({
        title: 'Integration Disconnected',
        description: `Successfully disconnected ${integrations[frontendKey as keyof typeof integrations].name}`,
      })
    } catch (error: any) {
      console.error('Disconnect error:', error)
      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'idle' }))
      toast({
        title: 'Disconnect Failed',
        description: `Failed to disconnect ${integrations[frontendKey as keyof typeof integrations].name}: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      })
    }
  }

  const handleSync = async (frontendKey: string) => {
    const integration = connections[frontendKey]

    if (!integration?.id) {
      toast({
        title: 'Error',
        description: 'Integration not found',
        variant: 'destructive',
      })
      return
    }

    try {
      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'syncing' }))

      // Update local state to show syncing
      setConnections((prev) => ({
        ...prev,
        [frontendKey]: {
          ...prev[frontendKey],
          status: 'SYNCING',
        },
      }))

      const response = await fetch(`/api/integrations/${integration.id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sync integration')
      }

      // Update local state with success
      setConnections((prev) => ({
        ...prev,
        [frontendKey]: {
          ...prev[frontendKey],
          status: 'IDLE',
          lastSync: new Date().toISOString(),
          lastError: undefined,
        },
      }))

      toast({
        title: 'Sync Successful',
        description: `Successfully synced ${integrations[frontendKey as keyof typeof integrations].name}`,
      })
    } catch (error: any) {
      console.error('Sync error:', error)

      // Update local state with error
      setConnections((prev) => ({
        ...prev,
        [frontendKey]: {
          ...prev[frontendKey],
          status: 'ERROR',
          lastError: error.message || 'Sync failed',
        },
      }))

      toast({
        title: 'Sync Failed',
        description: `Failed to sync ${integrations[frontendKey as keyof typeof integrations].name}: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      })
    } finally {
      setConnectionStates((prev) => ({ ...prev, [frontendKey]: 'idle' }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold">OAuth 2.0 Integrations</h2>
          <p className="text-muted-foreground">
            Connect your marketing platforms to automatically sync campaign data
            and performance metrics.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">OAuth 2.0 Integrations</h2>
        <p className="text-muted-foreground">
          Connect your marketing platforms to automatically sync campaign data
          and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Object.entries(integrations).map(([key, integration]) => {
          const connectionData = connections[key] || {
            id: '',
            connected: false,
            name: integration.name,
            description: integration.description,
            platform: '',
            isActive: false,
          }

          return (
            <IntegrationCard
              key={key}
              integration={connectionData}
              onConnect={() => handleConnect(key)}
              onDisconnect={() => handleDisconnect(key)}
              onSync={() => handleSync(key)}
              navigateUrl={integration.navigateUrl}
              loading={
                connectionStates[key] === 'connecting' ||
                connectionStates[key] === 'disconnecting'
              }
              syncLoading={connectionStates[key] === 'syncing'}
            />
          )
        })}
      </div>

      {/* Webhook Configuration */}
      {/* <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Webhook Alerts
                    </CardTitle>
                    <CardDescription>
                        Configure real-time notifications for important events and threshold breaches
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                            id="webhook-url"
                            placeholder="https://your-app.com/webhooks/marketing-alerts"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="slack-webhook">Slack Webhook (Optional)</Label>
                        <Input
                            id="slack-webhook"
                            placeholder="https://hooks.slack.com/services/..."
                            className="mt-1"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            Save Webhooks
                        </Button>
                        <Button variant="outline">
                            Test Connection
                        </Button>
                    </div>
                </CardContent>
            </Card> */}
    </div>
  )
}
