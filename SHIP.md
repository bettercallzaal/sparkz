# SHIP — sparkz.xyz launch sequence

> This is the exact sequence to merge PRs and deploy sparkz.xyz.
> All 19 PRs are draft. Merge in order. One human click per step.

---

## Step 0: Before you merge anything

Set up the GitHub repo:
- Ensure bettercallzaal/sparkz is connected to Vercel
- Set Vercel to auto-deploy from `main`

---

## Step 1: Merge PRs in order

Merge each PR to `main` before the next. They are stacked and depend on each other.

| # | Branch | What it adds |
|---|--------|-------------|
| 1 | `feat/product-v1` | Core site: split wizard, advisor, fiat backing, vetted, how-it-works, examples, audius |
| 2 | `feat/tiers-and-vetting` | Patronage tier wizard ($5/$25/$100) + Vetted by ZAO application |
| 3 | `feat/collectables` | Collectables spec page + OG image + Farcaster Frame meta |
| 4 | `feat/stripe-checkout` | Stripe checkout (env-var activated) + Resend email + back success page |
| 5 | `feat/launch-detail` | /launches/[slug] detail pages with live Boostr stats, top boosters, split config |
| 6 | `feat/advisor-creator-first` | Creator-first 1/1/98 default in advisor + split wizard + ZAO vetting CTA |
| 7 | `feat/lifecycle-page` | /lifecycle 5-stage spark model + sitemap fix for /launches/[slug] |
| 8 | `feat/byok-settings` | /settings BYOK page + Viniapp ?via= attribution badge on /advisor |
| 9 | `feat/v1-scope` | V1-SCOPE.md locked scope doc |
| 10 | `feat/culture-circles` | /circles Culture Circles page + homepage stats card + lifecycle Stage 5 CTA |
| 11 | `feat/advisor-examples-link` | Advisor "See it in action" related-example cards |
| 12 | `feat/advisor-api` | `/api/advisor` POST endpoint + shared `lib/advisor.ts` (Viniapp Phase 2 relay); V1-SCOPE.md updated |
| 13 | `feat/ship-guide` | SHIP.md updated with full env vars + 10→16 PR table (duplicate of row 10, correct branch is feat/ship-guide) |
| 14 | `feat/homepage-live-stats` | Live Zoostr stats card on sparkz.xyz homepage (green pulse, ISR 60s) |
| 15 | `feat/homepage-polish` | Homepage OG + Twitter + Farcaster Frame metadata; 4-column site footer with nav + legal disclaimer |
| 16 | `feat/shareability` | Advisor URL sync (answers → URL → shareable deep-links); "Cast this result" Warpcast compose link; /launches/[slug] OG + Frame metadata |
| 17 | `feat/og-sweep` | OG + Farcaster Frame metadata on examples/[slug], vetted, lifecycle, launches, circles; ESLint config + all lint errors fixed (Link/a, entities) |
| 18 | `feat/og-remaining` | OG + Farcaster Frame metadata on advisor, split-wizard, tiers, audius, collectables, how-it-works, back — all core product pages now Frames |
| 19 | `feat/split-wizard-token-config` | Token name/ticker/imageUrl/description fields in split wizard review step; exports `clankerDeploy` config when filled — complete deploy package in one JSON |

---

## Step 2: Vercel environment variables

After merging all PRs, set these in Vercel → Project → Settings → Environment Variables:

| Variable | Value | When |
|----------|-------|------|
| `NEXT_PUBLIC_BASE_URL` | `https://sparkz.xyz` | Before first deploy |
| `STRIPE_SECRET_KEY` | `sk_live_...` | When Stripe account is ready; omit to run in waitlist mode |
| `RESEND_API_KEY` | `re_...` | When Resend account is ready; omit to skip email |
| `RESEND_TO_EMAIL` | `zaalp99@gmail.com` | Where vetting applications and backing notifications go |
| `VINIAPP_RELAY_KEY` | any secret string | When Chris Dolinski is ready to connect Viniapp → `/api/advisor`; omit to leave endpoint open (POST still validates inputs) |

Without Stripe/Resend keys, the site runs in waitlist mode:
- `/back` — collects email + tier preference, shows "You're on the list" (no charge)
- `/vetted` — form submits but no email notification

---

## Step 3: Verify the deployment

After Vercel deploys:

- [ ] `https://sparkz.xyz` — hero loads, "Back the work →" CTA visible
- [ ] `https://sparkz.xyz/advisor` — 3 questions → recommendation renders
- [ ] `https://sparkz.xyz/split-wizard` — split config step → JSON export works
- [ ] `https://sparkz.xyz/tiers` — tier wizard → preview card shows
- [ ] `https://sparkz.xyz/back` — form submits → waitlist confirmation shows
- [ ] `https://sparkz.xyz/vetted` — form submits
- [ ] `https://sparkz.xyz/launches` — Zoostr launch card visible
- [ ] `https://sparkz.xyz/launches/zoostr` — live Boostr stats load (green pulse indicator)
- [ ] `https://sparkz.xyz/examples` — 7 template cards visible (including patronage-solo + collab-split-no-token)
- [ ] `https://sparkz.xyz/examples/patronage-solo` — loads; "no token ever" framing visible
- [ ] `https://sparkz.xyz/lifecycle` — 5-stage timeline visible
- [ ] `https://sparkz.xyz/settings` — BYOK form renders
- [ ] `https://sparkz.xyz/circles` — Culture Circles mechanic page visible
- [ ] `https://sparkz.xyz/audius` — Audius handle input renders; lookup returns catalog stats
- [ ] `https://sparkz.xyz/collectables` — page loads; steps visible
- [ ] `https://sparkz.xyz/how-it-works` — 0xSplits + Clanker walkthrough visible
- [ ] `https://sparkz.xyz/sitemap.xml` — all routes listed (17+ entries)
- [ ] `POST https://sparkz.xyz/api/advisor` with `{"situation":"solo","tokenTiming":"later","feeModel":"low"}` → returns `{"recommendation":{...}}`
- [ ] `https://sparkz.xyz` — OG image and Farcaster Frame tags present (paste in Warpcast composer → preview renders)
- [ ] `https://sparkz.xyz/advisor` — answer Q1 → URL updates to `?situation=...`; answer all 3 → "Cast this result ↗" link appears; advisor result links to split wizard pre-filled
- [ ] `https://sparkz.xyz/launches/zoostr` — share to Farcaster → Frame preview with Zoostr OG image + 2 CTA buttons
- [ ] `https://sparkz.xyz/advisor` — result shows "See it in action" related example cards
- [ ] Share any page (advisor, examples, tiers, audius) in Warpcast → Frame preview renders

---

## Step 4: Point Zoostr to the live sparkz.xyz

After sparkz.xyz is live, the Zoostr site's collectables teaser link (`https://sparkz.xyz/collectables`) will resolve. No code change needed — it's already wired.

---

## What stays deferred (see V1-SCOPE.md)

| Feature | When |
|---------|------|
| Stripe live payments (not waitlist) | When `STRIPE_SECRET_KEY` is set |
| Resend email notifications | When `RESEND_API_KEY` is set |
| `/advisor` Viniapp credits relay | Phase 2 — when Chris Dolinski confirms |
| `/audius` fan-level split weights | Phase 3 — needs Audius SDK authenticated sessions |
| Culture Coin launcher | v2 |
| Governance module | v2 |

---

*Prepared by ZOL · 2026-07-17 · All code is ready. Human merges, Vercel deploys, Zaal verifies.*
