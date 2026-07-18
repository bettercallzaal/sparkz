import type { Metadata } from 'next'
import Link from 'next/link'
import { LAUNCHES, STATUS_LABELS, TYPE_LABELS } from '@/lib/launches'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Sparkz launches')}&sub=${encodeURIComponent('ZAO-vetted. Transparent splits. No token hype.')}`

export const metadata: Metadata = {
  title: 'Sparkz launches — ZAO-backed creator communities',
  description:
    'Every Sparkz launch is ZAO-vetted. Browse live and upcoming communities — each with transparent fee splits, on-chain receipts, and no token hype.',
  openGraph: {
    title: 'Sparkz launches — ZAO-backed creator communities',
    description: 'ZAO-vetted launches with transparent fee splits, on-chain receipts, and no speculation language.',
    url: `${BASE_URL}/launches`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Sparkz launches' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkz launches',
    description: 'ZAO-vetted. Transparent splits. No token hype.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🟡 See Zoostr — live now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/launches/zoostr`,
    'fc:frame:button:2': '🏅 Apply for a slot',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/vetted`,
  },
}

export default function LaunchesPage() {
  const live = LAUNCHES.filter((l) => l.status === 'live')
  const rest = LAUNCHES.filter((l) => l.status !== 'live')

  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <Link href="/vetted" className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
            🏅 Apply for a slot
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Sparkz Launches</h1>
            <p className="text-slate-400 max-w-xl leading-relaxed">
              Every launch here is ZAO-vetted. Transparent fee splits, on-chain receipts, no
              speculation language. 50 slots per quarter.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-gold-400">{LAUNCHES.length}</div>
            <div className="text-xs text-slate-500">launch{LAUNCHES.length !== 1 ? 'es' : ''} · Q3 2026</div>
          </div>
        </div>
      </section>

      {/* Live launches */}
      {live.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider">Live now</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {live.map((l) => (
              <LaunchCard key={l.slug} launch={l} />
            ))}
          </div>
        </section>
      )}

      {/* Other launches */}
      {rest.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">In progress</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {rest.map((l) => (
              <LaunchCard key={l.slug} launch={l} />
            ))}
          </div>
        </section>
      )}

      {/* Scarcity reminder + CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="card-dark p-6 sm:p-8 text-center border-gold-500/20">
          <div className="text-3xl mb-3">🏅</div>
          <h2 className="text-xl font-black text-white mb-2">50 slots per quarter.</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            ZAO reviews every application personally. If your community is real and your framing
            is honest, apply. If it&rsquo;s a fit, ZOL will reach out within 48 hours.
          </p>
          <Link href="/vetted" className="btn-gold inline-block">
            Apply for a slot →
          </Link>
        </div>
      </section>
    </main>
  )
}

function LaunchCard({ launch }: { launch: import('@/lib/launches').Launch }) {
  return (
    <a
      href={`/launches/${launch.slug}`}
      className="card-dark p-6 flex flex-col gap-3 hover:border-gold-500/30 transition-colors block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{launch.emoji}</span>
          <div>
            <div className="font-black text-white text-lg leading-tight">{launch.name}</div>
            {launch.ticker && (
              <div className="text-xs text-gold-400 font-mono">${launch.ticker}</div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs text-slate-400">{STATUS_LABELS[launch.status]}</span>
          {launch.zaoVetted && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold">
              🏅 Vetted
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{launch.tagline}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{TYPE_LABELS[launch.type]}</span>
        <span>·</span>
        <span>{launch.communityPool}% to community</span>
        <span>·</span>
        <span>{launch.quarter}</span>
      </div>
    </a>
  )
}
