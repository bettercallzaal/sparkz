import type { Metadata } from 'next'
import BackingForm from '@/components/BackingForm'

export const metadata: Metadata = {
  title: 'Back the work — Sparkz',
  description:
    'Back a creator\'s work with a card — no wallet, no gas, no friction. You collect a proof of backing. The creator gets early momentum before any token exists.',
}

export default function BackPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <span className="text-sm text-slate-500">Back the work</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-6">
            ✦ No wallet or gas required
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Back the work with a card.
          </h1>
          <p className="text-slate-400 leading-relaxed">
            85% of fans have never touched a crypto wallet. Sparkz lets them back the album anyway —
            card payment, instant proof of backing, no blockchain friction. When a token launches
            (if ever), early backers are first in line.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { tier: '$5', label: 'Spark', perks: 'Proof of backing + early access feed' },
            { tier: '$25', label: 'Flame', perks: 'Everything above + named in the credits' },
            { tier: '$100', label: 'Empire', perks: 'Everything above + 1:1 with the creator' },
          ].map(({ tier, label, perks }) => (
            <div key={tier} className="card-dark p-4 text-center">
              <div className="text-2xl font-black text-gold-400 mb-1">{tier}</div>
              <div className="text-sm font-bold text-white mb-2">{label}</div>
              <div className="text-xs text-slate-500">{perks}</div>
            </div>
          ))}
        </div>

        <BackingForm />

        <div className="mt-8 text-xs text-slate-600 space-y-1">
          <p>
            Perks are what backers enjoy today — not promises about future token prices. This is
            not an investment. Sparkz is a monetization mechanism.
          </p>
          <p>
            Fiat onboarding is in early access. Card processing powered by Stripe (Sparkz never
            stores payment details). A custodial wallet is provisioned for your backing proof
            automatically — no setup required.
          </p>
        </div>
      </div>
    </main>
  )
}
