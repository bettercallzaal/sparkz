export default function ExamplesLoading() {
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
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10">
        <div className="w-72 h-12 rounded bg-zao-card/60 animate-pulse mb-3" />
        <div className="w-48 h-10 rounded bg-zao-card/60 animate-pulse mb-6" />
        <div className="space-y-2 max-w-2xl">
          <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </section>

      {/* 7-card grid */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card-dark p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-zao-card/60 animate-pulse" />
              <div className="space-y-2">
                <div className="w-36 h-5 rounded bg-zao-card/60 animate-pulse" />
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
              <div className="mt-auto">
                <div className="w-32 h-5 rounded-full bg-zao-card/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern card */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="card-dark p-6 sm:p-8">
          <div className="w-44 h-3 rounded bg-zao-card/40 animate-pulse mb-6" />
          <div className="grid sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="w-32 h-4 rounded bg-zao-card/60 animate-pulse" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
