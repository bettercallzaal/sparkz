import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LAUNCHES, getLaunchBySlug, STATUS_LABELS, TYPE_LABELS } from '@/lib/launches'

export const revalidate = 60

export function generateStaticParams() {
  return LAUNCHES.map((l) => ({ slug: l.slug }))
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const launch = getLaunchBySlug(slug)
  if (!launch) return {}
  const title = `${launch.name}${launch.ticker ? ` ($${launch.ticker})` : ''} — Sparkz launches`
  const ogTitle = encodeURIComponent(`${launch.emoji} ${launch.name}${launch.ticker ? ` · $${launch.ticker}` : ''}`)
  const ogSub = encodeURIComponent(launch.tagline)
  const ogUrl = `${BASE_URL}/api/og?title=${ogTitle}&sub=${ogSub}`
  const pageUrl = `${BASE_URL}/launches/${slug}`
  return {
    title,
    description: launch.description,
    openGraph: {
      title,
      description: launch.tagline,
      url: pageUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: launch.tagline,
      images: [ogUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': ogUrl,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': launch.siteUrl ? `${launch.emoji} Visit ${launch.name}` : `📊 See leaderboard`,
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': launch.siteUrl ?? pageUrl,
      'fc:frame:button:2': '⚡ Launch like this',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': `${BASE_URL}/advisor`,
    },
  }
}

type BoostrStats = {
  activeContributorsCount: number
  allTimeContributorsCount: number
  totalLikesGenerated: number
  totalCastsLiked: number
  topContributors: { username: string; zabalLikesCount: number; followers_count: number; pfp_url: string }[]
}

async function fetchBoostrStats(url: string): Promise<BoostrStats | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const raw = await res.json()
    if (!raw.success || !raw.stats) return null
    const s = raw.stats
    const sorted = [...(s.zabalUsers ?? [])].sort(
      (a: { zabalLikesCount: number; followers_count: number }, b: { zabalLikesCount: number; followers_count: number }) =>
        b.zabalLikesCount - a.zabalLikesCount || b.followers_count - a.followers_count
    )
    return {
      activeContributorsCount: s.activeContributorsCount ?? 0,
      allTimeContributorsCount: s.allTimeContributorsCount ?? 0,
      totalLikesGenerated: s.totalLikesGenerated ?? 0,
      totalCastsLiked: s.totalCastsLiked ?? 0,
      topContributors: sorted.slice(0, 5),
    }
  } catch {
    return null
  }
}

const WEEKLY_VOLUME = 10_000
const FEE_TIER = 0.01
const DAYS = 7

