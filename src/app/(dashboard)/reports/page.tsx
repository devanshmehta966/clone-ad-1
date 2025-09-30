'use client'
import { useState, useEffect, Suspense, lazy } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Calendar,
  Mail,
  Smartphone,
  MessageSquare,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Lazy load heavy components
const CreateReportDialog = lazy(() =>
  import('@/components/reports/CreateReportDialog').then((module) => ({
    default: module.CreateReportDialog,
  }))
)
const ReportCard = lazy(() =>
  import('@/components/reports/ReportCard').then((module) => ({
    default: module.ReportCard,
  }))
)

interface Report {
  id: string
  title: string
  reportType: 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  startDate: string
  endDate: string
  data: any
  emailSentAt: string | null
  createdAt: string
}

interface ReportsResponse {
  reports: Report[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Persist optimistic reports locally so they survive refreshes
  const loadPendingReports = (): Report[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('pendingReports')
      return raw ? (JSON.parse(raw) as Report[]) : []
    } catch {
      return []
    }
  }
  const savePendingReports = (items: Report[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('pendingReports', JSON.stringify(items))
    } catch {
      // ignore
    }
  }
  const addPendingReport = (report: Report) => {
    const current = loadPendingReports()
    savePendingReports([report, ...current])
  }
  const removePendingById = (id: string) => {
    const current = loadPendingReports()
    savePendingReports(current.filter((r) => r.id !== id))
  }

  const alerts = [
    {
      type: 'email',
      name: 'Weekly Email Digest',
      recipients: 'team@company.com',
      status: 'active',
    },
    {
      type: 'slack',
      name: 'Performance Alerts',
      recipients: '#marketing',
      status: 'active',
    },
    {
      type: 'whatsapp',
      name: 'Critical Alerts',
      recipients: '+1 (555) 123-4567',
      status: 'inactive',
    },
  ]

