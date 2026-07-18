import type { Metadata } from 'next'
import Link from 'next/link'
import { SPARK_EXAMPLES } from '@/lib/spark-examples'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Spark examples')}&sub=${encodeURIComponent('9 templates. Start tokenless. Build real community.')}`

export const metadata: Metadata = {
  title: 'Spark examples — Sparkz',
  description:
    '7 concrete spark templates: leaderboard community, music collab, group crowdfund, PFP/NFT community, light DAO, solo patronage, and collab split. Each shows the no-token starting point, the split config, and when (or if) to add a token.',
  openGraph: {
    title: 'Spark examples — Sparkz',
    description: '7 templates. Start tokenless. Build real community. Each one shows the split config, perks, and when (or if) to add a token.',
    url: `${BASE_URL}/examples`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Spark examples — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spark examples — Sparkz',
    description: '7 templates. Start tokenless. Build real community.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '⚡ Get my recommended split',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/advisor`,
    'fc:frame:button:2': '🏅 Apply for a slot',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/vetted`,
  },
}

const TOKEN_PATH_LABELS = {
  now: { label: 'Token ready now', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
  later: { label: 'Build first, token later', color: 'text-slate-300', bg: 'bg-zao-card border-zao-border' },
  never: { label: 'Patronage only', color: 'text-slate-400', bg: 'bg-zao-dark border-zao-border' },
}

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <Link href="/advisor" className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
            ⚡ Get my split →
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          {SPARK_EXAMPLES.length} ways to start<br />
          <span className="text-gradient-gold">with a spark.</span>
        </h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed text-lg">
          Each template shows: what the situation is, what you can do today before any token
          exists, how the split is configured, and when (or if) a token makes sense. Start from
          the one that fits, then customize in the advisor.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {SPARK_EXAMPLES.map((ex) => {
            const tp = TOKEN_PATH_LABELS[ex.tokenPath]
            return (
              <Link
                key={ex.slug}
                href={`/examples/${ex.slug}`}
                className="card-dark p-5 hover:border-gold-500/30 transition-colors flex flex-col gap-3"
              >
                <div className="text-3xl">{ex.emoji}</div>
                <div>
                  <div className="font-black text-white text-lg leading-tight">{ex.title}</div>
                  <div className="text-sm text-slate-400 mt-1">{ex.tagline}</div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${tp.bg} ${tp.color}`}>
                    {tp.label}
                  </span>
                  {ex.realExample && (
                    <span className="text-xs text-slate-600">Live: {ex.realExample.name}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        <p className="text-xs text-slate-600">
          These are templates, not requirements. Customize everything. The advisor helps you pick
          the right starting percentages for your specific situation.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="card-dark p-6 sm:p-8">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
            The pattern across all {SPARK_EXAMPLES.length}
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="font-bold text-white mb-2">Today (no token)</div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex gap-2"><span className="text-gold-500">→</span> Publish the community metric</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Show projected earnings</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Accept card backing (opt)</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Set split config in wizard</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-2">When momentum is proven</div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex gap-2"><span className="text-gold-500">→</span> Deploy 0xSplits contract</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Deploy on Clanker (human)</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Weekly snapshot + receipt</li>
                <li className="flex gap-2"><span className="text-gold-500">→</span> Update split on-chain</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-2">The invariants</div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex gap-2"><span className="text-gold-500">✓</span> Community split is public</li>
                <li className="flex gap-2"><span className="text-gold-500">✓</span> Fees accumulate on-chain — claim at splits.org</li>
                <li className="flex gap-2"><span className="text-gold-500">✓</span> ZAO stake, not fee cut</li>
                <li className="flex gap-2"><span className="text-gold-500">✓</span> No auto-mint, ever</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
