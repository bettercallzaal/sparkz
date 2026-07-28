export default function DiscoverLoading() {
  return (
    <main className="min-h-screen bg-zao-dark">
      <nav className="border-b border-zao-border bg-zao-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="h-5 w-24 bg-zao-border rounded animate-pulse" />
          <div className="h-4 w-20 bg-zao-border rounded animate-pulse" />
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="h-4 w-32 bg-zao-border rounded animate-pulse mb-6" />
        <div className="h-10 w-64 bg-zao-border rounded animate-pulse mb-3" />
        <div className="h-4 w-96 bg-zao-border rounded animate-pulse" />
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zao-card border border-zao-border rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-zao-border rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-zao-border rounded" />
                    <div className="h-3 w-72 bg-zao-border rounded" />
                    <div className="h-3 w-56 bg-zao-border rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-zao-card border border-zao-border rounded-2xl p-5 animate-pulse h-36" />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
