import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zao-dark flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl font-black text-gold-500/20 mb-4">404</div>
        <h1 className="text-2xl font-black text-white mb-2">Page not found.</h1>
        <p className="text-slate-400 mb-8">That spark doesn&rsquo;t exist — yet.</p>
        <Link href="/" className="btn-gold text-sm py-2 px-5">
          Back to Sparkz →
        </Link>
      </div>
    </main>
  )
}
