export default function LaunchDetailLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      {/* Nav skeleton */}
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-24 h-7 rounded-lg bg-zao-card/60 animate-pulse" />
        </div>
      </nav>

      {/* Header skeleton */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="flex flex-wrap gap-6 items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Emoji + name + ticker */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-zao-card/60 animate-pulse flex-shrink-0" />
              <div>
                <div className="h-8 w-48 rounded-lg bg-zao-card/60 animate-pulse mb-1" />
                <div className="h-5 w-20 rounded bg-zao-card/40 animate-pulse" />
              </div>
            </div>
            {/* Tagline */}
            <div className="h-5 w-full max-w-sm rounded bg-zao-card/40 animate-pulse mb-2" />
            {/* Badges */}
            <div className="flex gap-2 mt-3">
              <div className="h-6 w-20 rounded-full bg-zao-card/40 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-zao-card/40 animate-pulse" />
            </div>
          </div>
          {/* CTAs */}
          <div className="flex flex-col gap-2 w-40 flex-shrink-0">
            <div className="h-10 w-full rounded-lg bg-zao-card/60 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-zao-card/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats grid skeleton */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-zao-card/40 p-4 animate-pulse">
              <div className="h-7 w-16 rounded bg-zao-card/60 mb-1 mx-auto" />
              <div className="h-3 w-20 rounded bg-zao-card/40 mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Boosters skeleton */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="h-6 w-32 rounded bg-zao-card/60 animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zao-card/40 animate-pulse"
            >
              <div className="w-8 h-8 rounded-full bg-zao-card/60 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-28 rounded bg-zao-card/60 mb-1" />
                <div className="h-3 w-16 rounded bg-zao-card/40" />
              </div>
              <div className="h-4 w-12 rounded bg-zao-card/60" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
