export default function ExploreLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="skeleton h-11 w-full rounded-xl" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-44" />
              <div className="skeleton h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
