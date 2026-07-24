'use client'

import Link from 'next/link'
import { useState } from 'react'

type Tier = {
  id: string
  name: string
  price: number
  emoji: string
  perks: string[]
}

type CreatorInfo = {
  handle: string
  projectName: string
  bio: string
}

type Step = 'info' | 'tiers' | 'preview' | 'export'

const DEFAULT_TIERS: Tier[] = [
  {
    id: 'spark',
    name: 'Spark',
    price: 5,
    emoji: '⚡',
    perks: [
      'Proof of backing — verified on-chain',
      'Early access to new drops',
      'Supporter feed (updates before anyone else)',
    ],
  },
  {
    id: 'flame',
    name: 'Flame',
    price: 25,
    emoji: '🔥',
    perks: [
      'Everything in Spark',
      'Named in the credits (album, release notes)',
      'Listening party access before public release',
      'Monthly Q&A with the creator',
    ],
  },
  {
    id: 'empire',
    name: 'Empire',
    price: 100,
    emoji: '👑',
    perks: [
      'Everything in Flame',
      '1:1 call with the creator (30 min, monthly)',
      'Producer/collaborator credit on one release per year',
      'ZAO advisory call (1x per quarter)',
      'ZAO Empire badge on your profile',
    ],
  },
]

const PERK_SUGGESTIONS = [
  'Early access to new drops',
  'Listening party access',
  'Named in the credits',
  '1:1 with the creator',
  'Supporter-only feed',
  'Monthly Q&A',
  'Stem files / source material',
  'Exclusive merch discount',
  'Behind-the-scenes content',
  'Vote on next project direction',
  'Producer credit on one release',
  'Early invite when you launch',
]

