export default function AdvisorLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      {/* Nav skeleton */}
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-20 h-7 rounded-lg bg-zao-card/60 animate-pulse" />
        </div>
      </nav>

      {/* Wizard skeleton */}
      <section className="max-w-2xl mx-auto px-4 pt-14 pb-24">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zao-card/60" />
              {i < 2 && <div className="h-px w-12 bg-zao-card/40" />}
            </div>
          ))}
        </div>

        {/* Question card */}
        <div className="card-dark p-8 animate-pulse">
          <div className="h-4 w-20 rounded bg-zao-card/60 mb-4" />
          <div className="h-7 w-3/4 rounded-lg bg-zao-card/60 mb-2" />
          <div className="h-5 w-full rounded bg-zao-card/40 mb-8" />

          {/* Answer options */}
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-zao-card/40" />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
