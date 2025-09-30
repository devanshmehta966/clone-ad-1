import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  // If Stripe is configured, try to create a Customer Portal session.
  // Otherwise, fall back to the internal placeholder route.
  const stripeSecret = process.env.STRIPE_SECRET_KEY

  if (stripeSecret) {
    try {
      // Use dynamic import so the app still runs if 'stripe' isn't installed in dev.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const StripeModule = await import('stripe')
      const Stripe = StripeModule.default || StripeModule
      const stripe = new Stripe(stripeSecret)

      // TODO: Replace with the actual customer ID from your authenticated user.
      // e.g., lookup by userId -> profile.stripeCustomerId in your DB.
      const customerId = process.env.DEMO_STRIPE_CUSTOMER_ID
      if (!customerId) {
        // If we don't have a customer yet, guide the developer.
        return Response.json(
          {
            url: '/billing-portal',
            note: 'Stripe configured but no customer ID provided. Set DEMO_STRIPE_CUSTOMER_ID or create a customer for the signed-in user.',
          },
          { status: 200 }
        )
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/billing-portal`
          : 'http://localhost:3000/billing-portal',
      })
      return Response.json({ url: session.url }, { status: 200 })
    } catch (err) {
      // On any error (including module not installed), fall back gracefully
      // console.error('Stripe portal error:', err)
      return Response.json({ url: '/billing-portal' }, { status: 200 })
    }
  }

  // Fallback: internal placeholder
  return Response.json({ url: '/billing-portal' }, { status: 200 })
}