  // Alert configuration local persistence (demo-only)
  type AlertType = 'email' | 'slack' | 'whatsapp'
  const [alertToEdit, setAlertToEdit] = useState<{
    type: AlertType
    name: string
    recipients: string
    status: 'active' | 'inactive'
  } | null>(null)
  const [alertForm, setAlertForm] = useState<{
    recipients: string
    status: 'active' | 'inactive'
  }>({ recipients: '', status: 'active' })
  const loadAlertConfigs = (): Record<
    string,
    { recipients: string; status: 'active' | 'inactive' }
  > => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem('alertConfigs')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }
  const saveAlertConfigs = (
    configs: Record<
      string,
      { recipients: string; status: 'active' | 'inactive' }
    >
  ) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('alertConfigs', JSON.stringify(configs))
    } catch {}
  }
  const configuredAlerts = (() => {
    const saved = loadAlertConfigs()
    return alerts.map((a) => ({ ...a, ...(saved[a.name] || {}) }))
  })()
  const openConfigure = (a: (typeof alerts)[number]) => {
    setAlertToEdit({
      type: a.type as AlertType,
      name: a.name,
      recipients: a.recipients,
      status: a.status as 'active' | 'inactive',
    })
    setAlertForm({
      recipients: a.recipients,
      status: a.status as 'active' | 'inactive',
    })
  }
  const saveConfigure = () => {
    if (!alertToEdit) return
    const saved = loadAlertConfigs()
    saved[alertToEdit.name] = {
      recipients: alertForm.recipients,
      status: alertForm.status,
    }
    saveAlertConfigs(saved)
    setAlertToEdit(null)
    toast({ title: 'Saved', description: 'Alert configuration updated' })
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports', {
        // Add cache headers for better performance
        headers: {
          'Cache-Control': 'max-age=60', // Cache for 1 minute
        },
      })
      // if (!response.ok) {
      // throw new Error('Failed to fetch reports')
      // }
      const result = await response.json()
      const apiReports: Report[] =
        result.success && result.data ? result.data.reports || [] : []
      // Merge with any pending optimistic reports; dedupe by title+dates
      const pending = loadPendingReports()
      const key = (r: Report) => `${r.title}|${r.startDate}|${r.endDate}`
      const seen = new Set<string>()
      const merged: Report[] = []
      ;[...pending, ...apiReports].forEach((r) => {
        const k = key(r)
        if (!seen.has(k)) {
          seen.add(k)
          merged.push(r)
        }
      })
      setReports(merged)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
      toast({
        title: 'Error',
        description: 'Failed to load reports. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Delay the API call slightly to allow the page to render first
    const timer = setTimeout(() => {
      fetchReports()
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const getStarterInsights = (
    title: string,
    startISO: string,
    endISO: string
  ) => {
    return {
      summary: {
        title,
        period: { start: startISO, end: endISO },
        totals: {
          impressions: 125430,
          clicks: 8421,
          conversions: 674,
          revenue: 24580,
          spend: 13200,
        },
        kpis: [
          { name: 'CTR', value: 6.7 },
          { name: 'CVR', value: 8.0 },
          { name: 'CPA', value: 19.6 },
        ],
      },
      charts: {
        performance: Array.from({ length: 14 }).map((_, i) => ({
          day: i + 1,
          clicks: Math.round(400 + Math.random() * 120),
          conversions: Math.round(20 + Math.random() * 12),
          spend: Math.round(400 + Math.random() * 200),
        })),
        channels: [
          { name: 'Google Ads', revenue: 14200, spend: 7200 },
          { name: 'Meta Ads', revenue: 7800, spend: 4800 },
        ],
        topCampaigns: [
          { name: 'Brand - Search', roas: 4.2 },
          { name: 'Prospecting - Meta', roas: 3.1 },
        ],
      },
    }
  }

  const handleCreateReport = async (reportData: any) => {
    try {
      // Optimistic UI: add a ready report with starter insights immediately
      const optimisticId = `tmp_${Date.now()}`
      const optimisticReport: Report = {
        id: optimisticId,
        title: reportData.title,
        reportType: reportData.reportType,
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        data: getStarterInsights(
          reportData.title,
          reportData.startDate,
          reportData.endDate
        ),
        emailSentAt: null,
        createdAt: new Date().toISOString(),
      }
      setReports((prev) => [optimisticReport, ...prev])
      addPendingReport(optimisticReport)
      setCreateDialogOpen(false)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      // if (!response.ok) {
      //     throw new Error('Failed to create report')
      // }

      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Report created successfully',
        })

        // Reconcile with server data to replace optimistic report
        removePendingById(optimisticId)
        fetchReports()
      }
      // else {
      //     throw new Error(result.error?.message || 'Failed to create report')
      // }
    } catch (error) {
      console.error('Error creating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to create report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (!response.ok) {
        throw new Error('Failed to download report')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to download report')
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(result.data.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      })
    } catch (error) {
      console.error('Error downloading report:', error)
      toast({
        title: 'Error',
        description: 'Failed to download report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRegenerateReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/generate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate report')
      }

      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Report regenerated successfully',
        })

        fetchReports()
      } else {
        throw new Error(result.error?.message || 'Failed to regenerate report')
      }
    } catch (error) {
      console.error('Error regenerating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to regenerate report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete report')
      }

      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Report deleted successfully',
        })

        fetchReports()
      } else {
        throw new Error(result.error?.message || 'Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Alerts</h1>
        <p className="mt-1 text-muted-foreground">
          Automated insights and notifications for your marketing performance
        </p>
      </div>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Reports
              </CardTitle>
              <CardDescription>
                Download and schedule your marketing reports
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReports}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No reports yet</h3>
              <p className="mb-4 text-muted-foreground">
                Create your first report to get started with analytics insights.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Suspense
                fallback={
                  <div className="h-20 animate-pulse rounded bg-gray-200"></div>
                }
              >
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onDownload={handleDownloadReport}
                    onRegenerate={handleRegenerateReport}
                    onDelete={handleDeleteReport}
                  />
                ))}
              </Suspense>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Alert Notifications
          </CardTitle>
          <CardDescription>
            Configure how and where you receive marketing alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuredAlerts.map((alert) => (
              <div
                key={alert.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {alert.type === 'email' && (
                    <Mail className="h-5 w-5 text-primary" />
                  )}
                  {alert.type === 'slack' && (
                    <MessageSquare className="h-5 w-5 text-accent" />
                  )}
                  {alert.type === 'whatsapp' && (
                    <Smartphone className="h-5 w-5 text-success" />
                  )}

                  <div>
                    <h3 className="font-semibold">{alert.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {alert.recipients}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      alert.status === 'active' ? 'default' : 'secondary'
                    }
                    className={
                      alert.status === 'active'
                        ? 'bg-success text-success-foreground'
                        : ''
                    }
                  >
                    {alert.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openConfigure(alert)}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Integration */}
      {/* <Card>
                <CardHeader>
                    <CardTitle>Webhook Integration</CardTitle>
                    <CardDescription>
                        Connect your dashboard to external systems for real-time alerts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/30 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            Set up webhooks to receive real-time notifications when specific KPI thresholds are met.
                            Perfect for integrating with your existing tools and workflows.
                        </p>
                        <Button className="bg-gradient-primary text-white">
                            Setup Webhooks
                        </Button>
                    </div>
                </CardContent>
            </Card> */}

      <Suspense fallback={null}>
        <CreateReportDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreateReport={handleCreateReport}
        />
      </Suspense>

      {/* Configure Alert Dialog */}
      {alertToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">
              Configure: {alertToEdit.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Recipients</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={alertForm.recipients}
                  onChange={(e) =>
                    setAlertForm((prev) => ({
                      ...prev,
                      recipients: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={alertForm.status}
                  onChange={(e) =>
                    setAlertForm((prev) => ({
                      ...prev,
                      status: e.target.value as 'active' | 'inactive',
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAlertToEdit(null)}>
                Cancel
              </Button>
              <Button onClick={saveConfigure}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
