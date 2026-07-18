import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import SplitWizard from '@/components/SplitWizard'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Split sheet wizard')}&sub=${encodeURIComponent('Set roles + % before you launch. No disputes later.')}`

export const metadata: Metadata = {
  title: 'Split sheet wizard — Sparkz',
  description:
    'Set roles and percentages before you launch. Every collaborator gets their share — on-chain, from day one. No disputes later.',
  openGraph: {
    title: 'Split sheet wizard — Sparkz',
    description: 'Set roles and percentages before you launch. Every collaborator on-chain from day one — no disputes later.',
    url: `${BASE_URL}/split-wizard`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Split sheet wizard — Sparkz' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Split sheet wizard — Sparkz',
    description: 'Set roles + % before you launch. No disputes later.',
    images: [OG_URL],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': OG_URL,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🎵 Build your split sheet',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${BASE_URL}/split-wizard`,
    'fc:frame:button:2': '⚡ Try the advisor first',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${BASE_URL}/advisor`,
  },
}

export default function SplitWizardPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
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
            token exists. Export the config as JSON, share it with your team for sign-off, then use
            it to deploy on app.splits.org when you&rsquo;re ready.
          </p>
        </div>
        <Suspense>
          <SplitWizard />
        </Suspense>
      </div>
    </main>
  )
}
