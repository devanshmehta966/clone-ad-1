'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<{
    name?: string
    email?: string
    role?: string
    company?: string
    phone?: string
    website?: string
  } | null>(null)

  const orgId = searchParams?.get('orgId') || 'org_1'
  const orgNameMap: Record<string, string> = {
    org_1: 'Organization Name 1',
    org_2: 'Organization Name 2',
    org_3: 'Organization Name 3',
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          // Expecting controller to return { name, email, role, company, phone, website }
          setProfile(data)
        }
      } catch {
        // Ignore for now or add toast/log
      }
    }
    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, router])

  const displayUser = useMemo(() => {
    // Fallback to session basic data if profile not loaded
    return {
      name: profile?.name || session?.user?.name || '—',
      email: profile?.email || session?.user?.email || '—',
      role: (profile?.role as string) || (session?.user as any)?.role || '—',
      company: profile?.company || '—',
      phone: profile?.phone || '—',
      website: profile?.website || '—',
    }
  }, [profile, session])

  const initials = useMemo(() => {
    const name = displayUser.name || ''
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U'
    )
  }, [displayUser.name])

  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold leading-tight">
                  {displayUser.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {displayUser.email}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {displayUser.role}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {orgNameMap[orgId] || 'Current Organization'}
              </Badge>
              <Badge>Pro Plan</Badge>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push('/settings#account')}
              >
                Edit Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/settings#notifications')}
              >
                Manage Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Full Name</div>
                  <div className="font-medium">{displayUser.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium">{displayUser.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Company</div>
                  <div className="font-medium">{displayUser.company}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="font-medium">{displayUser.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Website</div>
                  <div className="font-medium">{displayUser.website}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Current Organization
                  </div>
                  <div className="font-medium">
                    {orgNameMap[orgId] || orgId}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">
                      Generated Monthly Performance Report
                    </div>
                    <div className="text-xs text-muted-foreground">
                      about 2 hours ago
                    </div>
                  </div>
                  <Badge variant="secondary">Reports</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">
                      Updated Notification Preferences
                    </div>
                    <div className="text-xs text-muted-foreground">
                      yesterday
                    </div>
                  </div>
                  <Badge variant="secondary">Alerts</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">
                      Connected Google Ads Integration
                    </div>
                    <div className="text-xs text-muted-foreground">
                      this week
                    </div>
                  </div>
                  <Badge variant="secondary">Integrations</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
