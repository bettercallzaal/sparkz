'use client'

import Link from 'next/link'
import { useState } from 'react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

type Form = {
  handle: string
  projectName: string
  communityDescription: string
  communityMetric: string
  launchIntent: 'now' | 'later' | 'never' | ''
  splitIdea: string
  contact: string
}

const EMPTY: Form = {
  handle: '',
  projectName: '',
  communityDescription: '',
  communityMetric: '',
  launchIntent: '',
  splitIdea: '',
  contact: '',
}

export default function VettingApplication() {
  const [form, setForm] = useState<Form>(EMPTY)
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  const update = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }))

  const canSubmit =
    form.handle.trim() &&
    form.communityDescription.trim() &&
    form.launchIntent !== '' &&
    form.contact.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setState('submitting')
    try {
      const res = await fetch('/api/vetted-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setState('success')
    } catch (err) {
      setState('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. DM @bettercallzaal on Farcaster directly.'
      )
    }
  }

  if (state === 'success') {
    const castText = `just applied for a ZAO-vetted Sparkz launch 🏅\n\n50 slots/quarter. personal review. no automation.\n\nsparkz.xyz/vetted`
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`
    return (
      <div className="card-dark p-8 text-center">
        <div className="text-4xl mb-4">🏅</div>
        <h2 className="text-xl font-black text-white mb-2">Application received.</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          ZAO reviews every application personally. You&rsquo;ll hear back at{' '}
          <strong className="text-white">{form.contact}</strong> within 48 hours. If it&rsquo;s a fit,
          ZOL will reach out to start the config process — no automation, no template.
        </p>
        <a
          href={warpcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zao-violet/40 text-zao-violet hover:border-zao-violet/70 hover:bg-zao-violet/5 text-sm font-semibold transition-colors"
        >
          Cast your application ↗
        </a>
        <p className="text-xs text-slate-600 mt-4">
          While you wait: set up your{' '}
          <Link href="/tiers" className="text-gold-400 hover:text-gold-300">
            patronage tiers
          </Link>{' '}
          and{' '}
          <Link href="/split-wizard" className="text-gold-400 hover:text-gold-300">
            split config
          </Link>
          . Having these ready speeds up the vetting.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Handle */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Your Farcaster or social handle <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="@handle"
          value={form.handle}
          onChange={(e) => update({ handle: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Project name */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Project name
        </label>
        <input
          type="text"
          placeholder="Album title, collab name, token ticker idea…"
          value={form.projectName}
          onChange={(e) => update({ projectName: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Community */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Describe your community <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Who shows up for you? How? What does &ldquo;real engagement&rdquo; look like in your community — not follower counts.
        </p>
        <textarea
          required
          rows={3}
          placeholder="e.g. 34 people have been boosting my posts on Boostr for 6 months. They like every cast, share my drops, and show up in comments before I have anything to sell…"
          value={form.communityDescription}
          onChange={(e) => update({ communityDescription: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50 resize-none"
        />
      </div>

      {/* Metric */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          What metric measures your community&rsquo;s contribution?
        </label>
        <input
          type="text"
          placeholder="e.g. Boostr points, NFT holdings, Discord activity score, staking score, equal weight…"
          value={form.communityMetric}
          onChange={(e) => update({ communityMetric: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Launch intent */}
      <div>
        <label className="text-sm font-semibold text-white mb-3 block">
          Token intent <span className="text-red-400">*</span>
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { value: 'now' as const, label: 'Launch a token now', description: 'Community is ready' },
            { value: 'later' as const, label: 'Build first, token later', description: 'Prove momentum first' },
            { value: 'never' as const, label: 'No token — patronage only', description: 'Card-based recurring' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ launchIntent: opt.value })}
              className={`card-dark p-3 text-left transition-colors hover:border-gold-500/30 ${
                form.launchIntent === opt.value ? 'border-gold-500/60 bg-gold-500/5' : ''
              }`}
            >
              <div className="font-semibold text-white text-sm">{opt.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Split idea */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Split idea (optional)
        </label>
        <p className="text-xs text-slate-500 mb-2">
          If you have a rough idea for how fees would split, share it. If not, the advisor and ZOL
          will figure it out with you.
        </p>
        <textarea
          rows={2}
          placeholder="e.g. 50% to leaderboard by points, 25% to me, 25% treasury. Or just: haven't thought about it yet."
          value={form.splitIdea}
          onChange={(e) => update({ splitIdea: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50 resize-none"
        />
      </div>

      {/* Contact */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Best way to reach you <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Email, Farcaster DM handle, Telegram…"
          value={form.contact}
          onChange={(e) => update({ contact: e.target.value })}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {state === 'error' && (
        <div className="text-sm text-red-400 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || state === 'submitting'}
        className="btn-gold w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state === 'submitting' ? 'Submitting…' : 'Apply for a ZAO slot →'}
      </button>

      <p className="text-xs text-slate-600 text-center">
        Not automated. ZAO reads every application. Expect a personal response within 48 hours.
      </p>
    </form>
  )
}
