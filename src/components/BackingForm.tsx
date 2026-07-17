'use client'

import { useState } from 'react'

type Tier = '$5' | '$25' | '$100'

const TIERS: { value: Tier; label: string; description: string }[] = [
  { value: '$5', label: 'Spark — $5', description: 'Proof of backing + early access feed' },
  { value: '$25', label: 'Flame — $25', description: 'Everything + named in the credits' },
  { value: '$100', label: 'Empire — $100', description: 'Everything + 1:1 with the creator' },
]

type State = 'idle' | 'submitting' | 'success' | 'error'

export default function BackingForm() {
  const [tier, setTier] = useState<Tier>('$25')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setState('submitting')
    try {
      const res = await fetch('/api/back', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email: email.trim(), farcaster: handle.trim() || undefined }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.checkoutUrl) {
        // Stripe is live — redirect to checkout
        window.location.href = data.checkoutUrl
        return
      }
      // Waitlist mode (no Stripe key set)
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div className="card-dark p-8 text-center">
        <div className="text-4xl mb-4">🟡</div>
        <h2 className="text-xl font-black text-white mb-2">You&rsquo;re on the list.</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We&rsquo;ll reach out at <strong className="text-white">{email}</strong> when card backing
          goes live. You&rsquo;ll be first in at the{' '}
          <strong className="text-gold-400">{tier}</strong> tier.
        </p>
        <p className="text-xs text-slate-600 mt-4">
          No wallet required. No gas. Just show up.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tier selector */}
      <div>
        <label className="text-sm font-semibold text-white mb-3 block">Choose your tier</label>
        <div className="grid gap-3">
          {TIERS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTier(value)}
              className={`w-full text-left card-dark p-4 transition-colors hover:border-gold-500/30 ${
                tier === value ? 'border-gold-500/60 bg-gold-500/5' : ''
              }`}
            >
              <div className="font-bold text-white">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Your email
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {/* Farcaster handle (optional) */}
      <div>
        <label className="text-sm font-semibold text-white mb-2 block">
          Farcaster handle <span className="text-slate-500 font-normal">(optional — links proof to your profile)</span>
        </label>
        <input
          type="text"
          placeholder="@yourhandle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="w-full bg-zao-card border border-zao-border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {state === 'error' && (
        <div className="text-sm text-red-400 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting' || !email.trim()}
        className="btn-gold w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'submitting' ? 'Processing…' : `Back the work at ${tier} →`}
      </button>

      <p className="text-xs text-slate-600 text-center">
        Perks are what backers enjoy today — not guarantees. Not financial advice or an investment.
        You will be redirected to a secure payment page.
      </p>
    </form>
  )
}
