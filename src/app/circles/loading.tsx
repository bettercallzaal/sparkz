export default function CirclesLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-28 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-10">
        <div className="w-64 h-12 rounded bg-zao-card/60 animate-pulse mb-2" />
        <div className="w-52 h-10 rounded bg-zao-card/60 animate-pulse mb-5" />
        <div className="space-y-2 max-w-2xl">
          <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </section>

      {/* How it works — 4 step cards */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="w-32 h-4 rounded bg-zao-card/40 animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-dark p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-48 h-5 rounded bg-zao-card/60 animate-pulse" />
                  <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse" />
                </div>
                <div className="w-20 h-5 rounded-full bg-zao-card/40 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                <div className="w-5/6 h-3 rounded bg-zao-card/40 animate-pulse" />
                <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mechanics card */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="card-dark p-6 sm:p-8">
          <div className="w-36 h-5 rounded bg-zao-card/60 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-20 h-3 rounded bg-zao-card/40 animate-pulse flex-shrink-0" />
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters 2-col */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="w-36 h-4 rounded bg-zao-card/40 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-dark p-5">
              <div className="w-36 h-4 rounded bg-zao-card/60 animate-pulse mb-2" />
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                <div className="w-5/6 h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA card */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="card-dark p-6 sm:p-8 text-center">
          <div className="w-40 h-7 rounded bg-zao-card/60 animate-pulse mx-auto mb-3" />
          <div className="space-y-2 max-w-lg mx-auto mb-6">
            <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="w-32 h-10 rounded bg-zao-card/60 animate-pulse" />
            <div className="w-32 h-10 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>
      </section>
    </main>
  )
}
