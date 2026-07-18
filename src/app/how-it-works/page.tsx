import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('How it works')}&sub=${encodeURIComponent('0xSplits + Clanker. Adjustable, on-chain, music-native.')}`

export const metadata: Metadata = {
  title: 'How it works — Sparkz',
  description:
    'How Sparkz wires 0xSplits to Clanker for adjustable, on-chain community fee distribution. The technical pattern and the trust model.',
  openGraph: {
    title: 'How it works — Sparkz',
    description: '0xSplits + Clanker. Adjustable fee splits, on-chain distribution, music-native — not a frozen wallet address.',
    url: `${BASE_URL}/how-it-works`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'How it works — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How it works — Sparkz',
    description: '0xSplits + Clanker. Adjustable, on-chain, music-native.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '⚡ Open the advisor',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/advisor`,
    'fc:frame:button:2': '📖 See an example',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/examples`,
  },
}

const STEPS = [
  {
    step: '01',
    title: 'Configure your split',
    description:
      'Use the advisor (3 questions) and split wizard to define who gets what: community pool, creator pool, treasury, ZAO stake. The output is a JSON config file with roles, percentages, and wallet addresses.',
    cta: { label: 'Open split wizard', href: '/split-wizard' },
  },
  {
    step: '02',
    title: 'Deploy a 0xSplits contract',
    description:
      'Go to app.splits.org and create a Split with your recipients and weights from step 1. This gives you a single contract address that holds the fee — recipients claim at splits.org when ready. Recipients and weights are adjustable — your leaderboard changes weekly, your split can too.',
    cta: { label: 'app.splits.org ↗', href: 'https://app.splits.org', external: true },
  },
  {
    step: '03',
    title: 'Deploy your token on Clanker (human step)',
    description:
      'Go to clanker.world. Fill the name, ticker, description, and — critically — set the fee recipient to the 0xSplits contract address from step 2. Not your personal wallet. The Splits address. This is the only irreversible decision; Clanker v4 fee recipients are immutable after deploy.',
    highlight: 'ZOL never deploys on-chain. This step is always a human action.',
    cta: { label: 'clanker.world ↗', href: 'https://www.clanker.world', external: true },
  },
  {
    step: '04',
    title: 'Weekly: run the snapshot',
    description:
      'Every Monday, run npm run snapshot from the repo. It fetches the live leaderboard, computes integer weights (summing to 1,000,000 for 0xSplits), shows you what changed vs last week, and outputs splits-update.json + a DreamNet-style receipt cast.',
    code: 'SPLITS_ADDRESS=0x… npm run snapshot',
  },
  {
    step: '05',
    title: 'Update the split, post the receipt',
    description:
      'Review splits-update.json, then go to app.splits.org → your split → Update. Paste the recipients. This calls updateSplit() on-chain. Then post the receipt cast — it shows top earners, total pool, and basescan link. Your community sees exactly what they earned and why.',
    code: '# Receipt cast format:\n# ZOOSTR WEEKLY RECEIPT · 2026-07-17\n# Leaderboard pool: $350/week\n# #1 @username — 34.2% — $119/week',
  },
]

const TRUST_MODEL = [
  {
    label: 'What is immutable',
    value: 'The Clanker fee recipient address — set once at deploy, never changed. That address is the 0xSplits contract.',
  },
  {
    label: 'What is adjustable',
    value: 'The recipients and weights inside 0xSplits. Controlled by the designated controller wallet(s) — typically a 2-of-3 multisig: creator + Aziz + ZAO.',
  },
  {
    label: 'What is public',
    value: 'The entire split is on-chain and readable by anyone. Your community can verify their weight on basescan without trusting you.',
  },
  {
    label: 'What ZOL does',
    value: 'Generates configs, runs snapshots, drafts receipts. Never signs, never calls updateSplit(), never moves funds.',
  },
  {
    label: 'What requires a human',
    value: 'Deploying on Clanker, calling updateSplit() after reviewing the snapshot, posting the receipt cast.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">How it works</span>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 pt-14 pb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          How Sparkz wires<br />
          <span className="text-gradient-gold">0xSplits → Clanker.</span>
        </h1>
        <p className="text-slate-400 leading-relaxed text-lg">
          The core pattern: put a 0xSplits contract as the Clanker fee recipient. Inside Splits,
          recipients are adjustable. The result: every trade fee accumulates in your community
          split — recipients claim at splits.org, with weights that evolve as your leaderboard does.
        </p>
      </section>

      {/* The key insight */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="card-dark p-6 border-gold-500/20">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
            The fix nobody else built
          </div>
          <p className="text-slate-300 leading-relaxed">
            Clanker v4 <code className="text-gold-400 font-mono text-sm">rewardBps</code> are
            immutable after deploy. If you put your wallet as the fee recipient, it&rsquo;s frozen
            forever. If you try to split multiple wallets upfront, the split freezes at launch —
            your leaderboard changes weekly, your split can&rsquo;t.
          </p>
          <p className="text-slate-300 leading-relaxed mt-3">
            <strong className="text-white">Sparkz&rsquo;s solution:</strong> The Clanker fee
            recipient is a 0xSplits contract — a single, immutable address. Inside Splits, the
            recipients and weights are fully adjustable. Your leaderboard evolves; your fee split
            evolves with it. Single-recipient fee splits are everywhere. Multi-recipient, live,
            adjustable on-chain is Sparkz.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-black text-white mb-6">The weekly cycle</h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.step} className="card-dark p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl font-black text-gold-500/40 flex-shrink-0 leading-none">
                  {s.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{s.description}</p>
                  {s.highlight && (
                    <div className="text-xs px-3 py-2 rounded-lg bg-zao-dark border border-zao-border text-slate-400 mb-3">
                      ⚠ {s.highlight}
                    </div>
                  )}
                  {s.code && (
                    <pre className="text-xs font-mono bg-zao-dark text-gold-400/80 rounded-lg p-3 overflow-x-auto mb-3">
                      {s.code}
                    </pre>
                  )}
                  {s.cta && (
                    <a
                      href={s.cta.href}
                      target={s.cta.external ? '_blank' : undefined}
                      rel={s.cta.external ? 'noopener noreferrer' : undefined}
                      className="text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors"
                    >
                      {s.cta.label} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust model */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-black text-white mb-6">Trust model</h2>
        <div className="card-dark overflow-hidden">
          {TRUST_MODEL.map((row, i) => (
            <div
              key={row.label}
              className={`px-6 py-4 flex flex-col sm:flex-row gap-2 ${
                i < TRUST_MODEL.length - 1 ? 'border-b border-zao-border' : ''
              }`}
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:w-40 flex-shrink-0">
                {row.label}
              </div>
              <div className="text-sm text-slate-300 flex-1">{row.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/advisor" className="card-dark p-5 hover:border-gold-500/30 transition-colors block">
            <div className="text-lg mb-2">⚡</div>
            <div className="font-bold text-white mb-1">Get your split</div>
            <div className="text-xs text-slate-500">3 questions → recommended config</div>
          </Link>
          <Link href="/split-wizard" className="card-dark p-5 hover:border-gold-500/30 transition-colors block">
            <div className="text-lg mb-2">🎵</div>
            <div className="font-bold text-white mb-1">Split wizard</div>
            <div className="text-xs text-slate-500">Roles, %, wallets → export JSON</div>
          </Link>
          <Link href="/vetted" className="card-dark p-5 hover:border-gold-500/30 transition-colors block">
            <div className="text-lg mb-2">🏅</div>
            <div className="font-bold text-white mb-1">Get vetted</div>
            <div className="text-xs text-slate-500">50 slots per quarter, ZAO-backed</div>
          </Link>
        </div>
      </section>
    </main>
  )
}
