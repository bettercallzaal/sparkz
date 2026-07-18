import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=Sparkz&sub=Start+with+a+spark%2C+not+a+token.`

export const metadata: Metadata = {
  title: 'Sparkz — Start with a spark, not a token',
  description:
    'Build your community, set your splits, and let fans back your work — all before any coin exists. ZAO-curated creator launches with multi-recipient 0xSplits.',
  openGraph: {
    title: 'Sparkz — Start with a spark, not a token',
    description: 'Back the work. Multi-recipient fee splits. No token required to get started.',
    url: BASE_URL,
    siteName: 'Sparkz',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Sparkz — Start with a spark, not a token' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkz — Start with a spark, not a token',
    description: 'Back the work. Multi-recipient fee splits. No token required to get started.',
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

type BoostrStats = {
  activeContributorsCount: number
  allTimeContributorsCount: number
  totalLikesGenerated: number
}

async function fetchZoostrStats(): Promise<BoostrStats | null> {
  try {
    const res = await fetch('https://boostr.itscashless.com/api/zabaal/stats', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const raw = await res.json()
    if (!raw.success || !raw.stats) return null
    const s = raw.stats
    return {
      activeContributorsCount: s.activeContributorsCount ?? 0,
      allTimeContributorsCount: s.allTimeContributorsCount ?? 0,
      totalLikesGenerated: s.totalLikesGenerated ?? 0,
    }
  } catch {
    return null
  }
}

const USE_CASES = [
  {
    emoji: '🎵',
    title: 'Music collabs',
    description:
      'Set roles and splits before you record. Producer, engineer, featured artist — every collaborator gets their fair share, on-chain, from day one. No disputes later.',
    cta: 'Set up your split sheet',
    href: '/split-wizard',
  },
  {
    emoji: '💳',
    title: 'Fan backing',
    description:
      'Your fans back your next album with a card — no wallet, no gas, no friction. They collect a proof of backing. You get early momentum before any token exists.',
    cta: 'Back with a card',
    href: '/back',
  },
  {
    emoji: '🏆',
    title: 'Community leaderboard',
    description:
      'The community that shows up the most earns the most. A boost engine amplifies your reach and pays the people who built your empire — proportional to their contribution.',
    cta: 'See it live (Zoostr)',
    href: 'https://zoostr.xyz',
  },
  {
    emoji: '🎟',
    title: 'Patronage tiers',
    description:
      'Set up $5/$25/$100 recurring memberships with custom perks — no token required. Preview your fan page, export the config. 88% of community builders monetize this way before any token.',
    cta: 'Set up your tiers',
    href: '/tiers',
  },
  {
    emoji: '⚡',
    title: 'Split advisor',
    description:
      '3 questions → recommended split + token timing + fee model. Crowdfunding? Collab? Solo with producers? The advisor gives you a concrete starting point, not a blank form.',
    cta: 'Get my recommended split',
    href: '/advisor',
  },
  {
    emoji: '🏅',
    title: 'Vetted by ZAO',
    description:
      '50 launch slots per quarter. If you get one, ZAO stands behind your launch publicly — badge, ZOL marketing support, aligned token stake, and the full Sparkz stack pre-built.',
    cta: 'Apply for a slot',
    href: '/vetted',
  },
  {
    emoji: '📖',
    title: 'Spark examples',
    description:
      '7 concrete templates: leaderboard community, music collab, group crowdfund, PFP/NFT community, light DAO, solo patronage, and collab split. Each shows the no-token starting action, the split config, and when to add a token.',
    cta: 'Browse templates',
    href: '/examples',
  },
  {
    emoji: '🔁',
    title: 'The spark lifecycle',
    description:
      '5 stages: Proposed → Emerging → Verified → Established → Federated. Know exactly where you are, what\'s available today, and what the next step looks like — before committing to anything on-chain.',
    cta: 'Find your stage',
    href: '/lifecycle',
  },
  {
    emoji: '◎',
    title: 'Culture Circles',
    description:
      'Sparks back other sparks. A creator with a growing community boosts an established spark, earns from its fee pool, and builds proof-of-contribution before their own token exists. When they launch, both communities cross-boost.',
    cta: 'How circles work',
    href: '/circles',
  },
  {
    emoji: '🎧',
    title: 'Audius integration',
    description:
      'Enter your Audius handle to see your catalog\'s engagement metrics — plays, favorites, reposts. In v2, your top listeners\' engagement maps directly to their fee pool weight. Today, use catalog stats to understand your audience.',
    cta: 'Explore Audius integration',
    href: '/audius',
  },
  {
    emoji: '🎖',
    title: 'Collectables — proof you built it',
    description:
      'Proof-of-contribution receipt NFTs — earned, never purchased. Every weekly distribution will mint an on-chain record: week, points, percentage, payout. ERC-1155, non-transferable, SVG on-chain. Launching alongside the first split distribution.',
    cta: 'See how collectables work',
    href: '/collectables',
  },
  {
    emoji: '💰',
    title: 'Fee splits — if and when you launch',
    description:
      'Configure what share of every trading fee flows to your community — by leaderboard points, NFT holdings, or any contribution metric. Creator-first by default. Weekly, on-chain, contributors claim their share.',
    cta: 'How it works',
    href: '/how-it-works',
  },
]

const GUARDRAILS = [
  'No auto-mint — tokenization is an explicit opt-in, later',
  'No "buy / moon / holders govern" — this is a monetization tool, not a security',
  'Transparent allocation + vesting when tokens ever launch',
  'ZAO-curated, not a permissionless farm',
]

export default async function HomePage() {
  const zoostrStats = await fetchZoostrStats()

  return (
    <main className="min-h-screen bg-zao-dark">
      {/* Nav */}
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/examples" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Examples
            </Link>
            <Link href="/launches" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Launches
            </Link>
            <Link href="/vetted" className="text-sm text-gold-400 hover:text-gold-300 transition-colors hidden sm:inline font-semibold">
              🏅 Get vetted
            </Link>
            <Link href="/back" className="btn-gold text-sm py-2 px-4">
              Back the work ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-8">
          ✦ No token required to get started
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-none tracking-tight">
          Start with a{' '}
          <span className="text-gradient-gold">spark</span>,<br />
          not a token.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Build your community, set your splits, and let fans back your work — all before any coin
          exists. If the energy is there, you can graduate to a token later. Some do immediately.
          Some never do. Both are fine.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/split-wizard" className="btn-gold">
            Set up your split →
          </Link>
          <Link href="/back" className="btn-outline">
            Back the work
          </Link>
        </div>
      </section>

      {/* The frame */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="card-dark p-6 sm:p-8 border-gold-500/20">
          <blockquote className="text-xl sm:text-2xl font-semibold text-white leading-relaxed">
            &ldquo;Back the album, not the coin.&rdquo;
          </blockquote>
          <p className="text-slate-400 mt-3">
            Wherever there is a coin, there is speculation. Sparkz leads with the work. Perks are
            what backers enjoy today — not promises. If a token ever comes, it is plumbing, never
            the pitch.
          </p>
        </div>
      </section>

      {/* First spark — live proof */}
      {zoostrStats && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="card-dark p-6 sm:p-8 border-gold-500/20">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                First spark — live now
              </span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🟡</span>
                  <h3 className="text-xl font-black text-white">
                    Zoostr{' '}
                    <span className="text-gold-400 text-base font-semibold">$ZOOSTR</span>
                  </h3>
                </div>
                <p className="text-sm text-slate-400 max-w-sm">
                  ZABAL × Boostr. 50% of every trading fee to the leaderboard by points.
                  Weekly · on-chain · claim at splits.org
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-black text-gold-400">
                    {zoostrStats.activeContributorsCount}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">active boosters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-gold-400">
                    {zoostrStats.totalLikesGenerated.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">total likes</div>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-zao-border flex flex-wrap items-center gap-4">
              <Link
                href="/launches/zoostr"
                className="text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                See live leaderboard + split config →
              </Link>
              <a
                href="https://zoostr.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                zoostr.xyz ↗
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Use cases */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-white mb-8">What you can do today</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="card-dark p-6 flex flex-col gap-3">
              <div className="text-3xl">{uc.emoji}</div>
              <h3 className="font-bold text-white text-lg">{uc.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{uc.description}</p>
              <Link
                href={uc.href}
                className="text-gold-400 text-sm font-semibold hover:text-gold-500 transition-colors"
              >
                {uc.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-recipient 0xSplits differentiator */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="card-dark p-6 sm:p-8">
          <h2 className="text-xl font-black text-white mb-2">
            The thing nobody else does: multi-recipient splits
          </h2>
          <p className="text-slate-400 mb-4 leading-relaxed">
            On Clanker, the fee recipient is a single address — frozen at deploy. Every other tool
            just puts the creator&rsquo;s wallet there. Sparkz puts a{' '}
            <strong className="text-white">0xSplits contract</strong> there instead. Inside Splits,
            recipients and weights are adjustable on any cadence without touching the token.
          </p>
          <p className="text-slate-400 leading-relaxed">
            That means: a collab track splits fees between both artists. A group crowdfund splits
            between all backers. Your leaderboard evolves week to week and your split evolves with
            it. On-chain, public, auditable — a light Nouns DAO with liquid tokens.
          </p>
          <p className="text-xs text-slate-600 mt-4">
            Single-recipient fee splits are everywhere. Multi-recipient, live, adjustable on-chain
            is Sparkz.
          </p>
        </div>
      </section>

      {/* Guardrails */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-lg font-black text-white mb-4">What Sparkz is NOT</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {GUARDRAILS.map((g) => (
            <li key={g} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
              {g}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-600 mt-6">
          Backed by ZAO. Not permissionless. Quality over speculation.{' '}
          <a
            href="https://github.com/bettercallzaal/sparkz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-400 underline"
          >
            Public one-pager ↗
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-zao-border bg-zao-card/40">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="font-black text-xl tracking-tight mb-3">
                <span className="text-gradient-gold">SPAR</span>
                <span className="text-white">KZ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Creator launches with transparent splits and no-token onboarding. Backed by ZAO.
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://warpcast.com/zaal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Farcaster ↗
                </a>
                <a
                  href="https://github.com/bettercallzaal/sparkz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Creator tools
              </div>
              <ul className="space-y-2">
                {[
                  { label: 'Advisor', href: '/advisor' },
                  { label: 'Split wizard', href: '/split-wizard' },
                  { label: 'Patronage tiers', href: '/tiers' },
                  { label: 'BYOK settings', href: '/settings' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Discovery
              </div>
              <ul className="space-y-2">
                {[
                  { label: 'Launches', href: '/launches' },
                  { label: 'Spark examples', href: '/examples' },
                  { label: 'Culture Circles', href: '/circles' },
                  { label: 'Audius integration', href: '/audius' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Learn
              </div>
              <ul className="space-y-2">
                {[
                  { label: 'How it works', href: '/how-it-works' },
                  { label: 'Spark lifecycle', href: '/lifecycle' },
                  { label: 'Collectables', href: '/collectables' },
                  { label: 'Get vetted', href: '/vetted' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-zao-border pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-700">
              Perks described here are what holders enjoy today — not guaranteed entitlements.
              Nothing on this site is financial advice or an offer of securities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span>See the first Sparkz launch:</span>
              <a
                href="https://zoostr.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-400 transition-colors"
              >
                zoostr.xyz ↗
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
