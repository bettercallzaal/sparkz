import Link from "next/link";
import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/origin";
import AudiusDemo from "@/app/_components/AudiusDemo";

export const dynamic = "force-static";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Audius integration - Sparkz",
  description:
    "Link an artist's Audius catalog to their Hearth - read live from the Audius public API. No wallet, no coin.",
  openGraph: {
    title: "Audius x Sparkz",
    description: "Your Audius catalog, live on your Hearth.",
    url: `${BASE}/audius`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audius x Sparkz",
    description: "Your Audius catalog, live on your Hearth.",
  },
};

const WHY = [
  {
    title: "Music-native",
    body: "Audius creators already have a streaming audience. Bring that catalog to your Hearth - no new community to build.",
  },
  {
    title: "Your whole catalog",
    body: "Every track you've released on Audius, pulled live onto your Hearth. Your music is the proof of the work.",
  },
  {
    title: "Live, not manual",
    body: "Track count, followers, and your latest releases read live from the Audius public API. Nothing faked, nothing to keep updated by hand.",
  },
  {
    title: "Open + free",
    body: "No API key, no wallet, no coin. Just your public Audius catalog, linked to your Hearth.",
  },
];

export default function AudiusPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Hero */}
      <section className="pt-14 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">
          Audius x Sparkz
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Your Audius catalog,<br />live on your Hearth.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Audius is where music-native creators already have an audience. Link your Audius
          handle and your catalog shows up on your Hearth - read live from the Audius public
          API. No wallet, no coin.
        </p>
      </section>

      {/* Live demo - real proof */}
      <section className="pb-8">
        <AudiusDemo />
      </section>

      {/* Why */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          Why Audius
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 font-medium text-foreground">{w.title}</div>
              <p className="text-sm text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          How it works
        </h2>
        <ol className="space-y-3 text-sm text-muted">
          <li>
            <span className="font-semibold text-foreground">1. Link your handle.</span> Set
            your Hearth&apos;s Audius handle - that&apos;s it.
          </li>
          <li>
            <span className="font-semibold text-foreground">2. Your catalog appears.</span>{" "}
            Sparkz reads your public catalog (tracks, followers, latest releases) live from the
            Audius API. Nothing to upload or maintain.
          </li>
          <li>
            <span className="font-semibold text-foreground">3. It stays current.</span> Release
            on Audius, and it shows up on your Hearth automatically.
          </li>
        </ol>
        <p className="mt-4 text-xs text-muted">
          Audius is the first live API spoke. The integration is open source -
          <Link href="/architecture" className="text-accent hover:underline">
            {" "}see how spokes work
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-10">
        <Link href="/start" className="btn-spark inline-block rounded-lg px-5 py-2.5 font-semibold">
          Start a Hearth
        </Link>
      </section>
    </main>
  );
}
