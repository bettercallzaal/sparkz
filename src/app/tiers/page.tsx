import type { Metadata } from 'next'
import Link from 'next/link'
import TiersWizard from '@/components/TiersWizard'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Patronage tiers')}&sub=${encodeURIComponent('$5 / $25 / $100. No token required. Just membership.')}`

export const metadata: Metadata = {
  title: 'Patronage tier wizard — Sparkz',
  description:
    'Set up tokenless recurring memberships for your community — $5, $25, $100 — with customizable perks per tier. No token required. 88% of community builders monetize this way.',
  openGraph: {
    title: 'Patronage tiers — Sparkz',
    description: 'Tokenless recurring memberships. $5, $25, $100. Customizable perks. 88% of community builders monetize this way.',
    url: `${BASE_URL}/tiers`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Patronage tiers — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patronage tiers — Sparkz',
    description: '$5 / $25 / $100. No token required. Just membership.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🏅 Set up my tiers',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/tiers`,
    'fc:frame:button:2': '⚡ Try the advisor first',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/advisor`,
  },
}

export default function TiersPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">Patronage tiers</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-6">
            ✦ No token required
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Give your community a way to back you.
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Recurring memberships — $5, $25, $100 — with perks that exist today. 88% of community
            builders monetize through patronage before they ever think about a token. Set up your
            tiers, preview what fans see, and export your config.
          </p>
        </div>
        <TiersWizard />
      </div>
    </main>
  )
}
