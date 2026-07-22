export default function CapsuleLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 flex gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-8 w-12" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
    </main>
  );
}
