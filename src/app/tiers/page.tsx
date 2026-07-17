import type { Metadata } from 'next'
import TiersWizard from '@/components/TiersWizard'

export const metadata: Metadata = {
  title: 'Patronage tier wizard — Sparkz',
  description:
    'Set up tokenless recurring memberships for your community — $5, $25, $100 — with customizable perks per tier. No token required. 88% of community builders monetize this way.',
}

export default function TiersPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
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
