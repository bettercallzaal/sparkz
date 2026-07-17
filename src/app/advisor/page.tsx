import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdvisorFlow from '@/components/AdvisorFlow'

export const metadata: Metadata = {
  title: 'Split advisor — Sparkz',
  description:
    'Answer 3 questions and get a recommended split configuration — community pool, creator pool, treasury, ZAO stake, and whether to launch a token now or later.',
}

export default async function AdvisorPage({
  searchParams,
}: {
  searchParams: Promise<{ via?: string }>
}) {
  const { via } = await searchParams
  const viaViniapp = via === 'viniapp'

  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <div className="flex items-center gap-3">
            {viaViniapp && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-zao-violet/30 bg-zao-violet/10 text-zao-violet font-semibold">
                via Viniapp
              </span>
            )}
            <span className="text-sm text-slate-500">Split advisor</span>
          </div>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Get your recommended split in 3 questions.
          </h1>
          <p className="text-slate-400 leading-relaxed">
            The advisor looks at your situation — crowdfund, collab, or solo — and gives you a
            concrete starting point: split percentages, whether to launch a token now or later, and
            a sustainable fee model based on real Clanker data.
          </p>
        </div>
        <Suspense>
          <AdvisorFlow />
        </Suspense>
      </div>
    </main>
  )
}
