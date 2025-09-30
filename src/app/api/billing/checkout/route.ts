import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Creates a Stripe Checkout Session for subscriptions and returns the hosted URL.
  // Falls back to internal mock checkout if Stripe is not configured.
  const { planId } = await req.json().catch(() => ({ planId: undefined }))

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Map planId -> price ID from environment
  const priceMap: Record<string, string | undefined> = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
    business: process.env.STRIPE_PRICE_BUSINESS,
  }

  if (stripeSecret && planId && priceMap[planId]) {
    try {
      // Dynamic import to avoid build errors if stripe not installed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const StripeModule = await import('stripe')
      const Stripe = StripeModule.default || StripeModule
      const stripe = new Stripe(stripeSecret)

      const customerId = process.env.DEMO_STRIPE_CUSTOMER_ID

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        billing_address_collection: 'auto',
        payment_method_types: ['card'],
        customer: customerId, // optional; if omitted, Stripe will create a new customer
        line_items: [
          {
            price: priceMap[planId] as string,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/billing-portal/success?plan=${encodeURIComponent(planId)}`,
        cancel_url: `${appUrl}/billing-portal/checkout?plan=${encodeURIComponent(planId)}`,
        allow_promotion_codes: true,
      })

      if (session.url) {
        return Response.json({ url: session.url }, { status: 200 })
      }
    } catch (err) {
      console.error('Stripe checkout error:', err)
      // fall through to internal fallback below
    }
  }

  // Fallback to internal mock checkout UI
  const url = `/billing-portal/checkout?plan=${encodeURIComponent(planId || '')}`
  return Response.json({ url }, { status: 200 })
}
