"use client"

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface Plan {
  id: string
  name: string
  priceMonthly: number
  currency: string
  interval: 'month' | 'year'
  description: string
  features: string[]
  highlight?: boolean
}

export const defaultPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 19,
    currency: 'USD',
    interval: 'month',
    description: 'Essential tools to get started.',
    features: [
      'Up to 3 clients',
      '2,000 API calls / mo',
      '1 GB storage',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 49,
    currency: 'USD',
    interval: 'month',
    description: 'Advanced features for growing teams.',
    features: [
      'Up to 10 clients',
      '20,000 API calls / mo',
      '5 GB storage',
      'Email support',
      'Advanced reports',
    ],
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 99,
    currency: 'USD',
    interval: 'month',
    description: 'Everything you need at scale.',
    features: [
      'Unlimited clients',
      '100,000 API calls / mo',
      '25 GB storage',
      'Priority support',
      'SSO & RBAC',
    ],
  },
]

interface PlansGridProps {
  plans?: Plan[]
  onSubscribe?: (planId: string) => Promise<void> | void
}

export function PlansGrid({
  plans = defaultPlans,
  onSubscribe,
}: PlansGridProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    try {
      setLoadingPlan(planId)
      if (onSubscribe) {
        await onSubscribe(planId)
        return
      }
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (!res.ok) throw new Error('Failed to start checkout')
      const data = await res.json()
      if (data?.url) {
        // Open the returned checkout URL in a new tab
        window.open(data.url, '_blank')
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (e) {
      console.error(e)
      alert('Unable to start checkout. Please try again later.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={plan.highlight ? 'border-primary/40 shadow-lg' : ''}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              {plan.highlight && (
                <Badge className="bg-gradient-primary text-white">
                  Popular
                </Badge>
              )}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-3xl font-bold">
                ${plan.priceMonthly}
                <span className="text-base font-normal text-muted-foreground">
                  /{plan.interval}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Currency: {plan.currency}
              </div>
            </div>

            <ul className="mb-6 list-disc space-y-1 pl-5 text-sm">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Taxes calculated at checkout</div>
              <div>• Cancel anytime; renews automatically</div>
              <div>• Proration when upgrading</div>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id
                ? 'Starting checkout…'
                : 'Add Subscription'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
