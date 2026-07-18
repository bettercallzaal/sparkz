import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Culture Circles')}&sub=${encodeURIComponent('Sparks back other sparks. Pre-token. Mutual backing.')}`

export const metadata: Metadata = {
  title: 'Culture Circles — Sparkz',
  description:
    'Sparks back other sparks. A creator with a growing community boosts an established spark, earns from its fee pool, and builds proof-of-contribution before their own token exists. The network effect Sparkz was missing.',
  openGraph: {
    title: 'Culture Circles — Sparkz',
    description: 'Sparks back other sparks. Pre-token. Mutual backing graph. The network effect that was missing from creator coins.',
    url: `${BASE_URL}/circles`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Culture Circles — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Culture Circles — Sparkz',
    description: 'Sparks back other sparks. Pre-token. Mutual backing.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '◎ Back Zoostr now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://boostr.itscashless.com',
    'fc:frame:button:2': '🏅 Apply for a slot',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/vetted`,
  },
}

const HOW_IT_WORKS = [
  {
    step: '01',
    actor: 'Emerging creator',
    headline: 'Your community exists. Your token doesn\'t.',
    body: 'You\'re in Stage 2 (Emerging). 20 people follow everything you do. They boost your posts, buy your drops, show up in your replies. You don\'t have a token yet — and you shouldn\'t. But they need somewhere to put their energy.',
    color: 'border-slate-700',
    tag: 'No token',
    tagColor: 'text-slate-400 border-slate-700 bg-slate-800',
  },
  {
    step: '02',
    actor: 'Cross-community boost',
    headline: 'Your community boosts an Established spark.',
    body: 'Your fans start boosting Zoostr — an Established spark with a live leaderboard and weekly fee payouts. They appear on the Zoostr leaderboard. They earn from Zoostr\'s fee pool proportional to their contribution. Their fee share accumulates on-chain — they claim at splits.org — before your own token exists.',
    color: 'border-zao-violet/30',
    tag: 'Active now',
    tagColor: 'text-zao-violet border-zao-violet/30 bg-zao-violet/10',
  },
  {
    step: '03',
    actor: 'Proof builds',
    headline: 'Contribution receipts accumulate.',
    body: 'Every weekly Zoostr receipt names your top fans. Every DreamNet-style receipt cast is on-chain proof: "@fan1 — 342 pts — $47/week." By the time you launch YOUR token, your community already has a documented contribution history. Not followers. Not bag-holders. Verified contributors.',
    color: 'border-gold-500/20',
    tag: 'Proof of contribution',
    tagColor: 'text-gold-400 border-gold-500/20 bg-gold-500/5',
  },
  {
    step: '04',
    actor: 'Your launch',
    headline: 'You launch. Both communities cross-boost.',
    body: 'Your token goes live. Your community cross-boosts both sparks — yours and Zoostr\'s. Zoostr\'s contributors start boosting yours. The leaderboard bridges. Both fee pools grow. Each spark\'s community amplifies the other. No coin swap, no shared treasury — just mutual contribution.',
    color: 'border-green-500/20',
    tag: 'Network effect',
    tagColor: 'text-green-400 border-green-500/20 bg-green-500/5',
  },
]

const WHY_IT_MATTERS = [
  {
    title: 'Proof before launch',
    body: 'Your community has an on-chain contribution history BEFORE your token exists. When you launch, you\'re not starting from zero — you\'re presenting receipts.',
  },
  {
    title: 'Composable backing',
    body: 'A spark boosts other sparks the same way a fan boosts a creator. Creator-to-creator backing is natively possible — no escrow, no protocol change, no permission needed.',
  },
  {
    title: 'No synthetic relationships',
    body: 'This is not "whitelist me and I\'ll whitelist you." It\'s real contribution to another community\'s leaderboard, tracked and paid on-chain. Fake boosting doesn\'t earn.',
  },
  {
    title: 'The fee pool grows with the network',
    body: 'More contributors = more engagement = higher trading volume = larger weekly pool. Every Circle member is financially incentivized to grow the network — not extract from it.',
  },
]

export default function CirclesPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/lifecycle" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Lifecycle
            </Link>
            <Link href="/vetted" className="text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors">
              Apply for a slot →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zao-violet/10 border border-zao-violet/30 text-zao-violet text-xs font-semibold mb-6">
          ◎ Culture Circles
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Sparks back other sparks.
        </h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed text-lg">
          A creator with a growing community boosts an established spark. They earn from its fee
          pool. They build proof-of-contribution before their own token exists. When they launch,
          both communities cross-boost. The network effect compounds.
        </p>
        <p className="text-slate-500 mt-4 text-sm">
          This is the network Sparkz was missing. Not a coin swap — a mutual backing graph.
        </p>
      </section>

      {/* How it works — 4 steps */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wide">How it works</h2>
        <div className="relative">
          <div className="absolute left-[22px] top-8 bottom-8 w-px bg-zao-border hidden sm:block" />
          <div className="space-y-5">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="sm:pl-12 relative">
                <div className="absolute left-0 top-5 w-11 h-11 rounded-full bg-zao-card border border-zao-border flex items-center justify-center hidden sm:flex">
                  <span className="text-xs font-black text-slate-400">{step.step}</span>
                </div>
                <div className={`card-dark p-5 ${step.color}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                        {step.actor}
                      </div>
                      <h3 className="text-base font-bold text-white">{step.headline}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex-shrink-0 ${step.tagColor}`}>
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The graph */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="card-dark p-6 sm:p-8 border-zao-violet/20">
          <div className="text-xs font-bold text-zao-violet uppercase tracking-widest mb-5">
            The mutual backing graph
          </div>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gold-400 font-bold">Zoostr</span>
              <span className="text-slate-600">←boosts←</span>
              <span className="text-zao-violet">your community</span>
              <span className="text-slate-700 text-xs ml-auto hidden sm:inline">earns from Zoostr pool now</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold-400 font-bold">Zoostr</span>
              <span className="text-slate-600">→backs→</span>
              <span className="text-zao-violet">your launch</span>
              <span className="text-slate-700 text-xs ml-auto hidden sm:inline">cross-boosts at your launch</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zao-violet font-bold">Your spark</span>
              <span className="text-slate-600">←backs←</span>
              <span className="text-green-400">next spark</span>
              <span className="text-slate-700 text-xs ml-auto hidden sm:inline">the graph grows</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-5 border-t border-zao-border pt-4">
            No on-chain agreement. No shared treasury. No escrow. Each booster contributes to each
            leaderboard independently. The mutual backing is the graph of who showed up for whom.
          </p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wide">Why this matters</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {WHY_IT_MATTERS.map((item) => (
            <div key={item.title} className="card-dark p-5">
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's live now vs what's coming */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-dark p-6 border-green-500/20">
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">
              Available now
            </div>
            <ul className="space-y-2">
              {[
                'Boost Zoostr ($ZOOSTR) — the first active circle',
                'Appear on the Zoostr leaderboard by contribution points',
                'Earn from the Zoostr weekly fee pool — claim at splits.org (once token is live)',
                'DreamNet-style weekly receipts naming top contributors',
                'Proof-of-contribution history before your own launch',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-dark p-6 border-zao-border">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Coming — Stage 5
            </div>
            <ul className="space-y-2">
              {[
                'Circle directory — browse which sparks are backing which',
                'Cross-community contribution receipts (who backed what)',
                'Circle coordinator — manage multiple leaderboard memberships',
                'Lineage tracking — contribution chains across remixes and boosts',
                'Automatic circle formation when two sparks reach mutual backing threshold',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-slate-700 mt-0.5 flex-shrink-0">○</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="card-dark p-6 sm:p-8 border-gold-500/20 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Start the circle.</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            Apply for a ZAO vetting slot. Get your community metric reviewed, your split configured,
            and your launch prepped. When you launch, Zoostr&rsquo;s community becomes your first
            circle — and yours becomes theirs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vetted" className="btn-gold">
              Apply for a vetting slot →
            </Link>
            <a
              href="https://boostr.itscashless.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Boost Zoostr now ↗
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-5">
            50 launch slots per quarter. Backed by ZAO. Not permissionless — quality over
            speculation.
          </p>
        </div>
      </section>

      {/* Nav to related */}
      <section className="max-w-4xl mx-auto px-4 pb-16 border-t border-zao-border pt-8">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/lifecycle" className="text-slate-400 hover:text-gold-400 transition-colors">
            ← The spark lifecycle
          </Link>
          <Link href="/launches" className="text-slate-400 hover:text-gold-400 transition-colors">
            Active launches →
          </Link>
          <Link href="/how-it-works" className="text-slate-400 hover:text-gold-400 transition-colors">
            How the fee split works →
          </Link>
        </div>
      </section>
    </main>
  )
}
