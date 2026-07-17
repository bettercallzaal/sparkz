import { NextResponse } from 'next/server'
import { fetchAudiusUser, fetchAudiusTracks, aggregateCreatorStats } from '@/lib/audius'

// Server-side proxy for Audius API — avoids CORS issues client-side
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')?.replace(/^@/, '')

  if (!handle) {
    return NextResponse.json({ error: 'handle param required' }, { status: 400 })
  }

  try {
    const user = await fetchAudiusUser(handle)
    if (!user) {
      return NextResponse.json({ error: `Audius user @${handle} not found` }, { status: 404 })
    }

    const tracks = await fetchAudiusTracks(user.id)
    const stats = aggregateCreatorStats(tracks)

    return NextResponse.json(
      {
        user,
        stats,
        tracks: tracks.slice(0, 20),
        _note:
          'Individual fan engagement data requires Audius SDK + user auth. These are creator-level aggregate stats. Fan-level scoring is roadmap for v2.',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audius API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
