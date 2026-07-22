import Link from "next/link";
import Flame from "./_components/Flame";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Flame className="h-16 w-16 flame-live" />
      <h1 className="mt-6 text-4xl font-bold tracking-tight">This spark fizzled.</h1>
      <p className="mt-3 text-muted">
        That page does not exist - but plenty of sparks do. Go find one.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-spark rounded-lg px-5 py-2.5 text-sm">
          Back home
        </Link>
        <Link
          href="/explore"
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted hover:text-foreground"
        >
          Explore the sparks
        </Link>
      </div>
    </main>
  );
}
