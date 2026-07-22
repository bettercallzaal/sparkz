import Link from "next/link";
import { loadPublicCapsules } from "@/lib/public-capsules";
import Ecosystem from "./_components/Ecosystem";
import JoinForm from "./_components/JoinForm";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    h: "Start with a spark",
    p: "Open a Capsule - identity, backing, receipts. No token, no wallet required.",
  },
  {
    n: "2",
    h: "Build momentum",
    p: "Supporters back the work and collect what you make. The Meme Engine amplifies the moments that land.",
  },
  {
    n: "3",
    h: "Graduate, only if it fits",
    p: "If the energy is there, launch a token later on the Clanker rail. Some do, some never. That is fine.",
  },
];

export default async function Home() {
  const capsules = await loadPublicCapsules();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4">
      <section className="pt-16 pb-12 sm:pt-24">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Sparkz
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Start with a spark, not a token.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Every Sparkz project is a Capsule, not a coin. Build community and backing
          first - collectables, a boost engine, receipts that compound. A token is
          optional, later, if ever. Back the album, not buy a coin.
        </p>
        <div className="mt-8 max-w-md">
          <JoinForm interest="sparkz" />
          <p className="mt-2 text-xs text-muted">
            Join the list. Part of the ZAO ecosystem.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-sm font-semibold text-accent">{s.n}</div>
              <div className="mb-1 font-medium">{s.h}</div>
              <p className="text-sm text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            The ecosystem
          </h2>
          <Link href="/explore" className="text-xs text-accent hover:underline">
            Explore all -&gt;
          </Link>
        </div>
        <Ecosystem capsules={capsules} />
      </section>

      <footer className="border-t border-border py-10 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href="https://github.com/bettercallzaal/sparkz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/demo" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <a href="/architecture" className="hover:text-foreground">
            Architecture
          </a>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Sign in with Farcaster
          </Link>
          <span className="opacity-40">Discord - soon</span>
          <Link href="/admin" className="hover:text-foreground">
            Operator
          </Link>
        </div>
        <p className="mt-4 text-xs">
          Sparkz - back the work, build the collective, earn transparently. Part of
          the ZAO ecosystem.
        </p>
      </footer>
    </main>
  );
}
