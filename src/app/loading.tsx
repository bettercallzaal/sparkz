export default function HomeLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="skeleton h-7 w-48" />
      <div className="mt-2 skeleton h-4 w-64" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-40" />
              <div className="skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
