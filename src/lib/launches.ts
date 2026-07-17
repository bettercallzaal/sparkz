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
  tokenUrl?: string
  communityUrl?: string
  communityPool: number
  zaoVetted: boolean
  quarter: string
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
    communityUrl: 'https://boostr.itscashless.com',
    communityPool: 50,
    zaoVetted: true,
    quarter: 'Q3 2026',
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
