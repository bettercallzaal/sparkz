'use client'

import Image from 'next/image'
import { useState } from 'react'

type AudiusUser = {
  id: string
  handle: string
  name: string
  profile_picture: { '150x150'?: string } | null
  follower_count: number
  track_count: number
  is_verified: boolean
  bio: string | null
}

type AudiusTrack = {
  id: string
  title: string
  play_count: number
  favorite_count: number
  repost_count: number
  permalink: string
  artwork: { '150x150'?: string } | null
}

type AudiusStats = {
  totalPlays: number
  totalFavorites: number
  totalReposts: number
  topTracks: AudiusTrack[]
}

type ApiResult = {
  user: AudiusUser
  stats: AudiusStats
  tracks: AudiusTrack[]
}

type State = 'idle' | 'loading' | 'loaded' | 'error'

function TrackRow({ track, rank }: { track: AudiusTrack; rank: number }) {
  const score = track.play_count * 1 + track.favorite_count * 3 + track.repost_count * 5
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zao-border/50 last:border-0">
      <div className="w-5 text-center text-xs text-slate-600 font-mono flex-shrink-0">{rank}</div>
      {track.artwork?.['150x150'] && (
        <Image
          src={track.artwork['150x150']}
          alt={track.title}
          width={32}
          height={32}
          className="rounded flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">{track.title}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {track.play_count.toLocaleString()} plays · {track.favorite_count.toLocaleString()} ❤ · {track.repost_count.toLocaleString()} ↻
        </div>
      </div>
      <div className="text-xs text-gold-400 font-bold tabular-nums flex-shrink-0">
        {score.toLocaleString()} pts
      </div>
    </div>
  )
}

export default function AudiusConnect() {
  const [handle, setHandle] = useState('')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')

  const lookup = async () => {
    const h = handle.trim().replace(/^@/, '')
    if (!h) return
    setState('loading')
    setError('')
    try {
      const res = await fetch(`/api/audius?handle=${encodeURIComponent(h)}`)
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const data: ApiResult = await res.json()
      setResult(data)
      setState('loaded')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }

  const totalScore =
    result
      ? result.stats.totalPlays * 1 +
        result.stats.totalFavorites * 3 +
        result.stats.totalReposts * 5
      : 0

  return (
    <div className="space-y-4">
      {/* Handle input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="@your-audius-handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          className="flex-1 bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
        />
        <button
          onClick={lookup}
          disabled={state === 'loading' || !handle.trim()}
          className="px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? '…' : 'Look up'}
        </button>
      </div>

      {state === 'error' && (
        <div className="text-sm text-red-400 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      {state === 'loaded' && result && (
        <div className="space-y-4">
          {/* User card */}
          <div className="card-dark p-5 flex items-center gap-4">
            {result.user.profile_picture?.['150x150'] && (
              <Image
                src={result.user.profile_picture['150x150']}
                alt={result.user.name}
                width={56}
                height={56}
                className="rounded-full flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-black text-white flex items-center gap-2">
                {result.user.name}
                {result.user.is_verified && <span className="text-purple-400 text-sm">✓</span>}
              </div>
              <div className="text-sm text-slate-500">@{result.user.handle}</div>
              <div className="text-xs text-slate-600 mt-1">
                {result.user.follower_count.toLocaleString()} followers ·{' '}
                {result.user.track_count} tracks
              </div>
            </div>
            <a
              href={`https://audius.co/${result.user.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 text-xs hover:text-purple-300 flex-shrink-0"
            >
              View on Audius ↗
            </a>
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total plays', value: result.stats.totalPlays.toLocaleString(), weight: '×1' },
              { label: 'Favorites', value: result.stats.totalFavorites.toLocaleString(), weight: '×3' },
              { label: 'Reposts', value: result.stats.totalReposts.toLocaleString(), weight: '×5' },
            ].map(({ label, value, weight }) => (
              <div key={label} className="card-dark p-3 text-center">
                <div className="text-lg font-black text-white">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                <div className="text-xs text-gold-400 font-mono mt-0.5">{weight}</div>
              </div>
            ))}
          </div>

          {/* Composite score */}
          <div className="card-dark p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Composite engagement score</div>
              <div className="text-xs text-slate-600 mt-0.5">plays×1 + favorites×3 + reposts×5</div>
            </div>
            <div className="text-2xl font-black text-gold-400 tabular-nums">
              {totalScore.toLocaleString()}
            </div>
          </div>

          {/* Top tracks */}
          {result.stats.topTracks.length > 0 && (
            <div className="card-dark p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Top tracks by plays
              </div>
              {result.stats.topTracks.map((track, i) => (
                <TrackRow key={track.id} track={track} rank={i + 1} />
              ))}
            </div>
          )}

          {/* V2 note */}
          <div className="card-dark p-5 border-purple-500/20">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              Individual fan scoring — v2 roadmap
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The aggregate stats above show your catalog health. In v2 (Audius SDK + user auth),
              individual listeners&rsquo; play/favorite/repost history maps directly to split
              weights — the fans who engage most with your music earn the most from your fee pool.
              This requires each fan to connect their Audius account once.
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Interested in the v2 fan scoring? Apply for a ZAO vetting slot — vetted launches
              get early access to v2 features.
            </p>
            <a href="/vetted" className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors mt-2 inline-block">
              Apply for early access →
            </a>
          </div>

          {/* Split config export placeholder */}
          <div className="card-dark p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Next: configure your split
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Use your Audius engagement data as the community metric in the split wizard.
              When v2 fan scoring is live, the snapshot script will pull from Audius instead of
              (or alongside) Boostr.
            </p>
            <a href="/split-wizard" className="btn-gold inline-block text-sm py-2 px-4">
              Open split wizard →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
