import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

type Provider = 'slack' | 'generic' | 'email'

function safeUrl(u: string) {
  try {
    const url = new URL(u)
    // Redact tokens in path for logs
    if (url.hostname.includes('hooks.slack.com')) {
      return `${url.origin}/services/REDACTED`
    }
    return `${url.origin}${url.pathname}`
  } catch {
    return 'invalid-url'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { provider, url, message, event, data } = (await req.json()) as {
      provider: Provider
      url: string
      message?: string
      event?: string
      data?: unknown
    }

    if (!provider) {
      return Response.json({ error: 'provider is required' }, { status: 400 })
    }

    if (provider !== 'email' && !url) {
      return Response.json({ error: 'url is required for non-email provider' }, { status: 400 })
    }

    // Auto-detect Slack from URL if not explicitly selected
    const parsed = url ? new URL(url) : null
    const isSlackUrl = !!parsed && parsed.hostname.includes('hooks.slack.com')
    const effectiveProvider: Provider = (isSlackUrl ? 'slack' : provider) as Provider

    // Add a timeout to avoid hanging
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    let resp: Response

    if (effectiveProvider === 'slack') {
      // Slack Incoming Webhook expects { text }
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message || `Event: ${event || 'alert'}` }),
        signal: controller.signal,
      })
    } else if (effectiveProvider === 'generic') {
      // Generic JSON webhook, send a simple normalized payload
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, event, data, source: 'marketing-dashboard' }),
        signal: controller.signal,
      })
    } else if (effectiveProvider === 'email') {
      // Placeholder: forward to a backend email processor if configured
      const emailEndpoint = process.env.EMAIL_WEBHOOK_URL
      if (!emailEndpoint) {
        return Response.json(
          {
            error: 'Email provider not configured',
            hint: 'Set EMAIL_WEBHOOK_URL or integrate an email provider (e.g., SendGrid) on the server.',
          },
          { status: 400 }
        )
      }
      resp = await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: event || 'Alert', text: message, data }),
        signal: controller.signal,
      })
    } else {
      return Response.json({ error: 'unsupported provider' }, { status: 400 })
    }
    clearTimeout(timeout)

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return Response.json(
        {
          error: 'forward_failed',
          detail: text?.slice(0, 500),
          target: url ? safeUrl(url) : undefined,
          provider: effectiveProvider,
          status: resp.status,
        },
        { status: 502 }
      )
    }

    return Response.json({ ok: true })
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'unknown')
    console.error('Webhook forward error:', msg)
    return Response.json({ error: 'internal_error', detail: msg }, { status: 500 })
  }
}
