'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'

// Types for our dashboard data
export interface DashboardMetrics {
  website: {
    visits: number
    conversionRate: number
    topPages: Array<{ page: string; views: number; conversions: number }>
    changeVsPrevMonth: number
  }
  ads: {
    spend: number
    cpc: number
    cpa: number
    conversions: number
    changeVsPrevMonth: number
  }
  social: {
    followers: number
    engagement: number
    reach: number
    changeVsPrevMonth: number
  }
}

export interface Client {
  id: string
  name: string
  industry: string
  status: 'active' | 'trial' | 'inactive'
  lastLogin: string
  monthlySpend: string
  campaigns: number
  roas: string
}

export interface Alert {
  id: string
  type: 'warning' | 'critical' | 'insight'
  title: string
  message: string
  action?: string
  timestamp: Date
}

interface DashboardContextType {
  // Current user/tenant
  currentUser: {
    id: string
    name: string
    email: string
    company: string
    role: 'admin' | 'client'
  } | null

  // Dashboard data
  metrics: DashboardMetrics
  clients: Client[]
  alerts: Alert[]

  // State management
  selectedDateRange: {
    start: Date
    end: Date
  }

  // Actions
  setUser: (user: any) => void
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  dismissAlert: (alertId: string) => void
  setDateRange: (range: { start: Date; end: Date }) => void

  // API integration states
  integrations: {
    googleAds: { connected: boolean; lastSync: Date | null }
    facebookAds: { connected: boolean; lastSync: Date | null }
    googleAnalytics: { connected: boolean; lastSync: Date | null }
    // linkedinAds: { connected: boolean; lastSync: Date | null }
  }

  // Loading states
  isLoading: {
    metrics: boolean
    clients: boolean
    integrations: boolean
  }
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
)

// Normalize API metrics to the UI's DashboardMetrics shape
const normalizeDashboardMetrics = (data: any): DashboardMetrics => {
  return {
    website: {
      visits: Number(data?.website?.visits ?? data?.totalVisits ?? 0) || 0,
      conversionRate:
        Number(data?.website?.conversionRate ?? data?.conversionRate ?? 0) || 0,
      topPages: Array.isArray(data?.website?.topPages)
        ? data.website.topPages
        : mockMetrics.website.topPages,
      changeVsPrevMonth: Number(data?.website?.changeVsPrevMonth ?? 0) || 0,
    },
    ads: {
      spend: Number(data?.ads?.spend ?? data?.totalSpend) || 0,
      cpc: Number(data?.ads?.cpc ?? data?.averageCPC ?? 0) || 0,
      cpa:
        Number(
          data?.ads?.cpa ??
            (data?.totalConversions
              ? Number(data?.totalSpend || 0) /
                Number(data?.totalConversions || 1)
              : 0)
        ) || 0,
      conversions:
        Number(data?.ads?.conversions ?? data?.totalConversions ?? 0) || 0,
      changeVsPrevMonth: Number(data?.ads?.changeVsPrevMonth ?? 0) || 0,
    },
    social: {
      followers: Number(data?.social?.followers ?? 0) || 0,
      engagement: Number(data?.social?.engagement ?? 0) || 0,
      reach: Number(data?.social?.reach ?? 0) || 0,
      changeVsPrevMonth: Number(data?.social?.changeVsPrevMonth ?? 0) || 0,
    },
  }
}

