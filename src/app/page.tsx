import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sparkz — Start with a spark, not a token',
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
    emoji: '🎟',
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
    emoji: '💰',
    title: 'Fee splits — if and when you launch',
    description:
      'If you graduate to a token, 50% of every trading fee flows to your leaderboard by points. Weekly, automatic, on-chain. The coin is plumbing — the community is the pitch.',
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

export default function HomePage() {
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
            <Link href="/tiers" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Tiers
            </Link>
            <Link href="/split-wizard" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Split wizard
            </Link>
            <Link href="/vetted" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
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
            just puts the creator's wallet there. Sparkz puts a{' '}
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
    </main>
  )
}
