import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SPARK_EXAMPLES, getExampleBySlug } from '@/lib/spark-examples'

export function generateStaticParams() {
  return SPARK_EXAMPLES.map((e) => ({ slug: e.slug }))
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ex = getExampleBySlug(slug)
  if (!ex) return {}
  const title = `${ex.title} — Spark examples — Sparkz`
  const ogTitle = encodeURIComponent(`${ex.emoji} ${ex.title}`)
  const ogSub = encodeURIComponent(ex.tagline)
  const ogUrl = `${BASE_URL}/api/og?title=${ogTitle}&sub=${ogSub}`
  const pageUrl = `${BASE_URL}/examples/${slug}`
  const advisorUrl = `${BASE_URL}/advisor?situation=${ex.advisorPreset.situation}&token=${ex.advisorPreset.tokenTiming}&fee=${ex.advisorPreset.feeModel}`
  return {
    title,
    description: ex.tagline,
    openGraph: {
      title,
      description: ex.tagline,
      url: pageUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ex.tagline,
      images: [ogUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': ogUrl,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': '⚡ Get my recommended split',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': advisorUrl,
      'fc:frame:button:2': '← All templates',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': `${BASE_URL}/examples`,
    },
  }
}

const TOKEN_PATH_LABELS = {
  now: 'Launch a token now',
  later: 'Build first, token later',
  never: 'Patronage only — no token',
}

export default async function ExampleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ex = getExampleBySlug(slug)
  if (!ex) notFound()

  const totalFee = ex.splitConfig.communityPool + ex.splitConfig.creatorPool + ex.splitConfig.treasury
  const advisorParams = new URLSearchParams({
    situation: ex.advisorPreset.situation,
    token: ex.advisorPreset.tokenTiming,
    fee: ex.advisorPreset.feeModel,
  })

  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <Link href="/examples" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← All examples
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24 space-y-8">
        {/* Header */}
        <div>
          <div className="text-5xl mb-4">{ex.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{ex.title}</h1>
          <p className="text-xl text-slate-400">{ex.tagline}</p>
          {ex.realExample && (
            <a
              href={ex.realExample.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm text-gold-400 hover:text-gold-300 transition-colors"
            >
              🟡 Live example: {ex.realExample.name} ↗
            </a>
          )}
        </div>

        {/* Situation */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">The situation</div>
          <p className="text-slate-300 leading-relaxed">{ex.situation}</p>
        </div>

        {/* What to do today (no token) */}
        <div className="card-dark p-6 border-gold-500/20">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
            What you can do TODAY — no token required
          </div>
          <p className="text-slate-300 leading-relaxed">{ex.noTokenAction}</p>
        </div>

        {/* Community metric */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Community metric</div>
          <p className="text-slate-300 text-sm leading-relaxed">{ex.metric}</p>
        </div>

        {/* Split config */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Recommended fee split
          </div>
          <div className="space-y-3 mb-4">
            {[
              { label: 'Community pool', pct: ex.splitConfig.communityPool, color: 'bg-gold-500' },
              { label: 'Creator pool', pct: ex.splitConfig.creatorPool, color: 'bg-zao-violet' },
              { label: 'Treasury', pct: ex.splitConfig.treasury, color: 'bg-slate-600' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-bold text-white tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 bg-zao-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${(pct / totalFee) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-600 mb-3">
            ZAO stake: {ex.splitConfig.zaoStake}% of token supply (not a fee slice)
          </div>
          {ex.splitConfig.note && (
            <p className="text-xs text-slate-500 italic leading-relaxed">{ex.splitConfig.note}</p>
          )}
        </div>

        {/* Perks */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">What backers enjoy today</div>
          <ul className="space-y-2">
            {ex.perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Token path */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Token path: {TOKEN_PATH_LABELS[ex.tokenPath]}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{ex.tokenNote}</p>
        </div>

        {/* CTAs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href={`/advisor?${advisorParams}`}
            className="card-dark p-5 hover:border-gold-500/30 transition-colors block"
          >
            <div className="text-xl mb-2">⚡</div>
            <div className="font-bold text-white mb-1">Get your split config</div>
            <div className="text-xs text-slate-500">
              Advisor pre-filled for this template → adjust to your numbers
            </div>
          </Link>
          <Link
            href="/split-wizard"
            className="card-dark p-5 hover:border-gold-500/30 transition-colors block"
          >
            <div className="text-xl mb-2">🎵</div>
            <div className="font-bold text-white mb-1">Split wizard</div>
            <div className="text-xs text-slate-500">
              Add collaborators, set roles and %, export JSON for 0xSplits
            </div>
          </Link>
        </div>

        {/* Browse other examples */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Other examples</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {SPARK_EXAMPLES.filter((e) => e.slug !== ex.slug).slice(0, 4).map((other) => (
              <Link
                key={other.slug}
                href={`/examples/${other.slug}`}
                className="flex items-center gap-3 card-dark p-4 hover:border-gold-500/30 transition-colors"
              >
                <span className="text-2xl">{other.emoji}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{other.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{other.tagline}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
