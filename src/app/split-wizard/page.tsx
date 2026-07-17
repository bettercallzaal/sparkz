import type { Metadata } from 'next'
import { Suspense } from 'react'
import SplitWizard from '@/components/SplitWizard'

export const metadata: Metadata = {
  title: 'Split sheet wizard — Sparkz',
  description:
    'Set roles and percentages before you launch. Every collaborator gets their share — on-chain, from day one. No disputes later.',
}

export default function SplitWizardPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <span className="text-sm text-slate-500">Split sheet wizard</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Set your split before you launch.
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Define who gets what — producer, engineer, featured artist, community pool — before any
            token exists. This becomes your on-chain 0xSplits config and is IPFS-attested so
            there&rsquo;s a permanent record of what was agreed.
          </p>
        </div>
        <Suspense>
          <SplitWizard />
        </Suspense>
      </div>
    </main>
  )
}
