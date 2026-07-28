import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Sparkz Rewards')}&sub=${encodeURIComponent('Contribution → points → fee share. No governance.')}`

export const metadata: Metadata = {
  title: 'Rewards — Sparkz',
  description:
    'How Sparkz rewards work: contribute to a community, earn points, claim your share of trading fees. No governance, no voting — contribution is the only currency.',
  openGraph: {
    title: 'Sparkz Rewards — contribution is the only currency',
    description: 'Contribution → points → fee share. Transparent on-chain mechanics, no governance.',
    url: `${BASE_URL}/rewards`,
    siteName: 'Sparkz',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Sparkz Rewards' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkz Rewards',
    description: 'Contribution → points → fee share. No governance.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '⚡ How it works',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/rewards`,
    'fc:frame:button:2': '🔥 See a live launch',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/launches`,
  },
}

const BOOSTER_TIERS = [
  {
    id: 'spark',
    label: 'Spark',
    price: '$5/mo',
    multiplier: 1,
    desc: 'Base leaderboard entry. Points accumulate from day 1. No wallet required.',
    borderClass: 'border-slate-600/50 bg-slate-800/20',
    textClass: 'text-slate-300',
    btnClass: 'border-zao-border text-slate-400 hover:border-slate-500',
  },
  {
    id: 'booster',
    label: 'Booster',
    price: '$25/mo',
    multiplier: 5,
    desc: 'Boosted weight in the weekly split. 5× more fee-share per contribution point.',
    borderClass: 'border-gold-500/50 bg-gold-500/5 glow-gold',
    textClass: 'text-gold-400',
    btnClass: 'bg-gold-500/20 border-gold-500/40 text-gold-400 hover:bg-gold-500/30',
  },
  {
    id: 'patron',
    label: 'Patron',
    price: '$100/mo',
    multiplier: 20,
    desc: 'Maximum leaderboard weight. Direct ZAO access. Patron label on the leaderboard.',
    borderClass: 'border-zao-violet/50 bg-zao-violet/5',
    textClass: 'text-zao-violet',
    btnClass: 'border-zao-violet/40 text-zao-violet hover:bg-zao-violet/10',
  },
]

const HOW_IT_WORKS = [
  {
    n: '1',
    icon: '⚡',
    title: 'Contribute to a community',
    body: 'Like posts, engage with the creator\'s content, show up consistently. Every qualifying action earns points on the leaderboard.',
  },
  {
    n: '2',
    icon: '📊',
    title: 'Points → pool share',
    body: 'Your points ÷ total eligible points = your % of the weekly fee pool. Mechanical. Transparent. No voting required.',
  },
  {
    n: '3',
    icon: '🔄',
    title: 'Weekly snapshot',
    body: 'Every week, a human-approved snapshot computes new weights and updates the 0xSplits contract. ZOL drafts — creator approves.',
  },
  {
    n: '4',
    icon: '🏦',
    title: 'Claim at splits.org',
    body: 'Fees accumulate in the 0xSplits contract. Claim anytime — your share waits. No deadline, no lockup. Pull model.',
  },
]

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      {/* Nav */}
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/launches" className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:inline">
              See launches →
            </Link>
            <Link href="/back" className="btn-gold text-xs py-1.5 px-3">
              Back a project
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-zao-card border border-gold-500/30 rounded-full px-4 py-1.5 text-xs text-gold-400 mb-6 font-semibold">
          ⬡ Contribution is the only currency
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Sparkz Rewards
        </h1>

        <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed mb-6">
          Contribute to a creator&apos;s community. Earn points. Claim your share of every trading
          fee — weekly, on-chain, transparent. No governance. No voting. Contribution maps directly
          to reward.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/launches" className="btn-gold py-3 px-6 text-sm">
            See live rewards →
          </Link>
          <Link href="/back" className="py-3 px-6 rounded-xl border border-zao-border text-slate-300 hover:border-gold-500/50 hover:text-gold-400 transition-colors text-sm font-semibold">
            Back a project →
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-12">

        {/* How it works — 4-step */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.n} className="bg-zao-card border border-zao-border rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-xs font-black text-gold-400">
                    {item.n}
                  </div>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The math */}
        <section className="bg-zao-card border border-gold-500/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-white mb-2">The math — no black boxes</h2>
          <p className="text-slate-500 text-sm mb-6">
            Every number is public and verifiable on-chain. This is how your share is calculated.
          </p>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="font-mono text-sm">
                <div className="text-slate-500 mb-1">Weekly pool</div>
                <div className="bg-zao-dark rounded-xl px-4 py-3 text-gold-400 font-bold">
                  daily_volume × fee_tier × community_share × 7 days
                </div>
                <div className="text-xs text-slate-600 mt-1 px-4">
                  e.g. $10k/day × 1% × 50% × 7 = <strong className="text-white">$350/week</strong>
                </div>
              </div>

              <div className="font-mono text-sm">
                <div className="text-slate-500 mb-1">Your share</div>
                <div className="bg-zao-dark rounded-xl px-4 py-3 text-white">
                  (your_points / total_eligible_points) × weekly_pool
                </div>
                <div className="text-xs text-slate-600 mt-1 px-4">
                  e.g. 1,000 pts / 10,000 total = 10% → $35/week
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-slate-400">Typical Sparkz fee split (1% per trade)</div>
              {[
                { label: 'Community pool (you)', pct: 50, colorClass: 'from-gold-500 to-gold-400', note: 'allocated by points weekly — claim at splits.org' },
                { label: 'Creator & operations', pct: 25, colorClass: 'from-violet-600 to-violet-500', note: 'creator default; tunable at launch' },
                { label: 'Treasury', pct: 25, colorClass: 'from-slate-600 to-slate-500', note: 'future liquidity / governance' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{bar.label}</span>
                    <span className="text-white font-bold">{bar.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zao-border overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bar.colorClass} rounded-full`}
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{bar.note}</div>
                </div>
              ))}
              <p className="text-xs text-slate-600 pt-2">
                Exact split varies per launch — see each project&apos;s{' '}
                <Link href="/launches" className="text-slate-500 hover:text-slate-400 underline">launch page</Link>{' '}
                for the on-chain config.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zao-border flex flex-wrap gap-4 text-xs text-slate-500">
            <span>✓ 0xSplits contract — anyone can read the weights on-chain</span>
            <span>✓ Weekly snapshot updates weights; human approves before it goes live</span>
            <span>✓ Minimum point threshold per project (typically 10 pts)</span>
          </div>
        </section>

        {/* Booster tiers */}
        <section>
          <h2 className="text-2xl font-black text-white mb-2">Booster tiers</h2>
          <p className="text-slate-500 text-sm mb-6">
            Card-backed tiers multiply your leaderboard weight — no wallet or gas needed. Tier
            multipliers are applied before the pool share calculation.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {BOOSTER_TIERS.map((tier) => (
              <div key={tier.id} className={`border rounded-2xl p-5 flex flex-col gap-3 ${tier.borderClass}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-black ${tier.textClass}`}>{tier.label}</span>
                  <span className="text-xs text-slate-500">{tier.price}</span>
                </div>
                <div className={`text-3xl font-black ${tier.textClass}`}>
                  {tier.multiplier}×
                  <span className="text-sm font-normal text-slate-500 ml-1">weight</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>
                <Link
                  href="/back"
                  className={`mt-auto text-center text-xs font-bold py-2 rounded-lg border transition-colors ${tier.btnClass}`}
                >
                  Back as {tier.label} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Final split = (contribution_points × tier_multiplier) ÷ total_weighted_points. Tiers require no wallet — backed with a card through Stripe.
          </p>
        </section>

        {/* No governance */}
        <section className="bg-zao-card border border-zao-violet/20 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-zao-violet/15 border border-zao-violet/40 flex items-center justify-center text-lg shrink-0">
              ⬡
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">No governance. Contribution decides.</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Sparkz rewards are Zora-style: contribution maps directly to reward without governance
                votes, staking, or token-weighted control. You don&apos;t vote for your share — you
                earn it by showing up. The leaderboard is the governance layer: whoever contributes
                most gets the most. Transparent. Mechanical. On-chain.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                {[
                  { label: 'No vote to claim', icon: '✓' },
                  { label: 'No staking lockup', icon: '✓' },
                  { label: 'No token required to earn', icon: '✓' },
                  { label: 'Points = public Boostr data', icon: '✓' },
                  { label: 'Weights = on-chain 0xSplits', icon: '✓' },
                  { label: 'Human gate on every update', icon: '✓' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-slate-400">
                    <span className="text-zao-violet font-bold">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Collectables */}
        <section className="bg-zao-card border border-zao-border rounded-2xl p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-500 mb-4">
            v2 — launching with first split distribution
          </div>
          <h2 className="text-xl font-black text-white mb-2">Collectables — proof of contribution</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Every weekly snapshot mints an ERC-1155 receipt NFT for every eligible contributor.
            Not a badge you bought — a permanent on-chain record: week number, your points, your
            percentage, the project name. Non-transferable. On-chain SVG. 52 weeks of showing up =
            52 collectables.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
            <span>✓ ERC-1155 · Non-transferable</span>
            <span>✓ On-chain SVG — no IPFS dependency</span>
            <span>✓ Earned, never purchased</span>
            <span>✓ One per snapshot per recipient</span>
          </div>
          <Link href="/collectables" className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
            Collectable specs →
          </Link>
        </section>

        {/* ZOL human gate callout */}
        <section className="border border-zao-border rounded-2xl p-6">
          <h2 className="text-lg font-black text-white mb-2">ZOL drafts. Humans decide.</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every weekly snapshot is drafted by ZOL (the Sparkz AI agent) and approved by a
            human before the 0xSplits weights update on-chain. No module posts, signs, or spends
            autonomously. The human gate is non-negotiable in v1. The receipt, the cast, the
            split update — all human-approved before anything changes.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-black text-white mb-3">Start earning on a live launch</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto">
            Contribute to a Sparkz community today. 10+ points puts you in the weekly split.
            Claim your share at splits.org — it waits, no deadline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/launches" className="btn-gold py-3 px-8">
              Browse launches →
            </Link>
            <Link href="/back" className="py-3 px-8 rounded-xl border border-zao-border text-slate-300 hover:border-gold-500/50 hover:text-gold-400 transition-colors text-sm font-semibold">
              Back with a card →
            </Link>
            <Link href="/collectables" className="py-3 px-8 rounded-xl border border-zao-border text-slate-300 hover:border-zao-violet/50 hover:text-zao-violet transition-colors text-sm font-semibold">
              Collectables →
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-zao-border">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            Reward projections are illustrative · Not financial advice · Perks = what contributors enjoy today.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/how-it-works" className="text-slate-500 hover:text-slate-400 transition-colors">How it works →</Link>
            <Link href="/collectables" className="text-slate-500 hover:text-slate-400 transition-colors">Collectables →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
