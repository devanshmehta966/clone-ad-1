'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { useDashboard } from './DashboardProvider'

export function IntegrationStatus() {
  const { integrations } = useDashboard()
  const router = useRouter()

  const getNavigationPath = (platform: string) => {
    switch (platform) {
      case 'googleAds':
        return '/google-ads'
      case 'facebookAds':
        return '/meta-ads'
      case 'googleAnalytics':
        return '/google-analytics'
      default:
        return '#'
    }
  }

  const getPlatformDisplayName = (platform: string) => {
    switch (platform) {
      case 'googleAds':
        return 'Google Ads'
      case 'facebookAds':
        return 'Facebook Ads'
      case 'googleAnalytics':
        return 'Google Analytics'
      default:
        return platform.replace(/([A-Z])/g, ' $1').trim()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Integrations</CardTitle>
        <CardDescription>
          Monitor your connected marketing platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(integrations).map(([platform, status]) => (
            <div
              key={platform}
              className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
              onClick={() => router.push(getNavigationPath(platform))}
            >
              <div>
                <span className="font-medium">
                  {getPlatformDisplayName(platform)}
                </span>
                {status.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {format(status.lastSync, 'MMM dd, HH:mm')}
                  </p>
                )}
              </div>
              <Badge
                variant={status.connected ? 'default' : 'secondary'}
                className={
                  status.connected ? 'bg-success text-success-foreground' : ''
                }
              >
                {status.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
