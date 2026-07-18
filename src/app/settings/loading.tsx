export default function SettingsLoading() {
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
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-36 rounded-lg bg-zao-card/60 mb-2" />
          <div className="h-4 w-full max-w-sm rounded bg-zao-card/40 mb-1" />
          <div className="h-4 w-3/4 rounded bg-zao-card/40" />
        </div>

        {/* BYOK form card */}
        <div className="card-dark p-8 animate-pulse">
          <div className="h-5 w-48 rounded bg-zao-card/60 mb-6" />

          <div className="space-y-5">
            <div>
              <div className="h-4 w-32 rounded bg-zao-card/60 mb-2" />
              <div className="h-11 w-full rounded-lg bg-zao-card/40" />
              <div className="h-3 w-48 rounded bg-zao-card/40 mt-1.5" />
            </div>
            <div>
              <div className="h-4 w-24 rounded bg-zao-card/60 mb-2" />
              <div className="h-11 w-full rounded-lg bg-zao-card/40" />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <div className="h-11 w-28 rounded-lg bg-zao-violet/20" />
            <div className="h-11 w-20 rounded-lg bg-zao-card/60" />
          </div>
        </div>

        {/* Info card */}
        <div className="mt-4 card-dark p-5 animate-pulse">
          <div className="h-4 w-40 rounded bg-zao-card/60 mb-3" />
          <div className="h-4 w-full rounded bg-zao-card/40 mb-1" />
          <div className="h-4 w-3/4 rounded bg-zao-card/40" />
        </div>
      </section>
    </main>
  )
}
