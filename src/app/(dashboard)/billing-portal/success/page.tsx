"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free: { name: 'Free', price: '$0/month' },
  basic: { name: 'Basic', price: '$19/month' },
  pro: { name: 'Pro', price: '$49/month' },
  business: { name: 'Business', price: '$99/month' },
}

export default function SuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const plan = params.get('plan') || 'pro'
  const meta = PLAN_LABELS[plan] || PLAN_LABELS.pro

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Active</h1>
        <p className="mt-1 text-muted-foreground">
          Thanks! Your subscription has been activated.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge>{meta.name}</Badge>
          </div>
          <CardDescription>
            You can manage your subscription from the billing portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Plan</span>
            <span className="font-medium">{meta.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Price</span>
            <span className="font-medium">{meta.price}</span>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Use the "Manage Subscription" button in Settings → Billing to update
            payment method or change plans.
          </div>
          <div className="pt-4">
            <Button onClick={() => router.push('/settings#billing')}>
              Go to Billing Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
