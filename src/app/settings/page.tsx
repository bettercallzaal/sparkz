import type { Metadata } from 'next'
import BYOKSettings from '@/components/BYOKSettings'

export const metadata: Metadata = {
  title: 'Settings — Sparkz',
  description:
    'Bring your own AI key (BYOK) to route ZOL advisor compute through your own Anthropic account. Zero platform cost when your key is active — the 1% compute floor folds back into community treasury.',
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </a>
          <span className="text-sm text-slate-500">Settings</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-12 pb-24">
        <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-10">
          Stored locally in your browser. Never sent to any Sparkz server.
        </p>

        <BYOKSettings />
      </div>
    </main>
  )
}
