import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This is a scaffold. To enable:
// 1) Install Stripe: yarn add stripe
// 2) Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in your environment
// 3) Configure Stripe CLI or Dashboard to send webhooks to /api/stripe/webhook

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecret || !webhookSecret) {
    // Webhook not configured yet; return 200 so Stripe doesn't retry forever in dev
    return new Response('stripe not configured', { status: 200 })
  }

  try {
    // Dynamic import keeps app running even if stripe is not installed yet
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const StripeModule = await import('stripe')
    const Stripe = StripeModule.default || StripeModule
    const stripe = new Stripe(stripeSecret)

    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') || ''

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(
        'Webhook signature verification failed:',
        err?.message || err
      )
      return new Response('invalid signature', { status: 400 })
    }

    // Handle events of interest
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.paid':
      case 'invoice.payment_failed':
        // TODO: persist to DB (e.g., user profile subscription status/plan)
        console.log('Received event:', event.type)
        break
      default:
        console.log('Unhandled event type', event.type)
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error('Webhook handler error:', e)
    return new Response('error', { status: 500 })
  }
}
