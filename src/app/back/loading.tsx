export default function BackLoading() {
  return (
    <main className="min-h-screen bg-zao-dark flex flex-col">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-20 h-7 rounded-lg bg-zao-card/60 animate-pulse" />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-pulse">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-zao-card/60 mx-auto mb-5" />
            <div className="h-8 w-48 rounded-lg bg-zao-card/60 mx-auto mb-3" />
            <div className="h-4 w-64 rounded bg-zao-card/40 mx-auto" />
          </div>

          {/* Form card */}
          <div className="card-dark p-6">
            {/* Tier selector */}
            <div className="mb-5">
              <div className="h-4 w-20 rounded bg-zao-card/60 mb-2" />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-zao-card/40" />
                ))}
              </div>
            </div>

            {/* Email field */}
            <div className="mb-5">
              <div className="h-4 w-28 rounded bg-zao-card/60 mb-2" />
              <div className="h-11 w-full rounded-lg bg-zao-card/40" />
            </div>

            {/* CTA button */}
            <div className="h-12 w-full rounded-lg bg-gold-500/20" />
          </div>

          <div className="mt-4 h-4 w-56 rounded bg-zao-card/40 mx-auto" />
        </div>
      </div>
    </main>
  )
}
