import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const UPDATED = "19 November 2026";

export const metadata: Metadata = {
  title: "Privacy - Sparkz",
  description: "What Sparkz collects, why, who else handles it, and how to have it removed.",
  alternates: { canonical: `${BASE}/privacy` },
};

// Plain privacy policy for the website and the iOS app (the app loads this site).
// Written from what the code actually stores (Zaal, 2026-11-19, for the public
// TestFlight beta). If a route starts collecting something new, update this page.
const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Email address, if you join the waitlist or start a Hearth with an email.",
      "Your Farcaster ID (FID) and public profile details such as username and avatar, if you sign in with Farcaster.",
      "Your wallet address, if you sign in with a wallet. We never see or store private keys.",
      "What you put into a Hearth: its name, bio, links, tags, images you upload, and boosts or backing you record. Hearth pages are public, so treat this as public content.",
      "A one-way hash of your IP address, used only to rate-limit actions like boosting. We do not store the IP itself.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "When you sign in we set one session cookie so you stay signed in. It lasts up to 7 days and is removed when you sign out.",
      "We do not use advertising cookies or third-party analytics trackers.",
    ],
  },
  {
    heading: "Why we use it",
    body: [
      "To run Sparkz: sign you in, show your Hearths, record boosts, and stop spam.",
      "To tell waitlist members when Sparkz opens to them.",
      "We do not sell your data and do not use it for advertising.",
    ],
  },
  {
    heading: "Who else handles it",
    body: [
      "Vercel hosts the site and stores uploaded images. Neon hosts the database.",
      "Farcaster and Reown (wallet connection) handle sign-in on their side; their own policies apply there.",
      "Some Hearth pages show public data pulled from Farcaster or Audius.",
    ],
  },
  {
    heading: "Beta testing",
    body: [
      "If you test the iOS app through TestFlight, Apple shares crash reports and the feedback and screenshots you choose to send. Apple's TestFlight terms cover that data.",
    ],
  },
  {
    heading: "Removing your data",
    body: [
      "Delete your account yourself on the Me page: Delete account removes your boosts, backings, team sign-ups and your name on Sparks you lit. Give any Hearth you own to someone, or put it to sleep, first.",
      "For anything else, such as your waitlist entry or a Hearth you own, ask us and we will delete it. Open an issue on our GitHub, or message us on Farcaster.",
    ],
  },
  {
    heading: "Children",
    body: ["Sparkz is not meant for children under 13, and we do not knowingly collect their data."],
  },
  {
    heading: "Changes",
    body: ["If this policy changes, we update this page and the date at the top."],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-10">
      <section>
        <h1 className="text-4xl font-bold mb-3">Privacy</h1>
        <p className="text-muted text-sm">Last updated {UPDATED}.</p>
        <p className="text-muted leading-relaxed mt-4">
          Sparkz is open source and part of The ZAO. This page covers trysparkz.com and the
          Sparkz iOS app, which loads the same site.
        </p>
      </section>

      {SECTIONS.map((s) => (
        <section key={s.heading}>
          <h2 className="font-bold text-lg mb-3">{s.heading}</h2>
          <ul className="space-y-2">
            {s.body.map((line) => (
              <li key={line} className="flex gap-3 text-sm">
                <span className="text-muted shrink-0" aria-hidden="true">
                  -
                </span>
                <span className="text-muted leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="text-sm text-muted">
        Contact:{" "}
        <a
          href="https://github.com/bettercallzaal/sparkz/issues"
          target="_blank"
          rel="noreferrer"
          className="text-accent-3 hover:underline"
        >
          github.com/bettercallzaal/sparkz/issues
        </a>
        . Back to{" "}
        <Link href="/" className="text-accent-3 hover:underline">
          Sparkz
        </Link>
        .
      </section>
    </main>
  );
}
