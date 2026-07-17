import { NextResponse } from 'next/server'

// Notification address for new applications
const NOTIFY_EMAIL = process.env.ZAO_NOTIFY_EMAIL ?? 'zaalp99@gmail.com'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'sparkz@sparkz.xyz'

type Application = {
  handle: string
  projectName?: string
  communityDescription: string
  communityMetric?: string
  launchIntent: 'now' | 'later' | 'never'
  splitIdea?: string
  contact: string
}

export async function POST(request: Request) {
  const body = await request.json()
  const app = body as Application

  if (!app.handle || !app.communityDescription || !app.launchIntent || !app.contact) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    // Simulation mode — log the application and return success
    console.log('[vetted-application] Received (no Resend key):', JSON.stringify(app))
    return NextResponse.json({ received: true, notified: false })
  }

  const subject = `[Sparkz Vetted] New application — ${app.handle}${app.projectName ? ` / ${app.projectName}` : ''}`

  const html = `
<h2>New ZAO Vetted Application</h2>
<table style="border-collapse:collapse;font-family:monospace;font-size:14px;">
  <tr><td style="padding:6px 12px 6px 0;color:#888;">Handle</td><td style="padding:6px 0;"><strong>${esc(app.handle)}</strong></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#888;">Project</td><td style="padding:6px 0;">${esc(app.projectName ?? '—')}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#888;">Token intent</td><td style="padding:6px 0;">${esc(app.launchIntent)}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#888;">Contact</td><td style="padding:6px 0;">${esc(app.contact)}</td></tr>
</table>
<h3>Community</h3>
<p>${esc(app.communityDescription)}</p>
${app.communityMetric ? `<p><strong>Metric:</strong> ${esc(app.communityMetric)}</p>` : ''}
${app.splitIdea ? `<h3>Split idea</h3><p>${esc(app.splitIdea)}</p>` : ''}
<hr/>
<p style="color:#888;font-size:12px;">Received via sparkz.xyz/vetted</p>
`

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.json()
    console.error('[vetted-application] Resend error:', err)
    // Still return success to the user — don't fail the form
    return NextResponse.json({ received: true, notified: false })
  }

  return NextResponse.json({ received: true, notified: true })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
