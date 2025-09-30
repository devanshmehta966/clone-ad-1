'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

// Lightweight fallbacks for fast first paint
const OAuthIntegrations = dynamic(
  () =>
    import('@/components/integrations/OAuthIntegrations').then(
      (m) => m.OAuthIntegrations
    ),
  { loading: () => <div>Loading integrations...</div> }
)
const ProfileForm = dynamic(
  () => import('@/components/settings/ProfileForm').then((m) => m.ProfileForm),
  {
    loading: () => (
      <div className="rounded-lg border p-6">Loading profile...</div>
    ),
  }
)
const NotificationPreferences = dynamic(
  () =>
    import('@/components/settings/NotificationPreferences').then(
      (m) => m.NotificationPreferences
    ),
  {
    loading: () => (
      <div className="rounded-lg border p-6">Loading alerts...</div>
    ),
  }
)
const SecurityCard = dynamic(
  () =>
    import('@/components/settings/SecurityCard').then((m) => m.SecurityCard),
  {
    loading: () => (
      <div className="rounded-lg border p-6">Loading security...</div>
    ),
  }
)
const BillingCard = dynamic(
  () => import('@/components/settings/BillingCard').then((m) => m.BillingCard),
  {
    loading: () => (
      <div className="rounded-lg border p-6">Loading billing...</div>
    ),
  }
)

// OAuth integrations are dynamically loaded above; no wrapper needed

interface UserProfile {
  id: string
  name: string | null
  email: string
  profile: {
    fullName: string | null
    businessName: string | null
    businessEmail: string | null
    businessPhone: string | null
    businessWebsite: string | null
    subscriptionPlan: string | null
    emailAlerts: boolean
    weeklyReports: boolean
    budgetAlerts: boolean
    performanceAlerts: boolean
  } | null
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      } else {
        // If API fails, create a mock profile from session data
        if (session?.user) {
          const mockProfile: UserProfile = {
            id: session.user.id || 'mock-id',
            name: session.user.name || 'Sarah Johnson',
            email: session.user.email || 'sarah@acmecorp.com',
            profile: {
              fullName: session.user.name || 'Sarah Johnson',
              businessName: 'Acme Corp',
              businessEmail: session.user.email || 'sarah@acmecorp.com',
              businessPhone: null,
              businessWebsite: null,
              subscriptionPlan: 'Pro',
              emailAlerts: true,
              weeklyReports: true,
              budgetAlerts: true,
              performanceAlerts: false,
            },
          }
          setUserProfile(mockProfile)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Fallback to mock data if everything fails
      const mockProfile: UserProfile = {
        id: 'mock-id',
        name: 'Sarah Johnson',
        email: 'sarah@acmecorp.com',
        profile: {
          fullName: 'Sarah Johnson',
          businessName: 'Acme Corp',
          businessEmail: 'sarah@acmecorp.com',
          businessPhone: null,
          businessWebsite: null,
          subscriptionPlan: 'Pro',
          emailAlerts: true,
          weeklyReports: true,
          budgetAlerts: true,
          performanceAlerts: false,
        },
      }
      setUserProfile(mockProfile)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user || status === 'unauthenticated') {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Always show the settings interface, even without authentication for demo purposes
  const displayProfile = userProfile || {
    id: 'demo-id',
    name: 'Sarah Johnson',
    email: 'sarah@acmecorp.com',
    profile: {
      fullName: 'Sarah Johnson',
      businessName: 'Acme Corp',
      businessEmail: 'sarah@acmecorp.com',
      businessPhone: null,
      businessWebsite: null,
      subscriptionPlan: 'Pro',
      emailAlerts: true,
      weeklyReports: true,
      budgetAlerts: true,
      performanceAlerts: false,
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and integrations
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4 bg-gray-100">
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Alerts
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Account Settings */}
            <div className="space-y-6 lg:col-span-2">
              <ProfileForm user={displayProfile} onUpdate={fetchProfile} />
            </div>

            {/* Sidebar for Account Tab */}
            <div className="space-y-6">
              <SecurityCard user={displayProfile} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <OAuthIntegrations />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferences
            preferences={{
              emailAlerts: displayProfile.profile?.emailAlerts ?? true,
              weeklyReports: displayProfile.profile?.weeklyReports ?? true,
              budgetAlerts: displayProfile.profile?.budgetAlerts ?? true,
              performanceAlerts:
                displayProfile.profile?.performanceAlerts ?? false,
            }}
            onUpdate={fetchProfile}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingCard user={displayProfile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
