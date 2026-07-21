import type { Metadata } from "next";
import Link from "next/link";
import { loadPublicCapsules } from "@/lib/public-capsules";
import Ecosystem from "../_components/Ecosystem";
import JoinForm from "../_components/JoinForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spark your project, no token required",
  description:
    "Get early access to Sparkz - build community and backing first, tokenize later only if it makes sense.",
  openGraph: {
    title: "Try Sparkz",
    description: "Spark your project. No token required.",
    siteName: "Sparkz",
    type: "website",
  },
};

const POINTS = [
  "No token to start - back the work, not a coin",
  "Collectables + a boost engine from day one",
  "Launch a token later on the Clanker rail, only if it fits",
];

export default async function Try() {
  const capsules = await loadPublicCapsules();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      {/* Conversion-first hero: the join box leads. */}
      <section className="pt-20 pb-10 text-center sm:pt-28">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
          Try Sparkz
        </p>
        <h1 className="mx-auto max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Spark your project. No token required.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          Get early access to Sparkz - build community and backing first, tokenize
          later only if it makes sense.
        </p>
        <div className="mx-auto mt-8 max-w-md text-left">
          <JoinForm interest="trysparkz" />
          <p className="mt-2 text-center text-xs text-muted">
            Early access. No spam. Part of the ZAO ecosystem.
          </p>
        </div>

        <ul className="mx-auto mt-10 max-w-md space-y-2 text-left">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-muted">
          Projects already sparking
        </h2>
        <Ecosystem capsules={capsules} />
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <Link href="/" className="hover:text-foreground">
          What is Sparkz? -&gt;
        </Link>
      </footer>
    </main>
  );
}
