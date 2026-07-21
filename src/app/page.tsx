import Link from "next/link";
import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule, CapsuleType } from "@/lib/supabase/types";
import JoinForm from "./_components/JoinForm";

export const dynamic = "force-dynamic";

async function loadCapsules(): Promise<Capsule[]> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Capsule[]) ?? [];
  } catch {
    return [];
  }
}

const TYPE_LABEL: Record<CapsuleType, string> = {
  creator: "Creators",
  culture: "Culture",
  oss: "Open source",
  meme: "Meme",
};
const TYPE_ORDER: CapsuleType[] = ["creator", "culture", "oss", "meme"];

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
  const capsules = await loadCapsules();
  const byType = (t: CapsuleType) => capsules.filter((c) => c.type === t);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4">
      {/* Hero */}
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
          <JoinForm interest="landing" />
          <p className="mt-2 text-xs text-muted">
            Join the list. Part of the ZAO ecosystem.
          </p>
        </div>
      </section>

      {/* How it works */}
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

      {/* Ecosystem showcase */}
      <section className="border-t border-border py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            The ecosystem
          </h2>
          <Link href="/audit" className="text-xs text-muted hover:text-foreground">
            Brand audit -&gt;
          </Link>
        </div>

        {capsules.length === 0 ? (
          <p className="text-sm text-muted">
            Capsules are spinning up. Check back soon.
          </p>
        ) : (
          <div className="space-y-6">
            {TYPE_ORDER.filter((t) => byType(t).length > 0).map((t) => (
              <div key={t}>
                <h3 className="mb-2 text-xs uppercase tracking-wide text-muted">
                  {TYPE_LABEL[t]}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {byType(t).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/c/${c.slug}`}
                        className="block h-full rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{c.name}</span>
                          <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                            {c.status}
                          </span>
                        </div>
                        {c.bio && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {c.bio}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
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
          <span className="opacity-40">Discord - soon</span>
          <span className="opacity-40">Farcaster - soon</span>
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
