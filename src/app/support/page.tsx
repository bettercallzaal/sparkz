import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "Support - Sparkz",
  description: "How to report content, block a person, delete your data, and reach the Sparkz team.",
  alternates: { canonical: `${BASE}/support` },
};

const ISSUES = "https://github.com/bettercallzaal/sparkz/issues";

const SECTIONS = [
  {
    heading: "Report content",
    body:
      "On any Hearth or Spark, open the menu and choose Report, then pick a reason. Reports go to the Sparkz team only. We review every report within 24 hours and remove content that breaks the Terms of Use, along with the account that posted it where needed.",
  },
  {
    heading: "Block a person",
    body:
      "Open the menu on their Hearth or Spark and choose Block. Blocked people are hidden from you. You can see and undo your blocks on the Me page, under Blocked.",
  },
  {
    heading: "Delete your data",
    body:
      "Open the Me page and choose Delete your Sparkz data. Deleting is refused while you still own a live Hearth.",
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium">Support</h1>
        <p className="text-muted leading-relaxed">
          Sparkz is The ZAO&apos;s home for ZAO projects. Need help, or want to report something? Start here.
        </p>
      </header>

      {SECTIONS.map((s) => (
        <section key={s.heading} className="space-y-2">
          <h2 className="text-base font-medium">{s.heading}</h2>
          <p className="text-muted leading-relaxed">{s.body}</p>
        </section>
      ))}

      <section className="space-y-2">
        <h2 className="text-base font-medium">Contact the team</h2>
        <p className="text-muted leading-relaxed">
          Send questions or problems to{" "}
          <a href={ISSUES} target="_blank" rel="noreferrer" className="text-accent-3 hover:underline">
            github.com/bettercallzaal/sparkz/issues
          </a>
          .
        </p>
      </section>

      <section className="text-sm text-muted">
        Read the{" "}
        <Link href="/terms" className="text-accent-3 hover:underline">
          Terms of Use
        </Link>{" "}
        and the{" "}
        <Link href="/privacy" className="text-accent-3 hover:underline">
          Privacy Policy
        </Link>
        .
      </section>
    </main>
  );
}
