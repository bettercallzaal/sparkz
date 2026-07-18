export default function CollectablesLoading() {
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

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24 space-y-12">
        {/* Header */}
        <div>
          <div className="w-40 h-6 rounded-full bg-zao-card/40 animate-pulse mb-6" />
          <div className="w-72 h-9 rounded bg-zao-card/60 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-3/4 h-4 rounded bg-zao-card/40 animate-pulse" />
          </div>
        </div>

        {/* Visual diagram placeholder */}
        <div className="flex justify-center">
          <div className="w-64 h-32 rounded-xl bg-zao-card/60 animate-pulse" />
        </div>

        {/* How you earn one — numbered steps */}
        <div>
          <div className="w-40 h-5 rounded bg-zao-card/60 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-dark p-5 flex gap-5">
                <div className="w-8 h-8 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 rounded bg-zao-card/60 animate-pulse" />
                  <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
                  <div className="w-5/6 h-3 rounded bg-zao-card/40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ERC-1155 metadata table */}
        <div className="card-dark p-6">
          <div className="w-40 h-3 rounded bg-zao-card/40 animate-pulse mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 py-2 border-b border-zao-border/50 last:border-0">
                <div className="w-28 h-3 rounded bg-zao-card/40 animate-pulse flex-shrink-0" />
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Why you can't buy these */}
        <div>
          <div className="w-44 h-5 rounded bg-zao-card/60 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded bg-zao-card/60 animate-pulse flex-shrink-0" />
                <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div className="card-dark p-6 space-y-3">
          <div className="w-40 h-5 rounded bg-zao-card/60 animate-pulse" />
          <div className="space-y-2">
            <div className="w-full h-3 rounded bg-zao-card/40 animate-pulse" />
            <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse" />
          </div>
          <div className="w-40 h-9 rounded bg-zao-card/60 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
