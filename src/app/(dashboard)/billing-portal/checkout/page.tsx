"use client"

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  basic: { name: 'Basic', price: '$19/month' },
  pro: { name: 'Pro', price: '$49/month' },
  business: { name: 'Business', price: '$99/month' },
}

export default function CheckoutPage() {
  const params = useSearchParams()
  const router = useRouter()
  const planId = params.get('plan') || 'pro'
  const planMeta = PLAN_LABELS[planId] || PLAN_LABELS.pro

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const isValid = useMemo(() => {
    return (
      name.length > 1 &&
      email.includes('@') &&
      card.length >= 12 &&
      expiry.length >= 4 &&
      cvc.length >= 3
    )
  }, [name, email, card, expiry, cvc])

  const handlePay = async () => {
    setLoading(true)
    try {
      // In production, you would be redirected to Stripe Checkout from the plans grid.
      // This internal page simulates a payment form for demonstration.
      await new Promise((r) => setTimeout(r, 1200))
      router.replace(
        `/billing-portal/success?plan=${encodeURIComponent(planId)}`
      )
    } catch (e) {
      console.error(e)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-1 text-muted-foreground">
          Enter your payment details to start your subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              We accept all major credit and debit cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Billing Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <Input
                id="card"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="CVC"
                />
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!isValid || loading}
              onClick={handlePay}
            >
              {loading ? 'Processing…' : `Pay ${planMeta.price}`}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Summary</CardTitle>
              <Badge>{planMeta.name}</Badge>
            </div>
            <CardDescription>
              Your selected plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Plan</span>
              <span className="font-medium">{planMeta.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Billing interval</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price</span>
              <span className="font-medium">{planMeta.price}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estimated tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              You can cancel anytime. Upgrades prorate automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
