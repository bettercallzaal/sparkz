export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      {/* Nav skeleton */}
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-7 rounded-lg bg-zao-card/60 animate-pulse hidden sm:block" />
            <div className="w-24 h-8 rounded-lg bg-zao-card/60 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero skeleton */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-block h-6 w-40 rounded-full bg-zao-card/60 animate-pulse mb-8" />
        <div className="h-12 w-full max-w-2xl rounded-lg bg-zao-card/60 animate-pulse mx-auto mb-3" />
        <div className="h-12 w-3/4 max-w-xl rounded-lg bg-zao-card/60 animate-pulse mx-auto mb-5" />
        <div className="h-5 w-full max-w-lg rounded bg-zao-card/40 animate-pulse mx-auto mb-2" />
        <div className="h-5 w-2/3 max-w-md rounded bg-zao-card/40 animate-pulse mx-auto mb-10" />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="h-11 w-36 rounded-lg bg-gold-500/20 animate-pulse" />
          <div className="h-11 w-32 rounded-lg bg-zao-card/60 animate-pulse" />
        </div>
      </section>

      {/* Live stats card skeleton */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="card-dark p-6 sm:p-8 border-gold-500/20 animate-pulse">
          <div className="h-5 w-48 rounded bg-zao-card/60 mb-5" />
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-zao-card/60 mb-2" />
              <div className="h-4 w-48 rounded bg-zao-card/40" />
            </div>
            <div className="flex gap-6">
              <div>
                <div className="h-8 w-12 rounded bg-zao-card/60 mb-1" />
                <div className="h-3 w-20 rounded bg-zao-card/40" />
              </div>
              <div>
                <div className="h-8 w-14 rounded bg-zao-card/60 mb-1" />
                <div className="h-3 w-16 rounded bg-zao-card/40" />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-zao-border flex gap-4">
            <div className="h-8 w-32 rounded-lg bg-zao-card/60" />
            <div className="h-8 w-28 rounded-lg bg-zao-card/40" />
          </div>
        </div>
      </section>

      {/* Use case cards skeleton */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card-dark p-6 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-zao-card/60 mb-3" />
              <div className="h-5 w-36 rounded bg-zao-card/60 mb-2" />
              <div className="h-4 w-full rounded bg-zao-card/40 mb-1" />
              <div className="h-4 w-3/4 rounded bg-zao-card/40 mb-4" />
              <div className="h-7 w-24 rounded-lg bg-zao-card/60" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
