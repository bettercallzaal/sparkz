export default function LaunchesLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-32 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex-1">
            <div className="w-56 h-10 rounded bg-zao-card/60 animate-pulse mb-3" />
            <div className="space-y-2 max-w-xl">
              <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
              <div className="w-4/5 h-4 rounded bg-zao-card/40 animate-pulse" />
            </div>
          </div>
          <div className="text-right">
            <div className="w-10 h-9 rounded bg-zao-card/60 animate-pulse mb-1" />
            <div className="w-24 h-3 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Live now section */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-zao-card/60 animate-pulse" />
          <div className="w-16 h-3 rounded bg-zao-card/40 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <LaunchCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* In progress section */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="w-24 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <LaunchCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* CTA card */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="card-dark p-6 sm:p-8 text-center">
          <div className="w-10 h-10 rounded bg-zao-card/60 animate-pulse mx-auto mb-3" />
          <div className="w-40 h-6 rounded bg-zao-card/60 animate-pulse mx-auto mb-2" />
          <div className="space-y-2 max-w-md mx-auto mb-5">
            <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse mx-auto" />
          </div>
          <div className="w-32 h-10 rounded bg-zao-card/60 animate-pulse mx-auto" />
        </div>
      </section>
    </main>
  )
}

function LaunchCardSkeleton() {
  return (
    <div className="card-dark p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="w-32 h-5 rounded bg-zao-card/60 animate-pulse" />
            <div className="w-16 h-3 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="w-16 h-3 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-20 h-5 rounded-full bg-zao-card/40 animate-pulse" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
        <div className="w-5/6 h-3 rounded bg-zao-card/40 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-3 rounded bg-zao-card/40 animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-zao-card/40" />
        <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse" />
      </div>
    </div>
  )
}
