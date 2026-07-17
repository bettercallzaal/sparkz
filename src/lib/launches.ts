export type LaunchStatus = 'live' | 'building' | 'vetted' | 'upcoming'

export type Launch = {
  slug: string
  name: string
  ticker?: string
  emoji: string
  tagline: string
  description: string
  type: 'leaderboard' | 'collab' | 'crowdfund' | 'pfp' | 'dao'
  status: LaunchStatus
  siteUrl?: string
  receiptUrl?: string
  leaderboardUrl?: string
  tokenUrl?: string
  communityUrl?: string
  communityPool: number
  zaoVetted: boolean
  quarter: string
  boostrStatsUrl?: string
  splitConfig: { communityPool: number; creatorPool: number; treasury: number; zaoStake: number }
  feeModel: string
}

export const LAUNCHES: Launch[] = [
  {
    slug: 'zoostr',
    name: 'Zoostr',
    ticker: 'ZOOSTR',
    emoji: '🟡',
    tagline: 'ZABAL × Boostr. Back the empire.',
    description:
      '34 boosters built the ZABAL empire on Boostr before any token existed. $ZOOSTR is what the empire pays back with — 50% of every trading fee to the leaderboard by points, weekly.',
    type: 'leaderboard',
    status: 'live',
    siteUrl: 'https://zoostr.xyz',
    receiptUrl: 'https://zoostr.xyz/receipt',
    leaderboardUrl: 'https://zoostr.xyz/leaderboard',
    communityUrl: 'https://boostr.itscashless.com',
    boostrStatsUrl: 'https://boostr.itscashless.com/api/zabaal/stats',
    communityPool: 50,
    zaoVetted: true,
    quarter: 'Q3 2026',
    splitConfig: { communityPool: 50, creatorPool: 25, treasury: 25, zaoStake: 5 },
    feeModel: 'Clanker v4 · 1% fee tier · 0xSplits as fee recipient',
  },
]

export function getLaunchBySlug(slug: string): Launch | undefined {
  return LAUNCHES.find((l) => l.slug === slug)
}

export const STATUS_LABELS: Record<LaunchStatus, string> = {
  live: '🟢 Live',
  building: '🔨 Building',
  vetted: '🏅 Vetted',
  upcoming: '⏳ Upcoming',
}

export const TYPE_LABELS: Record<Launch['type'], string> = {
  leaderboard: 'Leaderboard',
  collab: 'Collab',
  crowdfund: 'Crowdfund',
  pfp: 'PFP / NFT',
  dao: 'DAO',
}
