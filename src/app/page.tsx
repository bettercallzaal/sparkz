import Link from "next/link";
import { loadPublicHearths } from "@/lib/public-hearths";
import { pickShowcase } from "@/lib/showcase";
import JoinForm from "./_components/JoinForm";
import JoinTeamForm from "./_components/JoinTeamForm";
import ActivityStrip from "./_components/ActivityStrip";
import MyHome from "./_components/MyHome";
import Showcase from "./_components/Showcase";
import { iosBetaUrl } from "@/lib/ios-beta";

export const dynamic = "force-dynamic";

// What Sparkz is for, in three lines. Plain ZAO voice, from docs/strategy/positioning.md:
// back the album, not buy a coin; member-owned, not SaaS.
const GOALS = [
  {
    h: "Back the work",
    p: "Every ZAO project gets a Hearth: a home where people back the show, the festival, the music. No coin to buy, no wallet to start.",
  },
  {
    h: "Keep the record",
    p: "Every backer, helper and show is part of the record. The Hearth grows on it, and it stays in the open.",
  },
  {
    h: "Owned by its people",
    p: "Open source and member-owned. Contributors earn through The ZAO; nobody rents you a login.",
  },
];

// Design pass, Zaal 14 Nov 2026: simple, the goals visible, and the live ZAO Hearths up
// front. The showcase list is in lib/showcase.ts.
export default async function Home() {
  const { featured, others } = pickShowcase(await loadPublicHearths());
  const betaUrl = iosBetaUrl();

  return (
    <main className="w-full min-w-0 flex-1 overflow-x-hidden">
      <MyHome />
      {/* Public home. In the iPhone app, hidden once you are signed in (MyHome sets
          html[data-mine]); on the website it always shows. */}
      <div className="[html[data-shell=ios][data-mine]_&]:hidden">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
            style={{
              background:
                "radial-gradient(120% 80% at 50% -10%, rgba(232,198,106,0.10), transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:pt-14">
            <video
              className="h-14 w-14 rounded-xl"
              style={{ filter: "drop-shadow(0 8px 28px rgba(232,198,106,0.32))" }}
              autoPlay
              loop
              muted
              playsInline
              poster="/brand/sparkz-logo.png"
              aria-label="Sparkz - gold flame logo"
            >
              <source src="/brand/sparkz-logo.webm" type="video/webm" />
              <source src="/brand/sparkz-logo.mp4" type="video/mp4" />
            </video>
            <h1 className="mt-5 max-w-2xl text-[clamp(2rem,6.5vw,3.4rem)] font-bold leading-[1.02] tracking-tight">
              Back the album, <span className="spark-text whitespace-nowrap">not a coin.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              Sparkz gives every ZAO project a Hearth: one home for the people who back it,
              help it and show up for it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#showcase" className="btn-spark rounded-lg px-5 py-2.5 text-sm">
                See the Hearths
              </a>
              <Link
                href="/demo"
                className="rounded-lg border border-border px-5 py-2.5 text-sm hover:border-accent"
              >
                How it works
              </Link>
              {/* The iOS beta, website only: hidden inside the iPhone app, and absent until
                  SPARKZ_TESTFLIGHT_URL holds the public TestFlight link (lib/ios-beta.ts). */}
              {betaUrl && (
                <a
                  href={betaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-accent px-5 py-2.5 text-sm text-accent hover:bg-accent/10 [html[data-shell=ios]_&]:hidden"
                >
                  Try the iOS beta
                </a>
              )}
            </div>
          </div>
        </section>

        <section id="showcase" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
            Live in The ZAO
          </h2>
          <Showcase featured={featured} others={others} />
          <ActivityStrip />
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
              What Sparkz is for
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {GOALS.map((g) => (
                <div key={g.h}>
                  <div className="mb-1 font-semibold">{g.h}</div>
                  <p className="text-sm text-muted">{g.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <h2 className="text-lg font-semibold">Want a Hearth for your project?</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Sparkz is in alpha with The ZAO. Join the list and we will light yours next.
            </p>
            <div className="max-w-md">
              <JoinForm interest="sparkz" />
            </div>
          </div>
        </section>

        {/* Zaal, 2026-11-19: opening a Hearth stays allowlist-only, "but people can
            apply to be part of the sparkz team". Applications land in team_signups on
            the sparkz Hearth with source "apply"; admins read them at /admin/team. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <h2 className="text-lg font-semibold">Help build Sparkz</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Sparkz is open source and built in the open with The ZAO. Apply to the team
              with a name and a wallet.
            </p>
            <div className="max-w-md">
              <JoinTeamForm sparks={[{ slug: "sparkz", name: "Sparkz" }]} source="apply" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
