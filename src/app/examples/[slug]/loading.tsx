export default function ExampleDetailLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            <span className="text-gradient-gold">SPAR</span>
            <span className="text-white">KZ</span>
          </div>
          <div className="w-28 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24 space-y-8">
        {/* Header */}
        <div>
          <div className="w-14 h-14 rounded bg-zao-card/60 animate-pulse mb-4" />
          <div className="w-72 h-9 rounded bg-zao-card/60 animate-pulse mb-2" />
          <div className="w-full h-6 rounded bg-zao-card/40 animate-pulse mb-2" />
          <div className="w-40 h-4 rounded bg-zao-card/40 animate-pulse" />
        </div>

        {/* The situation card */}
        <div className="card-dark p-6">
          <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-4/5 h-4 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>

        {/* What you can do TODAY card */}
        <div className="card-dark p-6">
          <div className="w-56 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-3/4 h-4 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>

        {/* Community metric card */}
        <div className="card-dark p-6">
          <div className="w-36 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-5/6 h-3 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>

        {/* Recommended fee split card */}
        <div className="card-dark p-6">
          <div className="w-44 h-3 rounded bg-zao-card/40 animate-pulse mb-5" />
          <div className="space-y-4 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse" />
                  <div className="w-10 h-3 rounded bg-zao-card/60 animate-pulse" />
                </div>
                <div className="h-2 bg-zao-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zao-card/60 rounded-full animate-pulse"
                    style={{ width: `${60 - i * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="w-48 h-3 rounded bg-zao-card/40 animate-pulse" />
        </div>

        {/* What backers enjoy today */}
        <div className="card-dark p-6">
          <div className="w-44 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded bg-zao-card/60 animate-pulse flex-shrink-0 mt-0.5" />
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Token path */}
        <div className="card-dark p-6">
          <div className="w-48 h-3 rounded bg-zao-card/40 animate-pulse mb-3" />
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>

        {/* 2-col CTA grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card-dark p-5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded bg-zao-card/60 animate-pulse" />
              <div className="w-36 h-4 rounded bg-zao-card/60 animate-pulse" />
              <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Other examples 2x2 */}
        <div>
          <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 card-dark p-4">
                <div className="w-10 h-10 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-4 rounded bg-zao-card/60 animate-pulse" />
                  <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
