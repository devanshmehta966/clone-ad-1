import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface NotificationPreferencesProps {
  preferences: {
    emailAlerts: boolean
    weeklyReports: boolean
    budgetAlerts: boolean
    performanceAlerts: boolean
  }
  onUpdate: () => void
}

type WebhookProvider = 'slack' | 'generic' | 'email'
const LS_KEYS = {
  prefs: 'notificationPrefs',
  webhook: 'webhookConfig',
} as const
const API = {
  savePrefs: '/api/profile/notifications',
  saveWebhook: '/api/profile/webhook',
  testWebhook: '/api/alerts/webhook',
} as const

export function NotificationPreferences({
  preferences,
  onUpdate,
}: NotificationPreferencesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [localPrefs, setLocalPrefs] = useState(preferences)
  const { toast } = useToast()
  const [webhookProvider, setWebhookProvider] = useState<WebhookProvider>('slack')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [savingWebhook, setSavingWebhook] = useState(false)
  const [testingWebhook, setTestingWebhook] = useState(false)

  // Keep local state in sync when parent props change
  useEffect(() => {
    setLocalPrefs(preferences)
  }, [preferences])

  // Local fallback storage for unauthenticated/demo mode
  const readLocal = <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }
  const writeLocal = (key: string, value: unknown) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }
  const loadLocalPrefs = () => readLocal<typeof localPrefs>(LS_KEYS.prefs)
  const saveLocalPrefs = (prefs: typeof localPrefs) => writeLocal(LS_KEYS.prefs, prefs)
  const loadLocalWebhook = () => {
    const saved = readLocal<{ provider?: WebhookProvider; url?: string }>(LS_KEYS.webhook)
    if (saved) {
      if (saved.provider) setWebhookProvider(saved.provider)
      if (saved.url) setWebhookUrl(saved.url)
    }
  }
  const saveLocalWebhook = (provider: WebhookProvider, url: string) =>
    writeLocal(LS_KEYS.webhook, { provider, url })

  // Small helper for JSON requests
  const requestJson = async (
    url: string,
    init: RequestInit & { body?: any }
  ): Promise<{ ok: boolean; status: number; body: any }> => {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    })
    let parsed: any = null
    try {
      parsed = await res.json()
    } catch {
      parsed = null
    }
    return { ok: res.ok, status: res.status, body: parsed }
  }

  // Initialize from local fallback if present and differs
  useEffect(() => {
    const saved = loadLocalPrefs()
    if (saved) {
      setLocalPrefs((prev) => ({ ...prev, ...saved }))
    }
    loadLocalWebhook()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePreference = async (
    key: keyof typeof localPrefs,
    value: boolean
  ) => {
    // Optimistically update UI
    const previous = { ...localPrefs }
    setLocalPrefs((prev) => ({ ...prev, [key]: value }))
    setIsLoading(true)
    try {
      const response = await requestJson(API.savePrefs, {
        method: 'PUT',
        body: { [key]: value },
      })

      if (!response.ok) {
        if (response.status === 401) {
          const merged = { ...previous, [key]: value }
          setLocalPrefs(merged)
          saveLocalPrefs(merged)
          toast({
            title: 'Saved locally',
            description: 'Preferences updated for this session.',
          })
          return
        }
        throw new Error('Failed to update notification preferences')
      }

      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been updated.',
      })

      onUpdate()
    } catch (error) {
      // Revert optimistic update on failure
      setLocalPrefs(previous)
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveWebhookConfig = async () => {
    setSavingWebhook(true)
    try {
      const res = await requestJson(API.saveWebhook, {
        method: 'PUT',
        body: { provider: webhookProvider, url: webhookUrl },
      })
      if (!res.ok) {
        if (res.status === 401) {
          // Save locally in demo/unauthenticated mode
          saveLocalWebhook(webhookProvider, webhookUrl)
          toast({
            title: 'Saved locally',
            description: 'Webhook saved for this session.',
          })
          // Also send a test message after saving
          await testWebhook()
          return
        }
        throw new Error('Failed to save webhook configuration')
      }
      toast({
        title: 'Webhook saved',
        description: 'Your webhook configuration was updated.',
      })
      // Also send a test message after saving
      await testWebhook()
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Unable to save webhook.',
        variant: 'destructive',
      })
    } finally {
      setSavingWebhook(false)
    }
  }

  const testWebhook = async () => {
    setTestingWebhook(true)
    try {
      const { ok, body } = await requestJson(API.testWebhook, {
        method: 'POST',
        body: {
          provider: webhookProvider,
          url: webhookUrl,
          message: 'Testing ads-analytics with webhook Alert Message',
          event: 'test_alert',
          data: { timestamp: new Date().toISOString() },
        },
      })
      if (!ok) throw new Error(body?.error || 'Webhook test failed')
      toast({
        title: 'Test sent',
        description: 'We successfully sent a test to your webhook.',
      })
    } catch (e: any) {
      toast({
        title: 'Test failed',
        description: e.message || 'Unable to send test.',
        variant: 'destructive',
      })
    } finally {
      setTestingWebhook(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive alerts and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-alerts">Email Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive important alerts via email
            </p>
          </div>
          <Switch
            id="email-alerts"
            checked={localPrefs.emailAlerts}
            onCheckedChange={(checked) =>
              updatePreference('emailAlerts', checked)
            }
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weekly-reports">Weekly Reports</Label>
            <p className="text-sm text-muted-foreground">
              Automated weekly performance summaries
            </p>
          </div>
          <Switch
            id="weekly-reports"
            checked={localPrefs.weeklyReports}
            onCheckedChange={(checked) =>
              updatePreference('weeklyReports', checked)
            }
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="budget-alerts">Budget Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Notifications when budgets exceed thresholds
            </p>
          </div>
          <Switch
            id="budget-alerts"
            checked={localPrefs.budgetAlerts}
            onCheckedChange={(checked) =>
              updatePreference('budgetAlerts', checked)
            }
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="performance-alerts">Performance Alerts</Label>
            <p className="text-sm text-muted-foreground">
              AI-powered campaign optimization suggestions
            </p>
          </div>
          <Switch
            id="performance-alerts"
            checked={localPrefs.performanceAlerts}
            onCheckedChange={(checked) =>
              updatePreference('performanceAlerts', checked)
            }
            disabled={isLoading}
          />
        </div>

        <div className="mt-6 space-y-3 rounded-lg border p-4">
          <div>
            <Label>Webhook Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Send alerts to Slack or any service that accepts JSON webhooks.
              Email is supported via your backend.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label>Provider</Label>
              <Select
                value={webhookProvider}
                onValueChange={(v) => setWebhookProvider(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder={
                  webhookProvider === 'slack'
                    ? 'https://hooks.slack.com/services/…'
                    : 'https://example.com/webhook'
                }
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveWebhookConfig}
              disabled={savingWebhook}
            >
              {savingWebhook ? 'Saving…' : 'Save'}
            </Button>
            <Button
              onClick={testWebhook}
              disabled={testingWebhook || !webhookUrl}
            >
              {testingWebhook ? 'Sending…' : 'Send Test'}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Example Slack payload: {`{ text: "Your alert message" }`}. Generic
            payload: {`{ message, event, data }`}.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
