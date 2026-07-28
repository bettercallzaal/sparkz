import type { Metadata } from 'next'
import Link from 'next/link'
import { LAUNCHES, STATUS_LABELS, TYPE_LABELS } from '@/lib/launches'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Discover Sparks')}&sub=${encodeURIComponent('ZAO-curated. Contribution-first. No token hype.')}`

export const metadata: Metadata = {
  title: 'Discover Sparks — Sparkz',
  description:
    'Browse active Sparkz communities — each built contribution-first, with transparent fee splits and no token hype. ZAO-curated, not permissionless.',
  openGraph: {
    title: 'Discover Sparks — Sparkz',
    description: 'ZAO-curated communities building in public. Contribution → points → fee share. No speculation.',
    url: `${BASE_URL}/discover`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Discover Sparks — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Sparks — Sparkz',
    description: 'ZAO-curated. Contribution-first. No token hype.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🟡 Zoostr — live now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/launches/zoostr`,
    'fc:frame:button:2': '⚡ Start your spark',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/advisor`,
  },
}

export const revalidate = 60

const BUILDING_EXAMPLES = [
  {
    emoji: '🎵',
    name: 'Collab EP split',
    type: 'collab' as const,
    tagline: 'Three producers. One split sheet. No disputes.',
    description:
      'Each contributor gets a share of streaming and token fees proportional to their role — producer, vocalist, engineer. Split sheet locked in before the first track drops.',
    stage: 'Stage 2 — Emerging',
    stageNote: 'Building leaderboard before token',
  },
  {
    emoji: '🏛️',
    name: 'Fan-backed crowdfund',
    type: 'crowdfund' as const,
    tagline: 'Fund the album. Earn from it forever.',
    description:
      'Fans back the project before the token exists. When the token launches, the crowdfunder list becomes the initial split weights — backers earn proportionally from every trade.',
    stage: 'Stage 3 — Verified',
    stageNote: 'ZAO-vetted, token timing pending',
  },
  {
    emoji: '⭕',
    name: 'Culture Circle',
    type: 'dao' as const,
    tagline: 'Communities backing communities.',
    description:
      'A spark that backs other sparks. Circles pool resources to back emerging artists in their network — no token required, just composable 0xSplits contracts.',
    stage: 'Stage 2 — Emerging',
    stageNote: 'Pre-token mutual backing',
  },
]

export default function DiscoverPage() {
  const liveLaunches = LAUNCHES.filter((l) => l.status === 'live')
  const upcomingLaunches = LAUNCHES.filter((l) => l.status !== 'live')

  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/examples" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Examples
            </Link>
            <Link href="/vetted" className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
              🏅 Get vetted
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-6">
              ⬡ ZAO-curated · not permissionless
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Discover Sparks</h1>
            <p className="text-slate-400 max-w-xl leading-relaxed">
              Active communities building in public. Every spark starts with contribution — no token
              required to back, earn, or participate.
            </p>
          </div>
          <Link
            href="/advisor"
            className="shrink-0 btn-gold text-sm py-2.5 px-5"
          >
            ⚡ Start your spark →
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Main feed */}
          <div className="space-y-10">

            {/* Live launches */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live</span>
                <div className="h-px flex-1 bg-zao-border" />
                <span className="text-xs text-slate-600">{liveLaunches.length} active</span>
              </div>
              {liveLaunches.length === 0 ? (
                <p className="text-slate-600 text-sm">No live launches yet.</p>
              ) : (
                <div className="space-y-4">
                  {liveLaunches.map((launch) => (
                    <Link
                      key={launch.slug}
                      href={`/launches/${launch.slug}`}
                      className="group block bg-zao-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-6 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">{launch.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-black text-white text-lg group-hover:text-gold-300 transition-colors">
                              {launch.name}
                            </span>
                            {launch.ticker && (
                              <span className="text-xs text-gold-400 font-bold bg-gold-500/10 px-2 py-0.5 rounded-full">
                                ${launch.ticker}
                              </span>
                            )}
                            <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">
                              {STATUS_LABELS[launch.status]}
                            </span>
                            {launch.zaoVetted && (
                              <span className="text-xs text-gold-400 font-semibold">⬡ ZAO-vetted</span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{launch.tagline}</p>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{launch.description}</p>
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                            <span>{TYPE_LABELS[launch.type]}</span>
                            <span>·</span>
                            <span>{launch.communityPool}% community pool</span>
                            <span>·</span>
                            <span>{launch.feeModel.split('·')[0].trim()}</span>
                          </div>
                        </div>
                        <div className="text-slate-600 group-hover:text-gold-400 transition-colors text-lg shrink-0">→</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Building — curated examples */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">What gets built here</span>
                <div className="h-px flex-1 bg-zao-border" />
              </div>
              <div className="space-y-4">
                {BUILDING_EXAMPLES.map((ex) => (
                  <div
                    key={ex.name}
                    className="bg-zao-card border border-zao-border rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl shrink-0">{ex.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-black text-white text-lg">{ex.name}</span>
                          <span className="text-xs text-slate-500 font-semibold bg-zao-border/50 px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[ex.type]}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{ex.tagline}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{ex.description}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
                          {ex.stage} · {ex.stageNote}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/examples" className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-semibold">
                  See all 9 spark templates →
                </Link>
              </div>
            </div>

            {/* Upcoming */}
            {upcomingLaunches.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Coming up</span>
                  <div className="h-px flex-1 bg-zao-border" />
                </div>
                <div className="space-y-4">
                  {upcomingLaunches.map((launch) => (
                    <Link
                      key={launch.slug}
                      href={`/launches/${launch.slug}`}
                      className="group block bg-zao-card border border-zao-border hover:border-gold-500/30 rounded-2xl p-5 transition-colors opacity-80 hover:opacity-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl shrink-0">{launch.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="font-bold text-white group-hover:text-gold-300 transition-colors">{launch.name}</span>
                            <span className="text-xs text-slate-500 font-semibold">{STATUS_LABELS[launch.status]}</span>
                            {launch.zaoVetted && (
                              <span className="text-xs text-gold-400 font-semibold">⬡ ZAO-vetted</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs">{launch.tagline}</p>
                        </div>
                        <div className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0">→</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">

            {/* Start a spark */}
            <div className="bg-zao-card border border-gold-500/20 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Start your spark
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Get a recommended split, token timing, and fee model in 3 questions. No token required to start.
              </p>
              <Link href="/advisor" className="block btn-gold text-center text-xs py-2 mb-3">
                ⚡ Try the advisor →
              </Link>
              <Link href="/vetted" className="block text-center text-xs text-gold-400 hover:text-gold-300 transition-colors py-1.5 border border-gold-500/20 hover:border-gold-500/40 rounded-xl">
                🏅 Apply for ZAO vetting
              </Link>
            </div>

            {/* Tools */}
            <div className="bg-zao-card border border-zao-border rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Tools
              </div>
              <div className="space-y-2">
                {[
                  { href: '/split-wizard', label: '⚙️ Split sheet wizard' },
                  { href: '/tiers', label: '💳 Patronage tiers' },
                  { href: '/circles', label: '⭕ Culture Circles' },
                  { href: '/rewards', label: '🏆 Rewards mechanics' },
                  { href: '/audius', label: '🎵 Audius integration' },
                  { href: '/collectables', label: '🃏 Collectables' },
                  { href: '/lifecycle', label: '📋 Spark lifecycle' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1"
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* What ZAO-curated means */}
            <div className="bg-zao-card border border-zao-border rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                ZAO-curated
              </div>
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>Every launch here passed ZAO vetting — contribution culture established, split config reviewed, no investment language.</p>
                <p>50 slots per quarter. Apply at <Link href="/vetted" className="text-gold-400 hover:underline">/vetted</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
