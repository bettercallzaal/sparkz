import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'

const TIER_CONFIG: Record<string, { cents: number; label: string }> = {
  '$5': { cents: 500, label: 'Spark Backing' },
  '$25': { cents: 2500, label: 'Flame Backing' },
  '$100': { cents: 10000, label: 'Empire Backing' },
}

export async function POST(request: Request) {
  const body = await request.json()
  const { tier, email, farcaster } = body as {
    tier: string
    email: string
    farcaster?: string
  }

  if (!email || !tier || !TIER_CONFIG[tier]) {
    return NextResponse.json({ error: 'email and tier required' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    // Simulation mode — no Stripe key set (dev / pre-launch)
    return NextResponse.json({ waitlist: true, tier, email })
  }

  const config = TIER_CONFIG[tier]

  // Stripe Checkout Session — REST API (no SDK needed)
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${BASE_URL}/back/success?tier=${encodeURIComponent(tier)}`,
    cancel_url: `${BASE_URL}/back`,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(config.cents),
    'line_items[0][price_data][product_data][name]': `Sparkz ${config.label}`,
    'line_items[0][price_data][product_data][description]':
      'Fan backing — perks are what holders enjoy today, not guarantees.',
    customer_email: email,
    'metadata[tier]': tier,
    'metadata[farcaster]': farcaster ?? '',
    'metadata[source]': 'sparkz-back',
  })

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${stripeKey}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!stripeRes.ok) {
    const err = await stripeRes.json()
    console.error('[/api/back] Stripe error:', err)
    return NextResponse.json({ error: 'Payment setup failed. Please try again.' }, { status: 502 })
  }

  const session = await stripeRes.json()
  return NextResponse.json({ checkoutUrl: session.url, tier, email })
}
