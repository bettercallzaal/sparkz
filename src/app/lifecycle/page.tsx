import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The spark lifecycle — Sparkz',
  description:
    'Five stages from first idea to federated network. Start tokenless. Build real community. Tokenize when momentum is proven — not before.',
}

const STAGES = [
  {
    num: '01',
    name: 'Proposed',
    status: 'tokenless',
    headline: 'Apply for a slot.',
    description:
      'Your community exists in some form — Farcaster followers, Discord members, a boost leaderboard. You pitch ZAO: who is the community, what is the engagement metric, what does the split look like. 50 slots per quarter.',
    available: [
      'Submit a vetting application',
      'Get ZAO feedback on your community metric',
      'Draft your split config in the advisor',
    ],
    notYet: ['No token', 'No split contract', 'No live payouts'],
    cta: { label: 'Apply for a slot', href: '/vetted' },
    color: 'border-slate-700',
    tag: 'No token yet',
    tagColor: 'text-slate-500 bg-slate-800 border-slate-700',
  },
  {
    num: '02',
    name: 'Emerging',
    status: 'tokenless',
    headline: 'Build the community before the token.',
    description:
      'ZAO accepts the slot. The community is active and measurable. Contributors know they\'re on the leaderboard. Fans back you via card — no wallet, no gas. Projected earnings are published. The token comes later.',
    available: [
      'Live leaderboard (auto-updating)',
      'Patronage tiers via card ($5/$25/$100)',
      'Projected earnings per contributor',
      'Split config finalized and exported',
      'ZOL drafts your full launch thread',
    ],
    notYet: ['No token', 'No on-chain split', 'No live fee payouts (projected only)'],
    cta: { label: 'Set up your tiers', href: '/tiers' },
    color: 'border-zao-border',
    tag: 'Tokenless',
    tagColor: 'text-slate-400 bg-zao-card border-zao-border',
  },
  {
    num: '03',
    name: 'Verified',
    status: 'token-ready',
    headline: 'Proven community. One click from live.',
    description:
      '30+ real contributors have shown up for 4+ consecutive weeks. ZAO has vetted the launch and holds a locked stake. The token config is finalized. The 0xSplits contract is deployed. One human click on clanker.world launches the token.',
    available: [
      '🏅 ZAO Vetted badge on the launch page',
      '0xSplits contract deployed on Base',
      'ZAO locked stake (5% supply, 12 months)',
      'Full launch thread ready (5-cast Farcaster + X)',
      'Deploy config JSON exported — ready for clanker.world',
    ],
    notYet: ['Token not yet deployed (waiting for human)', 'No live fee flow (split contract ready but idle)'],
    cta: { label: 'Browse verified launches', href: '/launches' },
    color: 'border-gold-500/30',
    tag: 'Token ready',
    tagColor: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
  },
  {
    num: '04',
    name: 'Established',
    status: 'live',
    headline: 'Token live. Fees flow. Weekly receipts.',
    description:
      'The token is live on Clanker. 1% of every trade goes to the 0xSplits contract. ZOL runs the weekly snapshot, updates split weights, and posts the receipt cast. Contributors earn proportional to their points — no claiming, no lockups, just fees landing in wallets.',
    available: [
      'Token live (Clanker v4, 1% fee tier)',
      '0xSplits contract receiving live fees',
      'Weekly snapshot → split update → on-chain',
      'Weekly receipt cast (top earners, pool size, leaderboard link)',
      'Receipt page with Farcaster Frame (shareable)',
    ],
    notYet: [],
    cta: { label: 'See Zoostr — a live Stage 4', href: 'https://zoostr.xyz', external: true },
    color: 'border-green-500/30',
    tag: 'Live',
    tagColor: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
  {
    num: '05',
    name: 'Federated',
    status: 'network',
    headline: 'Sparks back other sparks.',
    description:
      'A creator with an Emerging community (no token yet) starts boosting an Established spark. They appear on that spark\'s leaderboard and earn from its fee pool — proof-of-contribution before their own token exists. When they launch, both communities cross-boost. The network effect is mutual.',
    available: [
      'Cross-community contribution tracking',
      'Culture Circles receipt (who boosted what, what they earned)',
      'New spark gets proof-of-contribution history before their own launch',
      'Established spark gets more contributors and more fee liquidity',
    ],
    notYet: ['This is the north star — not v1'],
    cta: null,
    color: 'border-zao-violet/30',
    tag: 'Culture Circles',
    tagColor: 'text-zao-violet bg-zao-violet/10 border-zao-violet/20',
  },
]

const GUARDRAILS = [
  { rule: 'Culture before price', detail: 'Earnings projections, not price targets. The leaderboard measures contribution, not holder count.' },
  { rule: 'Attribution before extraction', detail: 'The split is public before the token launches. Everyone knows the terms before they boost.' },
  { rule: 'Holding ≠ contribution', detail: 'Fees go to boosters — people who actively showed up. Not bag-holders.' },
  { rule: 'No auto-mint', detail: 'A token is never a throwaway. Tokenization is explicit, creator-initiated, human-deployed.' },
  { rule: 'ZOL prepares, you deploy', detail: 'The agent builds everything. The human clicks deploy. That boundary never moves.' },
]

export default function LifecyclePage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <Link href="/vetted" className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
            Apply for a slot →
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          The spark lifecycle.
        </h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed text-lg">
          Five stages from first idea to federated network. Start tokenless. Build real community.
          Tokenize when momentum is proven — not before.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-10">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-8 bottom-8 w-px bg-zao-border hidden sm:block" />

          <div className="space-y-6">
            {STAGES.map((stage) => (
              <div key={stage.num} className="sm:pl-12 relative">
                {/* Stage number dot */}
                <div className="absolute left-0 top-5 w-11 h-11 rounded-full bg-zao-card border border-zao-border flex items-center justify-center hidden sm:flex">
                  <span className="text-xs font-black text-slate-400">{stage.num}</span>
                </div>

                <div className={`card-dark p-6 ${stage.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-600 sm:hidden">Stage {stage.num}</span>
                      </div>
                      <h2 className="text-xl font-black text-white">{stage.name}</h2>
                      <p className="text-slate-400 mt-1">{stage.headline}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex-shrink-0 ${stage.tagColor}`}>
                      {stage.tag}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{stage.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Available now
                      </div>
                      <ul className="space-y-1.5">
                        {stage.available.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="text-gold-500 flex-shrink-0 mt-0.5">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {stage.notYet.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Not yet
                        </div>
                        <ul className="space-y-1.5">
                          {stage.notYet.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="flex-shrink-0 mt-0.5">–</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {stage.cta && (
                    <div className="mt-5 pt-4 border-t border-zao-border">
                      {stage.cta.external ? (
                        <a
                          href={stage.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-semibold"
                        >
                          {stage.cta.label} ↗
                        </a>
                      ) : (
                        <Link
                          href={stage.cta.href}
                          className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-semibold"
                        >
                          {stage.cta.label} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardrails */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Guardrails at every stage
        </h2>
        <div className="card-dark p-6 space-y-4">
          {GUARDRAILS.map((g) => (
            <div key={g.rule} className="flex gap-3">
              <span className="text-gold-500 flex-shrink-0 mt-0.5 text-sm">✓</span>
              <div>
                <div className="font-semibold text-white text-sm">{g.rule}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{g.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="card-dark p-6 sm:p-8 text-center border-gold-500/20">
          <div className="text-3xl mb-3">⚡</div>
          <h2 className="text-xl font-black text-white mb-2">Find your stage.</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Answer 3 questions. Get a recommended split + token timing + the right next step for
            where you are right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/advisor" className="btn-gold inline-block">
              Open the advisor →
            </Link>
            <Link href="/examples" className="btn-outline inline-block">
              Browse spark examples
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
