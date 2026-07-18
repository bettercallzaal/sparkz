import type { Metadata } from 'next'
import Link from 'next/link'
import AudiusConnect from '@/components/AudiusConnect'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Audius × Sparkz')}&sub=${encodeURIComponent('Your streams. Your split. Music-native fee distribution.')}`

export const metadata: Metadata = {
  title: 'Audius integration — Sparkz',
  description:
    'Connect your Audius catalog to Sparkz. See your stream stats today — plays, favorites, reposts. In v2, fan engagement maps directly to fee split weights for your community pool.',
  openGraph: {
    title: 'Audius × Sparkz',
    description: 'Your Audius streams wired to a 0xSplits contract. Music-native community fee distribution.',
    url: `${BASE_URL}/audius`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Audius × Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audius × Sparkz',
    description: 'Your streams. Your split. Music-native fee distribution.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🎵 Look up your catalog',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/audius`,
    'fc:frame:button:2': '⚡ Configure your split',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/advisor`,
  },
}

export default function AudiusPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">Audius integration</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-6">
            🎵 Audius × Sparkz
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Your Audius catalog,<br />
            wired to your split.
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Audius is where music-native creators already have an audience. Sparkz connects your
            stream data to your split config — today, see your catalog&rsquo;s engagement health;
            in v2, plays, favorites, and reposts map directly to fan fee-pool weights.
          </p>
        </div>

        {/* How it works */}
        <div className="card-dark p-6 mb-8 space-y-4">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            How it works
          </div>
          <div className="space-y-3">
            {[
              {
                step: '1',
                label: 'Connect your Audius handle',
                desc: 'Fetch your catalog stats — no login required for read-only access.',
              },
              {
                step: '2',
                label: 'See your engagement breakdown',
                desc: 'Top tracks by plays, total favorites and reposts. This is your community activity in aggregate.',
              },
              {
                step: '3',
                label: 'Map engagement to split weights (v2)',
                desc: 'When fan-level data is available via Audius SDK, each listener\'s plays + favorites + reposts maps to a weight in your community pool. Plays×1, favorites×3, reposts×5.',
              },
              {
                step: '4',
                label: 'Export splits-update.json',
                desc: 'Same format as the Boostr snapshot — paste into app.splits.org or call updateSplit() after human review.',
              },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="text-2xl font-black text-purple-500/40 flex-shrink-0 w-6 text-center">
                  {step}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-600 pt-2 border-t border-zao-border">
            Note: Audius public API returns creator-level aggregate stats. Individual fan scoring
            (who specifically played what) requires Audius SDK + user authentication — roadmap v2.
            Today: this shows your catalog health and seeds your split config with aggregate data.
          </div>
        </div>

        <AudiusConnect />

        {/* Engagement weight formula */}
        <div className="card-dark p-5 mt-8">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Engagement weight formula
          </div>
          <div className="font-mono text-sm text-gold-400 bg-zao-dark rounded-lg p-3 mb-3">
            score = plays × 1 + favorites × 3 + reposts × 5
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Reposts are weighted highest (5×) because they bring new listeners to the creator —
            highest leverage for empire growth. Favorites signal personal connection (3×). Plays
            are the baseline signal (1×). This weighting can be adjusted per creator in v2.
          </p>
        </div>

        {/* What this unlocks */}
        <div className="card-dark p-5 mt-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            What Audius integration unlocks for music creators
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">✓</span>
              Music-native on-ramp: Audius artists already have an audience there — no new platform to join
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">✓</span>
              Music-native split signal — in v2, the fans who play your music the most earn the most from your fee pool (fan-level scoring via Audius SDK)
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">✓</span>
              Multi-track collabs — both artists&rsquo; Audius catalogs contribute to a shared engagement metric
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 flex-shrink-0">✓</span>
              No crypto required for fans — Audius accounts (email/social login) are the identity layer
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
