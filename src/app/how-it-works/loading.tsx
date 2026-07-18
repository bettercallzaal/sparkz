export default function HowItWorksLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-28 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-14 pb-10">
        <div className="w-72 h-12 rounded bg-zao-card/60 animate-pulse mb-2" />
        <div className="w-48 h-10 rounded bg-zao-card/60 animate-pulse mb-5" />
        <div className="space-y-2">
          <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </section>

      {/* Architecture card */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="card-dark p-6">
          <div className="w-36 h-3 rounded bg-zao-card/40 animate-pulse mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-3 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                  <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly cycle — step cards */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="w-36 h-5 rounded bg-zao-card/60 animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-dark p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="w-40 h-5 rounded bg-zao-card/60 animate-pulse" />
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

      {/* Trust model table */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="w-28 h-5 rounded bg-zao-card/60 animate-pulse mb-6" />
        <div className="card-dark overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-zao-border/50 last:border-0">
              <div className="w-32 h-3 rounded bg-zao-card/40 animate-pulse flex-shrink-0" />
              <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              <div className="w-16 h-3 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* 3-col CTA grid */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-dark p-5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded bg-zao-card/60 animate-pulse" />
              <div className="w-32 h-4 rounded bg-zao-card/60 animate-pulse" />
              <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
