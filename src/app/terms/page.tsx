import type { Metadata } from "next";
import Link from "next/link";
import { canonicalOrigin } from "@/lib/origin";

const BASE = canonicalOrigin();
const UPDATED = "25 November 2026";

export const metadata: Metadata = {
  title: "Terms of Use - Sparkz",
  description: "The rules for using Sparkz: what you may post, zero tolerance for objectionable content, and how reports work.",
  alternates: { canonical: `${BASE}/terms` },
};

// Terms of Use for the website and the iOS app (App Store guideline 1.2: an app with
// user content needs terms people agree to, with no tolerance for objectionable content
// or abusive users). People agree by signing in, opening a Hearth or lighting a Spark;
// each of those says so with a link here. Zaal reviews this wording before it merges.
const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What Sparkz is",
    body: [
      "Sparkz is an open-source experiment from The ZAO, a place to start and back ZAO projects. Anyone can fork the code.",
      "Sparkz is provided as is, while it is still being built. It may change, break, or go away.",
    ],
  },
  {
    heading: "Signing in",
    body: [
      "You can sign in with Farcaster or with a wallet. Other sign-in options may come later. You can look around Sparkz without signing in.",
      "Keep your wallet and sign-in safe. You are responsible for what is done with your sign-in.",
    ],
  },
  {
    heading: "Agreeing to these terms",
    body: [
      "By signing in to Sparkz, opening a Hearth or lighting a Spark, you agree to these terms. If you do not agree, do not use Sparkz.",
      "You must be 13 or older to use Sparkz.",
    ],
  },
  {
    heading: "Zero tolerance for objectionable content",
    body: [
      "Sparkz has zero tolerance for objectionable content and abusive users. Do not post anything that is hateful, harassing, threatening, sexually explicit, violent, illegal, or that exploits or endangers children.",
      "Do not post spam, scams, or content that impersonates someone else.",
      "Only post work you made or have the right to share.",
      "Breaking these rules gets the content removed and can get you removed from Sparkz, without warning.",
    ],
  },
  {
    heading: "Reporting and blocking",
    body: [
      "Every Hearth and every Spark has a menu (...) to report it or to block the person behind it.",
      "Reports go to the Sparkz team only. We review every report within 24 hours and remove content that breaks these terms, along with the account that posted it where needed.",
      "Blocking someone hides their Hearths and Sparks from you right away. You can unblock them on the Me page.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You keep ownership of what you post. You let Sparkz show it on trysparkz.com and in the Sparkz app so the Hearth works.",
      "Hearth pages are public. Do not post anything you want kept private.",
      "When you upload an image or file, you confirm you have the right to share it.",
      "A new Hearth or Spark may wait for an admin to approve it before it shows in Explore. The Sparkz team can edit, hide or remove any Hearth or Spark that breaks these terms.",
    ],
  },
  {
    heading: "Backing, not buying",
    body: [
      "Boosting or backing a Hearth is support for the work. It is not a purchase of anything and promises nothing back.",
    ],
  },
  {
    heading: "Other services (poidh, Clanker, Empire Builder)",
    body: [
      "Bounties run on poidh, on the Base network. Tokens are launched with Clanker and Empire Builder. These are separate services run by other people, with their own terms. Sparkz links to them and shows what they publish.",
      "Sparkz does not hold, send or look after anyone's funds. Anything you fund, claim or launch happens through those services and your own wallet, and on-chain actions cannot be undone.",
    ],
  },
  {
    heading: "No promises",
    body: [
      "Nothing on Sparkz is financial, legal or tax advice. Sparkz makes no promise about what any project, bounty or token will be worth, or that it will do anything at all.",
    ],
  },
  {
    heading: "Open source",
    body: [
      "The Sparkz code is open source under the Apache License 2.0. You can read the licence in the code repository. It covers the code, not your content or the names and logos of other people's projects.",
    ],
  },
  {
    heading: "Your data",
    body: [
      "You can delete what Sparkz stores about you at any time with Delete your Sparkz data on the Me page. It is refused while you still own a live Hearth, so give it to someone or put it to sleep first. Your on-chain records and your wallet stay as they are. See the Privacy page for what it removes.",
    ],
  },
  {
    heading: "Changes",
    body: ["If these terms change, we update this page and the date at the top."],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 space-y-10">
      <section>
        <h1 className="text-4xl font-bold mb-3">Terms of Use</h1>
        <p className="text-muted text-sm">Last updated {UPDATED}.</p>
        <p className="text-muted leading-relaxed mt-4">
          These terms cover trysparkz.com and the Sparkz iOS app, which loads the same site.
          Sparkz is open source and part of The ZAO.
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
        Questions or problems? See the{" "}
        <Link href="/support" className="text-accent-3 hover:underline">
          Support
        </Link>{" "}
        page, or write to us at{" "}
        <a
          href="https://github.com/bettercallzaal/sparkz/issues"
          target="_blank"
          rel="noreferrer"
          className="text-accent-3 hover:underline"
        >
          github.com/bettercallzaal/sparkz/issues
        </a>
        . See also{" "}
        <Link href="/privacy" className="text-accent-3 hover:underline">
          Privacy
        </Link>
        .
      </section>
    </main>
  );
}
