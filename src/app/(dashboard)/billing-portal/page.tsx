"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function BillingPortalPlaceholder() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing Portal</h1>
        <p className="mt-1 text-muted-foreground">
          This is a placeholder. Connect your billing provider to enable full
          portal functionality.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Wire this page to your provider (e.g., Stripe Customer Portal)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => router.push('/settings#billing')}>
            Back to Settings
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
