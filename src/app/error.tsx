'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-zao-dark flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <Link href="/" className="font-black text-2xl tracking-tight">
          <span className="text-gradient-gold">SPAR</span>
          <span className="text-white">KZ</span>
        </Link>
      </div>

      <h1 className="text-3xl font-black text-white mb-3">Something went wrong.</h1>
      <p className="text-slate-400 mb-2 max-w-sm">
        This spark hit a snag. Try again or head back to the homepage.
      </p>
      {process.env.NODE_ENV === 'development' && error?.message && (
        <p className="text-xs text-amber-400/70 mb-6 max-w-sm font-mono break-all">{error.message}</p>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg border border-zao-border hover:border-zao-violet/50 text-white font-medium transition-colors"
        >
          Back to Sparkz
        </Link>
      </div>
    </main>
  )
}
