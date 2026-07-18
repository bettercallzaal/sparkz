import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Collectables')}&sub=${encodeURIComponent('Proof of contribution. Earned, not purchased.')}`

export const metadata: Metadata = {
  title: 'Collectables — Sparkz',
  description:
    'Proof-of-contribution receipt NFTs, earned from boosting — not purchased. Every weekly distribution mints an on-chain record of your share.',
  openGraph: {
    title: 'Collectables — Sparkz',
    description: 'Proof-of-contribution receipt NFTs. Earned from boosting, not purchased. On-chain record of your share.',
    url: `${BASE_URL}/collectables`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Collectables — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collectables — Sparkz',
    description: 'Proof of contribution. Earned, not purchased.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🏆 See the Zoostr leaderboard',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/launches/zoostr`,
    'fc:frame:button:2': '🏅 Apply for a slot',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/vetted`,
  },
}

const STEPS = [
  {
    n: '1',
    label: 'You boost the community',
    desc: "Boost posts, engage with the creator's work, show up consistently. The snapshot script tracks your points.",
  },
  {
    n: '2',
    label: 'Weekly snapshot runs',
    desc: 'Every Monday, ZOL computes who earned what — point weights, fee shares, wallet addresses. Human reviews and approves.',
  },
  {
    n: '3',
    label: 'Fees hit the splits contract',
    desc: 'Trading fees accumulate in the 0xSplits contract, allocated by the weights from step 2. Recipients claim their share at splits.org — no deadline, no lockup.',
  },
  {
    n: '4',
    label: 'A collectable is minted for you',
    desc: 'An ERC-1155 receipt NFT is minted — one per distribution per recipient. The SVG is generated on-chain: week number, your points, your percentage, the project name.',
  },
  {
    n: '5',
    label: 'You own the proof',
    desc: "It's in your wallet. Non-transferable. It says: “This contributor showed up. Here's the math. Here's their share.” Not a badge you bought — a record of what you built.",
  },
]

const WHAT_IS_ON_IT = [
  { field: 'Project', example: 'ZOOSTR' },
  { field: 'Week', example: 'Week 14 · 2026' },
  { field: 'Contributor', example: '@username' },
  { field: 'Points', example: '342 pts (8.4% of eligible pool)' },
  { field: 'Distribution', example: '0.00042 ETH from trading fees' },
  { field: 'Contract', example: '0xSplits: 0xabc…def' },
]

const WHY_NOT_PURCHASABLE = [
  'You cannot buy these. There is no mint price. They cannot be listed for sale.',
  'The collectable exists because you showed up — that is the only issuance condition.',
  'This is the opposite of Zora auto-minting a post into a coin. Nothing auto-mints here. Distribution is weekly, reviewed, human-approved.',
  'Collectables can stack. A contributor who shows up for 52 weeks holds 52 receipts — a timeline of participation, not a balance sheet.',
]