function PerkList({
  perks,
  onChange,
}: {
  perks: string[]
  onChange: (perks: string[]) => void
}) {
  const [newPerk, setNewPerk] = useState('')

  const addPerk = (perk: string) => {
    const trimmed = perk.trim()
    if (!trimmed || perks.includes(trimmed) || perks.length >= 6) return
    onChange([...perks, trimmed])
    setNewPerk('')
  }

  const removePerk = (i: number) => onChange(perks.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {perks.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="text-gold-500 flex-shrink-0">✓</span>
          <span className="text-slate-300 flex-1">{p}</span>
          <button
            onClick={() => removePerk(i)}
            className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
      {perks.length < 6 && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Add a perk…"
            value={newPerk}
            onChange={(e) => setNewPerk(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPerk(newPerk)}
            className="flex-1 bg-zao-dark border border-zao-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
          />
          <button
            onClick={() => addPerk(newPerk)}
            className="px-3 py-1.5 rounded-lg bg-zao-card border border-zao-border text-slate-400 hover:text-white text-sm transition-colors"
          >
            +
          </button>
        </div>
      )}
      {perks.length < 6 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PERK_SUGGESTIONS.filter((s) => !perks.includes(s)).slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => addPerk(s)}
              className="text-xs px-2 py-1 rounded-full border border-zao-border text-slate-500 hover:border-gold-500/30 hover:text-slate-300 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TierCard({
  tier,
  onChange,
}: {
  tier: Tier
  onChange: (t: Tier) => void
}) {
  return (
    <div className="card-dark p-5 space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          maxLength={2}
          value={tier.emoji}
          onChange={(e) => onChange({ ...tier, emoji: e.target.value })}
          className="w-12 text-center bg-zao-dark border border-zao-border rounded-lg py-2 text-xl focus:outline-none focus:border-gold-500/50"
        />
        <input
          type="text"
          placeholder="Tier name"
          value={tier.name}
          onChange={(e) => onChange({ ...tier, name: e.target.value })}
          className="flex-1 bg-zao-dark border border-zao-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-gold-500/50"
        />
        <div className="flex items-center gap-1 border border-zao-border rounded-lg overflow-hidden">
          <span className="px-2 py-2 text-slate-400 text-sm bg-zao-dark">$</span>
          <input
            type="number"
            min={1}
            max={10000}
            value={tier.price}
            onChange={(e) => onChange({ ...tier, price: parseInt(e.target.value) || 1 })}
            className="w-20 bg-zao-dark px-2 py-2 text-white font-bold text-right focus:outline-none tabular-nums"
          />
          <span className="px-2 py-2 text-slate-500 text-xs bg-zao-dark">/mo</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Perks (max 6)</div>
        <PerkList perks={tier.perks} onChange={(perks) => onChange({ ...tier, perks })} />
      </div>
    </div>
  )
}

function FanPreview({ creator, tiers }: { creator: CreatorInfo; tiers: Tier[] }) {
  const [selected, setSelected] = useState<string>(tiers[1]?.id ?? tiers[0]?.id)

  return (
    <div className="rounded-xl border border-zao-border overflow-hidden">
      <div className="bg-zao-card px-6 py-5 border-b border-zao-border">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Fan view preview</div>
        <h3 className="text-xl font-black text-white">
          Back {creator.projectName || creator.handle || 'the work'}
        </h3>
        {creator.bio && <p className="text-sm text-slate-400 mt-1">{creator.bio}</p>}
      </div>

      <div className="p-6 bg-zao-dark">
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`card-dark p-4 text-left transition-colors hover:border-gold-500/30 ${
                selected === t.id ? 'border-gold-500/60 bg-gold-500/5' : ''
              }`}
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <div className="font-bold text-white">{t.name}</div>
              <div className="text-2xl font-black text-gold-400 mt-1">
                ${t.price}<span className="text-sm text-slate-500">/mo</span>
              </div>
            </button>
          ))}
        </div>

        {tiers.find((t) => t.id === selected) && (
          <div className="card-dark p-4 mb-4">
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
              {tiers.find((t) => t.id === selected)?.name} perks
            </div>
            <ul className="space-y-2">
              {tiers.find((t) => t.id === selected)?.perks.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn-gold w-full text-sm py-3">
          Back at ${tiers.find((t) => t.id === selected)?.price}/month →
        </button>
        <p className="text-xs text-slate-600 text-center mt-2">
          Card payment · no wallet · no gas · cancel anytime
        </p>
      </div>
    </div>
  )
}

export default function TiersWizard() {
  const [step, setStep] = useState<Step>('info')
  const [creator, setCreator] = useState<CreatorInfo>({ handle: '', projectName: '', bio: '' })
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS)
  const [copied, setCopied] = useState(false)

  const updateTier = (id: string, updated: Tier) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  const exportConfig = {
    _comment: 'Sparkz patronage tier config — review before wiring to Stripe',
    creator: {
      handle: creator.handle || '[your handle]',
      projectName: creator.projectName || '[project name]',
      bio: creator.bio || '',
    },
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      priceUsd: t.price,
      cadence: 'monthly',
      perks: t.perks,
    })),
    _next: [
      'Share this config with ZOL (@bettercallzaal on Farcaster) to get your fan page built',
      'Or: wire to Stripe Checkout — each tier becomes a Stripe Price object',
      'Stripe payment → fan receives email confirmation; on-chain backing proof is v2 roadmap',
      'No wallet required for fans; Stripe account required for creator',
    ],
    _platform: 'Sparkz — sparkz.xyz — ZAO ecosystem',
  }

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportConfig, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(exportConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(creator.handle || 'sparkz-tiers').replace(/[@\s]+/g, '-').toLowerCase()}-tiers.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const warpcastTiersUrl = (() => {
    const tierLines = tiers.map((t) => `${t.emoji} ${t.name} — $${t.price}/mo`).join('\n')
    const projectLine = creator.projectName || 'my project'
    const text = [
      `just set up patronage tiers for ${projectLine} on Sparkz ⚡`,
      ``,
      tierLines,
      ``,
      `no wallet. no gas. just backing.`,
      ``,
      `sparkz.xyz/tiers`,
    ].join('\n')
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
  })()

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 text-xs text-slate-500">
        {(['info', 'tiers', 'preview', 'export'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-zao-border" />}
            <div
              className={`flex items-center gap-1.5 ${step === s ? 'text-gold-400' : 'text-slate-600'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step === s ? 'bg-gold-500 border-gold-500 text-black' : 'border-zao-border'
                }`}
              >
                {i + 1}
              </div>
              <span className="hidden sm:inline capitalize">{s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Creator info */}
      {step === 'info' && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-white">Tell us about your project.</h2>
          {[
            {
              key: 'handle' as const,
              label: 'Your handle',
              placeholder: '@yourhandle or yourname',
              hint: 'How you show up on Farcaster, X, or wherever you build in public',
            },
            {
              key: 'projectName' as const,
              label: 'Project name',
              placeholder: 'Album title, collab name, show name…',
              hint: 'What your fans are backing — e.g. "The Third Album" or "My Creator Community"',
            },
            {
              key: 'bio' as const,
              label: 'One-line bio',
              placeholder: 'What you make and who it\'s for…',
              hint: 'Shows up on your fan-facing page',
            },
          ].map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className="text-sm font-semibold text-white mb-1.5 block">{label}</label>
              {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
              <input
                type="text"
                placeholder={placeholder}
                value={creator[key]}
                onChange={(e) => setCreator((c) => ({ ...c, [key]: e.target.value }))}
                className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
              />
            </div>
          ))}
          <button
            onClick={() => setStep('tiers')}
            disabled={!creator.handle.trim()}
            className="btn-gold w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next: Configure tiers →
          </button>
        </div>
      )}

      {/* Step 2: Tier configuration */}
      {step === 'tiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Configure your 3 tiers.</h2>
            <span className="text-xs text-slate-500">Edit names, prices, and perks</span>
          </div>
          <p className="text-sm text-slate-500 -mt-2 mb-4">
            Defaults are a good starting point — customize freely. Perks should describe what
            backers enjoy today, not promises.
          </p>
          {tiers.map((t) => (
            <TierCard key={t.id} tier={t} onChange={(updated) => updateTier(t.id, updated)} />
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('info')} className="btn-outline flex-1">
              ← Back
            </button>
            <button onClick={() => setStep('preview')} className="btn-gold flex-1">
              Preview fan page →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">This is what your fans see.</h2>
            <p className="text-sm text-slate-500">
              Card payment, no wallet required. Fan receives email confirmation.
            </p>
          </div>
          <FanPreview creator={creator} tiers={tiers} />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('tiers')} className="btn-outline flex-1">
              ← Edit tiers
            </button>
            <button onClick={() => setStep('export')} className="btn-gold flex-1">
              Export config →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Export */}
      {step === 'export' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Your tier config is ready.</h2>
            <p className="text-sm text-slate-500">
              Download the JSON and share it with ZOL to get your fan page built — or wire it to
              Stripe yourself. Each tier maps to a Stripe Price object.
            </p>
          </div>

          <div className="card-dark p-5">
            <pre className="text-xs text-slate-400 bg-zao-dark rounded-lg p-4 overflow-auto max-h-64 font-mono leading-relaxed">
              {JSON.stringify(exportConfig, null, 2)}
            </pre>
            <div className="flex gap-3 mt-4">
              <button onClick={copyJSON} className="btn-outline flex-1 text-sm py-2">
                {copied ? '✓ Copied!' : 'Copy JSON'}
              </button>
              <button onClick={downloadJSON} className="btn-gold flex-1 text-sm py-2">
                Download tiers.json
              </button>
            </div>
            <a
              href={warpcastTiersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-zao-violet/40 text-zao-violet hover:border-zao-violet/70 hover:bg-zao-violet/5 text-sm font-semibold transition-colors"
            >
              Share on Farcaster ↗
            </a>
          </div>

          <div className="card-dark p-5 border-gold-500/20">
            <div className="text-sm font-bold text-white mb-3">What happens next</div>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
              <li>
                Share your tiers.json with{' '}
                <a
                  href="https://warpcast.com/bettercallzaal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300"
                >
                  @bettercallzaal
                </a>{' '}
                on Farcaster
              </li>
              <li>ZOL builds your fan page and wires it to Stripe Checkout</li>
              <li>Fans back you with a card — no wallet, no gas</li>
              <li>Proof of backing goes on-chain per tier via a custodial wallet</li>
              <li>Early backers are part of your inner circle if you take the next step</li>
            </ol>
          </div>

          <div className="card-dark p-4">
            <div className="text-xs text-slate-500 mb-2">Or get vetted by ZAO for a full launch</div>
            <p className="text-sm text-slate-400 mb-3">
              ZAO-backed launches get a &ldquo;Vetted by ZAO&rdquo; badge, scarce drop slots (1 of 50/quarter),
              and ZOL marketing support. The patronage tiers become part of the full Sparkz launch.
            </p>
            <Link href="/vetted" className="text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors">
              Apply for ZAO vetting →
            </Link>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('preview')} className="btn-outline flex-1">
              ← Back
            </button>
            <button
              onClick={() => { setStep('info'); setCreator({ handle: '', projectName: '', bio: '' }); setTiers(DEFAULT_TIERS) }}
              className="btn-outline flex-1"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
