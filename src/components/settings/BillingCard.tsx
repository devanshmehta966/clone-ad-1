"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Database } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlansGrid } from '@/components/billing/PlansGrid'

interface BillingCardProps {
  user: {
    profile: {
      subscriptionPlan: string | null
    } | null
  }
}

export function BillingCard({ user }: BillingCardProps) {
  const [portalOpen, setPortalOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null)
  const { toast } = useToast()

  const handleOpenPortal = async () => {
    try {
      setOpeningPortal(true)
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create portal session')
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (e: any) {
      console.error('Manage Subscription error:', e)
      toast({
        title: 'Unable to open portal',
        description: e.message || 'Please try again later.',
        variant: 'destructive',
      })
      // Fallback: navigate to internal placeholder portal so the user isn't stuck
      try {
        window.location.assign('/billing-portal')
      } catch {}
    } finally {
      setOpeningPortal(false)
    }
  }

  // Override add-subscription to close the modal before opening checkout
  const handleSubscribeFromModal = async (planId: string) => {
    try {
      setSubscribingPlan(planId)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (!res.ok) throw new Error('Failed to start checkout')
      const data = await res.json()
      if (data?.url) {
        setPlansOpen(false)
        window.open(data.url, '_blank')
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (e: any) {
      console.error('Checkout start error:', e)
      toast({
        title: 'Unable to start checkout',
        description: e.message || 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setSubscribingPlan(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Current Plan</span>
                  <p className="text-sm text-muted-foreground">
                    {user.profile?.subscriptionPlan || 'Professional Plan'}
                  </p>
                </div>
                <Badge className="bg-gradient-primary text-white">Pro</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Cost</span>
                <span className="font-semibold">$99/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Billing</span>
                <span className="text-sm text-muted-foreground">
                  Jan 15, 2025
                </span>
              </div>
              <Button className="w-full" onClick={() => setPlansOpen(true)}>
                View Plans & Pricing
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setPortalOpen(true)}
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Usage Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Calls</span>
                <span className="text-sm">8,450/10,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Storage</span>
                <span className="text-sm">2.3GB/5GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Clients</span>
                <span className="text-sm">12/25</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans & Pricing Modal */}
      <Dialog open={plansOpen} onOpenChange={setPlansOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Plans & Pricing</DialogTitle>
            <DialogDescription>
              Choose the plan that fits your needs. Taxes are calculated at
              checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <PlansGrid onSubscribe={handleSubscribeFromModal} />
            <div className="text-xs text-muted-foreground">
              Notes: Upgrades prorate automatically. You can cancel anytime from
              the billing portal.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlansOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Portal Modal */}
      <Dialog open={portalOpen} onOpenChange={setPortalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Review your current plan and access the billing portal to update
              payment details or change plans.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">
                  Current Plan
                </div>
                <div className="font-medium">
                  {user.profile?.subscriptionPlan || 'Professional Plan'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Next Billing
                </div>
                <div className="font-medium">Jan 15, 2025</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Monthly Cost
                </div>
                <div className="font-medium">$99/month</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="font-medium">Active</div>
              </div>
            </div>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              Tip: When integrating Stripe, create an endpoint like{' '}
              <code>/api/billing/portal</code> to generate a customer portal
              session, then redirect the user to the returned URL.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleOpenPortal} disabled={openingPortal}>
              {openingPortal ? 'Opening…' : 'Open Billing Portal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