export default function CollectablesPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">Collectables</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24 space-y-12">

        {/* Hero */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-6">
            ✦ Earned, never purchased
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Proof you built the empire.
          </h1>
          <p className="text-slate-400 leading-relaxed text-lg">
            Every weekly fee distribution mints an on-chain receipt for every contributor who
            earned a share. Not a badge you bought. Not a token you traded. A permanent record of
            your contribution — week, points, percentage, payout.
          </p>
        </div>

        {/* Mock collectable card */}
        <div className="flex justify-center">
          <CollectableMock />
        </div>

        {/* How you earn one */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white">How you earn one</h2>
          <div className="space-y-3">
            {STEPS.map(({ n, label, desc }) => (
              <div key={n} className="card-dark p-5 flex gap-5">
                <div className="text-3xl font-black text-gold-500/30 flex-shrink-0 w-8 text-right">
                  {n}
                </div>
                <div>
                  <div className="font-bold text-white mb-1">{label}</div>
                  <div className="text-sm text-slate-400 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's on it */}
        <div className="card-dark p-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            What the collectable encodes
          </h2>
          <div className="space-y-2">
            {WHAT_IS_ON_IT.map(({ field, example }) => (
              <div key={field} className="flex items-start gap-4 text-sm py-2 border-b border-zao-border/50 last:border-0">
                <div className="w-28 text-slate-500 flex-shrink-0">{field}</div>
                <div className="text-white font-mono">{example}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">
            SVG generated on-chain at mint time. Metadata stored in the token URI. Immutable after
            mint — it is a historical record, not an updatable badge.
          </p>
        </div>

        {/* Why not purchasable */}
        <div className="space-y-3">
          <h2 className="text-xl font-black text-white">Why you can&rsquo;t buy these</h2>
          <div className="space-y-3">
            {WHY_NOT_PURCHASABLE.map((text) => (
              <div key={text} className="flex gap-3 text-sm text-slate-400">
                <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical spec */}
        <div className="card-dark p-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Technical spec
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['Standard', 'ERC-1155 (multi-token — one type per weekly distribution)'],
              ['Network', 'Base'],
              ['Metadata', 'On-chain SVG in tokenURI — no IPFS dependency'],
              ['Transferability', 'Non-transferable (soulbound) — receipt, not an asset'],
              ['Minting', 'Minted by the Sparkz distribution contract at updateSplit() call'],
              ['Volume', 'One per contributor per weekly distribution'],
              ['Governance', 'None — explicitly no governance rights attached'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 border-b border-zao-border/50 pb-2 last:border-0 last:pb-0">
                <div className="w-32 text-slate-500 flex-shrink-0 text-xs pt-0.5">{label}</div>
                <div className="text-slate-300 text-xs leading-relaxed">{value}</div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-zao-border">
            <p className="text-xs text-slate-600">
              Smart contract deploy is human-gated — Zaal deploys. The ZOL loop generates the
              distribution payloads; a human reviews + executes on-chain. Collectables are issued
              alongside the weekly split update (v2, after token launch).
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="card-dark p-6 border-gold-500/20">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-2">
            Status: v2 roadmap
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Collectables launch alongside the fee distribution contract — after the token is live
            and the first split runs. Today, you can set up your splits, configure your tiers, and
            get your community moving. Collectables are the proof layer on top.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Vetted launches get first access to the collectable minting infrastructure — one of the
            perks of a ZAO-backed slot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/how-it-works" className="btn-gold text-sm py-2 px-4">
              How the split works →
            </Link>
            <Link href="/vetted" className="btn-outline text-sm py-2 px-4">
              Apply for early access
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function CollectableMock() {
  return (
    <div
      style={{
        width: 280,
        background: '#0a0a14',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 12,
        padding: 20,
        fontFamily: 'monospace',
        boxShadow: '0 0 40px rgba(245,158,11,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            Sparkz Collectable
          </div>
          <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 900, marginTop: 2, letterSpacing: -0.5 }}>
            ZOOSTR
          </div>
        </div>
        <div style={{ color: '#7c3aed', fontSize: 22 }}>⬡</div>
      </div>

      {/* Week */}
      <div style={{ color: '#64748b', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        Week 01 · 2026
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(245,158,11,0.15)', marginBottom: 12 }} />

      {/* Contributor */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#475569', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Contributor</div>
        <div style={{ color: '#ffffff', fontSize: 13, marginTop: 2 }}>@username</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ color: '#475569', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Points</div>
          <div style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700, marginTop: 2 }}>342</div>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Share</div>
          <div style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700, marginTop: 2 }}>8.4%</div>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Earned</div>
          <div style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700, marginTop: 2 }}>0.0004Ξ</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', marginBottom: 10 }} />

      {/* Footer */}
      <div style={{ color: '#1e293b', fontSize: 9, letterSpacing: 0.5, lineHeight: 1.4 }}>
        ERC-1155 · NON-TRANSFERABLE
        <br />
        BASE · 0xSPLITS
        <br />
        EARNED · NEVER PURCHASED
      </div>
    </div>
  )
}
