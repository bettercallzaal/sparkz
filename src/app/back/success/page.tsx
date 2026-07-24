import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sparkz.xyz'

export const metadata: Metadata = {
  title: 'You backed it — Sparkz',
}

export default async function BackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier: tierParam } = await searchParams
  const tier = tierParam ?? '$25'

  const castText = `just backed the work on Sparkz at the ${tier} tier ⚡\n\nno wallet. no gas. just backing.\n\n${BASE_URL}/back`
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`

  return (
    <main className="min-h-screen bg-zao-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">🟡</div>
        <h1 className="text-3xl font-black text-white mb-3">You backed it.</h1>
        <p className="text-slate-400 leading-relaxed mb-2">
          Your{' '}
          <span className="text-gold-400 font-semibold">{tier}</span> backing went through.
          You&rsquo;ll receive confirmation by email.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Perks are what backers enjoy today — not guarantees. Not financial advice.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/launches" className="btn-gold text-sm py-2 px-5 inline-block">
            See active launches →
          </Link>
          <a
            href={warpcastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm py-2 px-5 inline-block border-zao-violet/40 text-zao-violet hover:border-zao-violet/70"
          >
            Cast on Farcaster ↗
          </a>
          <Link href="/examples" className="btn-outline text-sm py-2 px-5">
            Browse spark examples
          </Link>
        </div>
      </div>
    </main>
  )
}
