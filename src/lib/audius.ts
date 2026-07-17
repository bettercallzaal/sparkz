// Audius public API — no API key required for read-only access
// Discovery provider list: https://api.audius.co
// We use the hosted gateway for simplicity; in prod, rotate across discovery nodes

export const AUDIUS_BASE = 'https://discoveryprovider.audius.co'

export type AudiusUser = {
  id: string
  handle: string
  name: string
  profile_picture: { '150x150'?: string; '480x480'?: string } | null
  cover_photo: { '640x'?: string } | null
  follower_count: number
  following_count: number
  track_count: number
  is_verified: boolean
  bio: string | null
}

export type AudiusTrack = {
  id: string
  title: string
  play_count: number
  favorite_count: number
  repost_count: number
  duration: number
  permalink: string
  artwork: { '150x150'?: string; '480x480'?: string } | null
  created_at: string
}

export type AudiusEngagementScore = {
  userId: string
  handle: string
  // engagement metrics are per-track; we aggregate here
  totalPlays: number
  totalFavorites: number
  totalReposts: number
  // weighted composite score: plays×1 + favorites×3 + reposts×5
  score: number
  shareOfPool: string // percentage string, 2dp
}

// Fetch a user by handle — returns null on 404
export async function fetchAudiusUser(handle: string): Promise<AudiusUser | null> {
  const res = await fetch(
    `${AUDIUS_BASE}/v1/users?handle=${encodeURIComponent(handle)}&app_name=sparkz`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data?.[0] ?? null
}

// Fetch a user's top tracks (max 100)
export async function fetchAudiusTracks(userId: string, limit = 50): Promise<AudiusTrack[]> {
  const res = await fetch(
    `${AUDIUS_BASE}/v1/users/${userId}/tracks?limit=${limit}&sort_by=plays&app_name=sparkz`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

// Compute a single creator's aggregate engagement stats from their tracks
// This gives the basis for how listeners/supporters would be scored
// Note: Audius public API doesn't expose per-listener fan data (privacy),
// so this returns the aggregate creator metrics — individual fan scoring
// requires Audius SDK + user-auth or off-chain social graph data
export function aggregateCreatorStats(tracks: AudiusTrack[]): {
  totalPlays: number
  totalFavorites: number
  totalReposts: number
  topTracks: AudiusTrack[]
} {
  const totalPlays = tracks.reduce((s, t) => s + t.play_count, 0)
  const totalFavorites = tracks.reduce((s, t) => s + t.favorite_count, 0)
  const totalReposts = tracks.reduce((s, t) => s + t.repost_count, 0)
  const topTracks = [...tracks].sort((a, b) => b.play_count - a.play_count).slice(0, 5)
  return { totalPlays, totalFavorites, totalReposts, topTracks }
}

// Sparkz engagement weight formula for Audius-sourced data
// (Applied to follower/supporter list when available via Audius SDK)
export function audiusEngagementWeight(
  plays: number,
  favorites: number,
  reposts: number
): number {
  return plays * 1 + favorites * 3 + reposts * 5
}
