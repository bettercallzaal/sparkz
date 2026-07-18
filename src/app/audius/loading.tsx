export default function AudiusLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-20 h-7 rounded-lg bg-zao-card/60 animate-pulse" />
        </div>
      </nav>

      <section className="max-w-2xl mx-auto px-4 pt-14 pb-24">
        {/* Header */}
        <div className="text-center mb-10 animate-pulse">
          <div className="inline-block h-6 w-32 rounded-full bg-zao-card/60 mb-6" />
          <div className="h-9 w-56 rounded-lg bg-zao-card/60 mx-auto mb-3" />
          <div className="h-5 w-full max-w-sm rounded bg-zao-card/40 mx-auto mb-1" />
          <div className="h-5 w-3/4 rounded bg-zao-card/40 mx-auto" />
        </div>

        {/* Handle input */}
        <div className="card-dark p-8 animate-pulse">
          <div className="h-4 w-40 rounded bg-zao-card/60 mb-2" />
          <div className="flex gap-3">
            <div className="flex-1 h-11 rounded-lg bg-zao-card/40" />
            <div className="w-28 h-11 rounded-lg bg-zao-card/60" />
          </div>
          <div className="h-3 w-56 rounded bg-zao-card/40 mt-2" />
        </div>

        {/* Results placeholder */}
        <div className="mt-4 card-dark p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-zao-card/60 flex-shrink-0" />
            <div>
              <div className="h-5 w-32 rounded bg-zao-card/60 mb-1" />
              <div className="h-4 w-20 rounded bg-zao-card/40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center">
                <div className="h-7 w-12 rounded bg-zao-card/60 mx-auto mb-1" />
                <div className="h-3 w-16 rounded bg-zao-card/40 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
