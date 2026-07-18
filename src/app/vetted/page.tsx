import type { Metadata } from 'next'
import Link from 'next/link'
import VettingApplication from '@/components/VettingApplication'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Vetted by ZAO')}&sub=${encodeURIComponent('1 of 50 launch slots per quarter.')}`

export const metadata: Metadata = {
  title: 'Vetted by ZAO — Sparkz',
  description:
    'ZAO backs a small number of creators per quarter — 1 of 50 slots. Vetted launches get the ZAO badge, scarce drop prestige, and ZOL marketing support end to end.',
  openGraph: {
    title: 'Vetted by ZAO — Sparkz',
    description: '50 launch slots per quarter. ZAO reviews, backs, and stands behind each one.',
    url: `${BASE_URL}/vetted`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Vetted by ZAO — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vetted by ZAO — Sparkz',
    description: '50 launch slots per quarter. ZAO reviews, backs, and stands behind each one.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🏅 Apply for a slot',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/vetted`,
    'fc:frame:button:2': '⚡ Try the advisor first',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/advisor`,
  },
}

const WHAT_YOU_GET = [
  {
    icon: '🏅',
    title: '"Vetted by ZAO" badge',
    description:
      'Shows on your fan page, your token, and your Farcaster profile. Signals: ZAO reviewed this, backed it, and stands behind the quality.',
  },
  {
    icon: '🔒',
    title: 'Scarce slot (1 of 50/quarter)',
    description:
      'ZAO limits to 50 launches per quarter. Scarcity is real. If you get a slot, it means something — and your community knows it.',
  },
  {
    icon: '⚡',
    title: 'ZOL marketing support',
    description:
      "ZOL (ZAO’s AI agent) drafts your full launch: 5-cast Farcaster thread, X thread, deploy config, weekly receipts. You review and approve everything before it goes anywhere.",
  },
  {
    icon: '💰',
    title: 'Aligned ZAO stake',
    description:
      "ZAO takes a small locked token allocation (not a fee cut). ZAO holds for 12 months. If you win, ZAO wins. That's the alignment model.",
  },
  {
    icon: '🛠',
    title: 'Full Sparkz stack',
    description:
      'The 0xSplits contract, the split wizard, the weekly snapshot, the leaderboard, the receipts — all set up and ready before you launch. One human click to deploy.',
  },
]

const WHAT_ZAO_LOOKS_FOR = [
  'An existing community with real engagement (leaderboard, NFT collection, Discord activity, Boostr points)',
  'A clear plan for what backers enjoy today — not promises about future value',
  'A creator who understands that the token (if any) is plumbing, not the pitch',
  'Willingness to have the split config, fee breakdown, and ZAO stake publicly disclosed',
  'A project where multi-recipient splits actually make sense (collab, crowdfund, or community-backed)',
]

const EXAMPLES = [
  {
    name: 'Zoostr ($ZOOSTR)',
    description: 'ZABAL × Boostr. 34 boosters built the empire before any token existed. The token pays them back — 50% of every trade fee to the leaderboard by points, weekly.',
    href: 'https://zoostr.xyz',
  },
]

export default function VettedPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">Vetted by ZAO</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-bold mb-8">
          🏅 Vetted by ZAO
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
          Not every launch<br />gets a slot.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ZAO backs 50 launches per quarter. That&rsquo;s it. If you get a slot, it means ZAO reviewed
          your community, your split, and your framing — and stood behind it publicly.
        </p>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-white mb-6">What a vetted launch gets</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.title} className="card-dark p-5 flex gap-4">
              <div className="text-3xl flex-shrink-0">{item.icon}</div>
              <div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What ZAO looks for */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="card-dark p-6 sm:p-8">
          <h2 className="text-xl font-black text-white mb-5">What ZAO looks for</h2>
          <ul className="space-y-3">
            {WHAT_ZAO_LOOKS_FOR.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 rounded-lg bg-zao-dark border border-zao-border">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-300">What ZAO does NOT look for:</strong> Token hype,
              follower counts without engagement, &ldquo;gonna be huge&rdquo; pitches, anything that requires
              speculation language. If your pitch is &ldquo;my coin will moon&rdquo; — not a fit. If it&rsquo;s
              &ldquo;my community showed up for me and deserves a fair stake&rdquo; — tell us more.
            </p>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-black text-white mb-4">ZAO-backed launches</h2>
        <div className="space-y-3">
          {EXAMPLES.map((ex) => (
            <a
              key={ex.name}
              href={ex.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-dark p-5 flex items-center gap-4 hover:border-gold-500/30 transition-colors block"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold flex-shrink-0">
                🏅 Vetted
              </div>
              <div>
                <div className="font-bold text-white">{ex.name}</div>
                <div className="text-sm text-slate-400">{ex.description}</div>
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          50 slots per quarter. 1 confirmed (Zoostr). Applying below puts you in the queue for Q3 2026.
        </p>
      </section>

      {/* Application */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white mb-2">Apply for a slot</h2>
          <p className="text-slate-400 text-sm">
            This is not an automated approval. ZAO reviews every application. Expect a response
            within 48 hours — if it&rsquo;s a fit, ZOL will reach out to start the config process.
          </p>
        </div>
        <VettingApplication />
      </section>
    </main>
  )
}
