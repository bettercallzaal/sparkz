import Flame from "@/app/_components/Flame";
import StartForm from "@/app/_components/StartForm";

export const dynamic = "force-static";

export const metadata = {
  title: "New Hearth",
  description: "Hearths open by invitation while Sparkz is in alpha. Ask for one here. No wallet needed.",
  openGraph: {
    title: "New Hearth",
    description: "Hearths open by invitation while Sparkz is in alpha. Ask for one here.",
    images: [{ url: "/api/og?title=New%20Hearth&subtitle=Hearths%20open%20by%20invitation%20during%20the%20alpha.", width: 1200, height: 800 }],
  },
};

export default function StartPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-3">
        <Flame className="h-9 w-9 flame-live" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Hearth</h1>
          <p className="text-sm text-muted">A home for your project. No wallet needed.</p>
        </div>
      </div>

      <div className="card-solid p-5">
        <StartForm />
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {/* Zaal, 2026-11-19: opening a Hearth is allowlist-only for now (#408). Say so,
            instead of promising every visitor a Hearth in a minute. */}
        Hearths open by invitation while Sparkz is in alpha. If you are on the list, the
        form above opens yours; if not, join the waitlist and we will reach out. Every
        show, drop or launch after that is a Spark that grows it.
      </p>
    </main>
  );
}