function formatUsd(n: number): string {
  if (n < 0.01) return '<$0.01'
  if (n < 10_000) return `$${n.toFixed(2)}`
  return `$${(n / 1_000).toFixed(1)}k`
}

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const launch = getLaunchBySlug(slug)
  if (!launch) notFound()

  const stats = launch.boostrStatsUrl ? await fetchBoostrStats(launch.boostrStatsUrl) : null
  const totalPts = stats?.topContributors.reduce((s, c) => s + c.zabalLikesCount, 0) ?? 0
  const weeklyPool = WEEKLY_VOLUME * FEE_TIER * (launch.splitConfig.communityPool / 100) * DAYS

  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <Link href="/launches" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← All launches
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-12 pb-24 space-y-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-5xl">{launch.emoji}</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  {launch.name}
                  {launch.ticker && (
                    <span className="text-gold-400 ml-2 text-2xl">${launch.ticker}</span>
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-400">{STATUS_LABELS[launch.status]}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-500">{TYPE_LABELS[launch.type]}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-500">{launch.quarter}</span>
                  {launch.zaoVetted && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold">
                        🏅 Vetted
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">{launch.description}</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {launch.siteUrl && (
              <a
                href={launch.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-sm py-2 px-5 inline-block text-center"
              >
                Visit site ↗
              </a>
            )}
            {launch.receiptUrl && (
              <a
                href={launch.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm py-2 px-5 rounded-lg border border-zao-border text-slate-400 hover:text-gold-400 hover:border-gold-500/30 transition-colors text-center block"
              >
                📊 Weekly receipt ↗
              </a>
            )}
          </div>
        </div>

        {/* Live empire stats (Boostr launches) */}
        {stats && (
          <div className="card-dark p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <div className="text-xs font-bold text-green-400 uppercase tracking-widest">Live empire stats</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">
              {[
                { label: 'active boosters', value: stats.activeContributorsCount },
                { label: 'all-time boosters', value: stats.allTimeContributorsCount },
                { label: 'total likes', value: stats.totalLikesGenerated.toLocaleString() },
                { label: 'casts liked', value: stats.totalCastsLiked.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-gold-400">{value}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            {/* Top 5 contributors */}
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Top boosters this week
            </div>
            <div className="space-y-2">
              {stats.topContributors.map((c, i) => {
                const pct = totalPts > 0 ? (c.zabalLikesCount / totalPts) * 100 : 0
                const earned = (pct / 100) * weeklyPool
                return (
                  <div key={c.username} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-4 text-right tabular-nums flex-shrink-0">{i + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.username}`}
                      alt={c.username}
                      width={24}
                      height={24}
                      className="rounded-full flex-shrink-0"
                    />
                    <a
                      href={`https://warpcast.com/${c.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white hover:text-gold-400 transition-colors font-medium"
                    >
                      @{c.username}
                    </a>
                    <span className="text-slate-500 tabular-nums text-xs hidden sm:inline">
                      {c.zabalLikesCount} pts
                    </span>
                    <span className="text-slate-400 tabular-nums w-12 text-right text-xs">{pct.toFixed(1)}%</span>
                    <span className="text-gold-400 font-bold tabular-nums w-14 text-right text-xs">
                      {formatUsd(earned)}/wk
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-zao-border text-xs text-slate-600">
              Earnings at ${(WEEKLY_VOLUME / 1000).toFixed(0)}k/day assumed volume ·{' '}
              {launch.leaderboardUrl && (
                <a href={launch.leaderboardUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-gold-400 transition-colors">
                  full leaderboard + calculator ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Split config */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card-dark p-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Fee split (of 1% trading fee)
            </div>
            <div className="space-y-3">
              {[
                { label: 'Community pool', pct: launch.splitConfig.communityPool, note: 'weekly by contribution', color: 'bg-gold-400' },
                { label: 'Creator pool', pct: launch.splitConfig.creatorPool, note: 'creator operations', color: 'bg-zao-violet' },
                { label: 'Treasury', pct: launch.splitConfig.treasury, note: 'community-governed', color: 'bg-slate-500' },
              ].map(({ label, pct, note, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 bg-zao-dark rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{note}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-zao-border text-xs text-slate-500">
              ZAO stake: {launch.splitConfig.zaoStake}% of token supply · locked 12 months
            </div>
          </div>

          <div className="card-dark p-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Technical setup
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-slate-600 w-24 flex-shrink-0">Fee model</span>
                <span className="text-slate-300">{launch.feeModel}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 w-24 flex-shrink-0">Fee recipient</span>
                <span className="text-slate-300">0xSplits contract — adjustable weekly</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 w-24 flex-shrink-0">Community metric</span>
                <span className="text-slate-300">
                  {launch.type === 'leaderboard' ? 'Boostr leaderboard points' :
                   launch.type === 'pfp' ? 'NFT holdings' :
                   launch.type === 'dao' ? 'Staked tokens' :
                   'Contribution-based'}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 w-24 flex-shrink-0">Distribution</span>
                <span className="text-slate-300">Weekly snapshot → updateSplit()</span>
              </div>
              {launch.communityUrl && (
                <div className="flex gap-3">
                  <span className="text-slate-600 w-24 flex-shrink-0">Community</span>
                  <a
                    href={launch.communityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    {launch.communityUrl.replace('https://', '')} ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pool projection */}
        <div className="card-dark p-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Weekly pool projection at ${(WEEKLY_VOLUME / 1000).toFixed(0)}k/day volume
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <div className="text-3xl font-black text-white">{formatUsd(weeklyPool)}</div>
              <div className="text-xs text-slate-600 mt-1">community pool / week</div>
            </div>
            <div>
              <div className="text-3xl font-black text-zao-violet">
                {formatUsd(WEEKLY_VOLUME * FEE_TIER * (launch.splitConfig.creatorPool / 100) * DAYS)}
              </div>
              <div className="text-xs text-slate-600 mt-1">creator pool / week</div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-400">
                {formatUsd(WEEKLY_VOLUME * FEE_TIER * (launch.splitConfig.treasury / 100) * DAYS)}
              </div>
              <div className="text-xs text-slate-600 mt-1">treasury / week</div>
            </div>
          </div>
          <p className="text-xs text-slate-700 mt-4">
            Projections at assumed daily volume. Actual earnings depend on market activity. Not financial advice.
          </p>
        </div>

        {/* Claim + back CTAs */}
        <div className="grid sm:grid-cols-2 gap-4">
          {launch.leaderboardUrl && (
            <a
              href={launch.leaderboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-dark p-5 hover:border-gold-500/30 transition-colors block"
            >
              <div className="text-lg font-bold text-white mb-1">📊 View live leaderboard</div>
              <p className="text-sm text-slate-400">See all boosters, your earnings share, and the full earnings calculator.</p>
            </a>
          )}
          {launch.receiptUrl && (
            <a
              href={launch.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-dark p-5 hover:border-gold-500/30 transition-colors block"
            >
              <div className="text-lg font-bold text-white mb-1">📜 Weekly receipt</div>
              <p className="text-sm text-slate-400">This week&rsquo;s distribution breakdown — shareable as a Farcaster Frame.</p>
            </a>
          )}
        </div>

        {/* How to get involved */}
        <div className="card-dark p-6 border-gold-500/20 text-center">
          <p className="text-xl font-black text-gold-400 mb-2">Back the empire. 🟡</p>
          <p className="text-slate-400 text-sm mb-5 max-w-lg mx-auto">
            Boost {launch.name === 'Zoostr' ? 'ZABAL' : launch.name} on the community platform.
            Earn points. Collect your share of every trading fee — forever.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {launch.communityUrl && (
              <a
                href={launch.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-sm py-2 px-5 inline-block"
              >
                Start boosting ↗
              </a>
            )}
            <Link href="/back" className="btn-outline text-sm py-2 px-5">
              Back with a card
            </Link>
          </div>
        </div>

        {/* Sparkz CTA */}
        <div className="text-center py-4 border-t border-zao-border">
          <p className="text-sm text-slate-500">
            This launch runs on{' '}
            <Link href="/" className="text-gold-400 hover:text-gold-300 transition-colors font-semibold">
              Sparkz
            </Link>{' '}
            · Want to launch yours?{' '}
            <Link href="/advisor" className="text-gold-400 hover:text-gold-300 transition-colors font-semibold">
              Start with the advisor →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
