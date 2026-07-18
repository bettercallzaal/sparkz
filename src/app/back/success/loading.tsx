export default function BackSuccessLoading() {
  return (
    <main className="min-h-screen bg-zao-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-zao-card/60 animate-pulse mx-auto mb-6" />
        <div className="w-48 h-9 rounded bg-zao-card/60 animate-pulse mx-auto mb-3" />
        <div className="space-y-2 mb-8 max-w-xs mx-auto">
          <div className="w-full h-4 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-5/6 h-4 rounded bg-zao-card/40 animate-pulse mx-auto" />
          <div className="w-4/5 h-3 rounded bg-zao-card/40 animate-pulse mx-auto" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="w-44 h-10 rounded bg-zao-card/60 animate-pulse" />
          <div className="w-40 h-10 rounded bg-zao-card/40 animate-pulse" />
          <div className="w-44 h-10 rounded bg-zao-card/40 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
