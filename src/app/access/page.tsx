import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();

export const metadata: Metadata = {
  title: "What you can do - Sparkz",
  description: "What you can do on Sparkz signed out, with an email, with a wallet, or with Farcaster.",
  alternates: { canonical: `${BASE}/access` },
};

// Like a pricing page, but for how you sign in (Zaal, 25 Nov call: "if you link this, you
// get these check mark features"). Keep each row true to the code it names:
//   boost        /api/boost       session FID or wallet address
//   my activity  /api/me/*        session FID only
//   team, list   /api/team, /api/waitlist   public, no sign-in
//   hats         FirstHat         the visitor's own wallet signs the claim
//   open Hearth  canCreateHearth  invite-only while HEARTH_CREATE_LOCK is on
//   coin launch  /api/empire/*    the Hearth owner, signing with their own wallet on Base
export type Tier = "out" | "email" | "wallet" | "farcaster";

export const TIERS: { key: Tier; name: string; how: string }[] = [
  { key: "out", name: "Just looking", how: "No sign-in" },
  { key: "email", name: "Email", how: "Join the list. Google sign-in is coming" },
  { key: "wallet", name: "Wallet", how: "Sign in with Ethereum" },
  { key: "farcaster", name: "Farcaster", how: "Sign in with Farcaster" },
];

export const ROWS: { feature: string; tiers: Tier[]; note?: string }[] = [
  { feature: "Browse every Hearth and Spark", tiers: ["out", "email", "wallet", "farcaster"] },
  { feature: "Join the Sparkz list", tiers: ["out", "email", "wallet", "farcaster"] },
  { feature: "Join a Spark's team", tiers: ["out", "email", "wallet", "farcaster"], note: "Add your name and wallet to the list" },
  { feature: "Boost a Hearth", tiers: ["wallet", "farcaster"], note: "Free, one boost per Hearth" },
  { feature: "Claim a free hat", tiers: ["wallet"], note: "Your wallet signs, you pay a little gas" },
  { feature: "See your activity and backings on Me", tiers: ["farcaster"] },
  { feature: "Open a Hearth", tiers: ["wallet", "farcaster"], note: "Invite-only during the beta" },
  { feature: "Run your Hearth: Sparks, bounties, settings", tiers: ["wallet", "farcaster"], note: "Hearth owners" },
  { feature: "Launch your Hearth's coin", tiers: ["wallet"], note: "Hearth owners, signed from your own wallet on Base" },
];

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span aria-label="yes" className="text-accent-3">
      ✓
    </span>
  ) : (
    <span aria-label="no" className="text-muted">
      ·
    </span>
  );
}

export default function AccessPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium">What you can do</h1>
        <p className="text-muted leading-relaxed">
          Anyone can look around. Signing in opens more. Here is what each way in gets you.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-3 text-left font-medium" scope="col">
                <span className="sr-only">Feature</span>
              </th>
              {TIERS.map((t) => (
                <th key={t.key} className="px-2 py-3 text-center align-bottom font-medium" scope="col">
                  <div>{t.name}</div>
                  <div className="text-xs font-normal text-muted">{t.how}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.feature} className="border-b border-white/5">
                <th className="py-3 pr-3 text-left font-normal" scope="row">
                  <div>{r.feature}</div>
                  {r.note ? <div className="text-xs text-muted">{r.note}</div> : null}
                </th>
                {TIERS.map((t) => (
                  <td key={t.key} className="px-2 py-3 text-center text-base">
                    <Mark on={r.tiers.includes(t.key)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-2 text-sm text-muted">
        <p>
          Sparkz never asks for your seed phrase or private key. Anything that costs money or goes on-chain is
          signed by you, in your own wallet.
        </p>
        <p>
          Questions? See{" "}
          <Link href="/support" className="text-accent-3 hover:underline">
            Support
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