// Mock data for demonstration
const mockMetrics: DashboardMetrics = {
  website: {
    visits: 24563,
    conversionRate: 3.2,
    topPages: [
      { page: '/landing/summer-sale', views: 12543, conversions: 103 },
      { page: '/products/wireless-headphones', views: 9876, conversions: 66 },
      { page: '/blog/marketing-tips', views: 7654, conversions: 31 },
    ],
    changeVsPrevMonth: 12.5,
  },
  ads: {
    spend: 8420,
    cpc: 2.45,
    cpa: 42.3,
    conversions: 847,
    changeVsPrevMonth: 8.3,
  },
  social: {
    followers: 18200,
    engagement: 8.4,
    reach: 145000,
    changeVsPrevMonth: 15.7,
  },
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    status: 'active',
    lastLogin: '2 hours ago',
    monthlySpend: '$12,450',
    campaigns: 8,
    roas: '4.2x',
  },
  {
    id: '2',
    name: 'Green Earth Solutions',
    industry: 'Sustainability',
    status: 'active',
    lastLogin: '1 day ago',
    monthlySpend: '$8,900',
    campaigns: 5,
    roas: '3.8x',
  },
]

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  const [currentUser, setCurrentUser] =
    useState<DashboardContextType['currentUser']>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'High CPA Detected',
      message:
        'Your Google Ads CPA is 40% above target ($45 vs $32 target). Consider pausing underperforming campaigns.',
      action: 'Review Campaigns',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'insight',
      title: 'AI Recommendation',
      message:
        'Instagram engagement dropped 25% this week. Test video content format for better performance.',
      action: 'View Insights',
      timestamp: new Date(),
    },
  ])

  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  })

  const [integrations, setIntegrations] = useState({
    googleAds: { connected: true, lastSync: new Date() },
    facebookAds: { connected: true, lastSync: new Date() },
    googleAnalytics: { connected: true, lastSync: new Date() },
    // linkedinAds: { connected: false, lastSync: null as Date | null },
  })

  const [isLoading, setIsLoading] = useState({
    metrics: false,
    clients: false,
    integrations: false,
  })

  // Set current user from session
  useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        id: session.user.id!,
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        company: 'Company Name', // Would come from user profile
        role: 'client', // Would come from user data
      })
    }
  }, [session])

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    if (!session?.user?.id) return

    setIsLoading((prev) => ({ ...prev, metrics: true }))
    try {
      const params = new URLSearchParams({
        startDate: selectedDateRange.start.toISOString(),
        endDate: selectedDateRange.end.toISOString(),
      })

      const response = await fetch(`/api/dashboard/metrics?${params}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setMetrics(normalizeDashboardMetrics(result.data))
        } else {
          console.error(
            'API returned error:',
            result.error?.message || result.error || 'Unknown error'
          )
        }
      } else {
        console.error('Failed to fetch metrics:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading((prev) => ({ ...prev, metrics: false }))
    }
  }

  // Fetch alerts
  const fetchAlerts = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/dashboard/alerts')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Convert timestamp strings to Date objects
          const alertsWithDates = result.data.map((alert: any) => ({
            ...alert,
            timestamp: new Date(alert.timestamp),
          }))
          setAlerts(alertsWithDates)
        } else {
          console.error('API returned error:', result.error)
        }
      } else {
        console.error('Failed to fetch alerts:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  // Fetch integrations status
  const fetchIntegrations = async () => {
    if (!session?.user?.id) return

    setIsLoading((prev) => ({ ...prev, integrations: true }))
    try {
      const response = await fetch('/api/dashboard/integrations')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Convert lastSync strings to Date objects
          const integrationsWithDates = Object.entries(result.data).reduce(
            (acc, [key, value]: [string, any]) => {
              ;(acc as any)[key] = {
                connected: value.connected,
                lastSync: value.lastSync ? new Date(value.lastSync) : null,
              }
              return acc
            },
            {} as typeof integrations
          )
          setIntegrations(integrationsWithDates)
        } else {
          console.error('API returned error:', result.error)
        }
      } else {
        console.error('Failed to fetch integrations:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setIsLoading((prev) => ({ ...prev, integrations: false }))
    }
  }

  // Fetch clients
  const fetchClients = async () => {
    if (!session?.user?.id) return

    setIsLoading((prev) => ({ ...prev, clients: true }))
    try {
      const response = await fetch('/api/dashboard/clients')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setClients(result.data)
        } else {
          console.error('API returned error:', result.error)
        }
      } else {
        console.error('Failed to fetch clients:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading((prev) => ({ ...prev, clients: false }))
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchMetrics()
      fetchAlerts()
      fetchIntegrations()
      fetchClients()
    }
  }, [session?.user?.id])

  // Refetch metrics when date range changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchMetrics()
    }
  }, [selectedDateRange, session?.user?.id])

  // Actions
  const setUser = (user: any) => setCurrentUser(user)

  const updateMetrics = (newMetrics: Partial<DashboardMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }))
  }

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setAlerts((prev) => [newAlert, ...prev])
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const setDateRange = (range: { start: Date; end: Date }) => {
    setSelectedDateRange(range)
  }

  const value: DashboardContextType = {
    currentUser,
    metrics,
    clients,
    alerts,
    selectedDateRange,
    integrations,
    isLoading,
    setUser,
    updateMetrics,
    addAlert,
    dismissAlert,
    setDateRange,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
