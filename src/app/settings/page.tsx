import type { Metadata } from 'next'
import Link from 'next/link'
import BYOKSettings from '@/components/BYOKSettings'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'
const OG_URL = `${BASE_URL}/api/og?title=${encodeURIComponent('Settings')}&sub=${encodeURIComponent('Bring your own AI key. Zero platform compute cost.')}`

export const metadata: Metadata = {
  title: 'Settings — Sparkz',
  description:
    'Bring your own AI key (BYOK) to route ZOL advisor compute through your own Anthropic account. Zero platform cost when your key is active — the 1% compute floor folds back into community treasury.',
  openGraph: {
    title: 'Settings — Sparkz',
    description: 'BYOK: bring your own Anthropic API key. ZOL compute routes through your account — zero platform cost, 1% floor returns to treasury.',
    url: `${BASE_URL}/settings`,
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Settings — Sparkz' }],
    type: 'website',
  },
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </Link>
          <span className="text-sm text-slate-500">Settings</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-12 pb-24">
        <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-10">
          Stored in your browser. Sent transiently to our API for Claude calls — never stored server-side.
        </p>

        <BYOKSettings />
      </div>
    </main>
  )
}
