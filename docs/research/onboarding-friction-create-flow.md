---
topic: infrastructure
type: decision
tier: STANDARD
status: research-complete
last-validated: 2026-07-23
original-query: "how do high-traffic open-source / consumer apps do onboarding UX; make the Sparkz create flow smoother before wider testing"
outcome: BUILD
---

# Make the create flow smoother (onboarding-friction research)

The task: before testing Sparkz wider (Zabal Gamez, then others), tighten the
sign-in -> create -> Capsule handoff. Grounded in how high-traffic apps cut first-run
friction. Ends in a BUILD PR per the sparkz-research skill.

## Findings

### Time-to-value is the metric that moves completion (VERIFIED across multiple teardowns)

- Signup forms that take **over 60 seconds drop completion by ~27%**. Linear and Vercel
  complete registration in **under 20 seconds**; Slack/Notion/Linear use 3-field
  registration + SSO and clear **>78% completion**.
- Surface **one core value action within 5 minutes**. Notion gets a user to their first
  page in **~90 seconds**.
- **Figma loads a sample file at first login** so the user edits before they create -
  seeing a real example beats a blank canvas or a tour.
- Progressive, context-aware onboarding is replacing long upfront tours.

### Web3-specific: play-first, wallet-later (VERIFIED direction; percentages REPORTED)

- Social login lifts onboarding conversion **20-60%** vs email+password (web2 baseline,
  widely cited).
- Embedded-wallet / "play-first, wallet-later" flows are reported to cut onboarding
  friction **up to 90%** and correlate with **40%+ month-over-month retention** for
  crypto-new users. The exact percentages are vendor-reported (Dynamic, Fireblocks,
  Alchemy) - treat as directional, not quotable in a product surface.

**This validates the Sparkz core bet:** a spark needs no wallet and no coin to start.
The friction the whole space is trying to remove, Sparkz never adds. The research does
not ask us to change the model - it asks us to make the small create flow feel as fast
and as landed as the model already allows.

## Decision: BUILD

The gap was not the model, it was the moment: the create form did not focus, pressing
Enter did nothing, the redirect to the new Capsule gave no signal the spark had landed,
and a first-timer with zero sparks saw an empty panel with no reference. Four small,
zero-dependency changes, each mapped to a finding:

| Change | Finding it serves |
| --- | --- |
| Auto-focus the project-name field on `/start` and the signed-in create form | Cut seconds to first keystroke; sub-20s registration |
| Enter key submits the signed-in create form | Fewer actions to the one value action |
| Redirect to `/c/{slug}?lit=1` with a one-time "Your spark is lit" celebration (`SparkLit`), self-dismissing and URL-cleaning | Make the core value action feel landed within seconds |
| `YourSparks` empty state shows Zoostr as a live example instead of rendering nothing | Figma "see a real example before you create" |

Passes gate 1 (helps someone participate - a smoother path to a live spark), gate 2
(measurable: create->Capsule completion, time-to-first-spark), and gate 4 (testable with
Zabal Gamez inside 30 days - it is the current test).

### What it deliberately does NOT do

No embedded-wallet SDK, no new dependency, no auth change. The play-first model already
captures the biggest documented friction win; adding a wallet layer now would re-introduce
the thing the research says to avoid.

## Sources

- [Fireblocks - embedded wallets + social login](https://www.fireblocks.com/blog/embedded-wallets-with-social-login-the-standard-for-web3-onboarding) [SUMMARY - vendor, percentages REPORTED]
- [Dynamic - embedded wallets + social login](https://www.dynamic.xyz/blog/embedded-wallets-with-social-login-the-standard-for-web3-onboarding) [SUMMARY - vendor]
- [Alchemy - embedded wallets guide](https://www.alchemy.com/overviews/the-ultimate-guide-to-embedded-wallets-with-social-login) [SUMMARY - vendor]
- [Helius - frictionless web3 UX](https://www.helius.dev/blog/web3-ux) [SUMMARY]
- Web-search synthesis of Linear/Vercel/Notion/Figma onboarding teardowns (2026) [PARTIAL - aggregated teardown figures, not a single primary source]
- Sparkz code: `StartForm.tsx`, `CreateSparkAsFarcaster.tsx`, `SparkLit.tsx`, `YourSparks.tsx`, `c/[slug]/page.tsx` [FULL]

## Next Actions

| Action | Owner | By When |
| --- | --- | --- |
| Ship the four create-flow smoothness changes (this PR) | Zaal | 2026-07-23 (done) |
| Test create -> Capsule with Zabal Gamez, note any snag | Zaal | 2026-07-23 |
| Decide if embedded-wallet / dollar-backing is worth the friction it adds, when fiat/BYOK backing lands | Zaal | when backing goes live |
