# SHIP — sparkz.xyz launch sequence

> This is the exact sequence to merge PRs and deploy sparkz.xyz.
> All 118 PRs are draft. Merge in order. One human click per step.

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
| 20 | `feat/audius-image-fix` | next/image for Audius avatars; `**.audius.co` remote pattern — sparkz-product is now lint-warning-clean |
| 21 | `feat/split-wizard-share` | "Share on Farcaster ↗" link in split wizard review step — pre-fills cast with split config summary |
| 22 | `feat/back-success-share` | "Cast on Farcaster ↗" link on /back/success page — fans share their backing moment |
| 23 | `feat/examples-count-fix` | Fix "5 ways" → `SPARK_EXAMPLES.length` dynamic — now correctly shows 7 |
| 24 | `feat/examples-pattern-count` | Fix "The pattern across all five" → dynamic `SPARK_EXAMPLES.length` — matches hero |
| 25 | `feat/tiers-wizard-share` | "Share on Farcaster ↗" link in tier wizard export step — mirrors split wizard pattern |
| 26 | `feat/vetted-success-share` | "Cast your application ↗" link on /vetted success state — applying for a slot is a social signal |
| 27 | `feat/back-waitlist-share` | "Cast your spot ↗" link on /back waitlist success — joining is a social signal before launch |
| 28 | `feat/readme-update` | README: add pages table + SHIP.md reference — ready for public traffic |
| 29 | `feat/launch-detail-share` | "Share on Farcaster ↗" button on /launches/[slug] — in-page complement to the Frame embed |
| 30 | `feat/error-boundary` | Global error.tsx boundary + /launches/[slug] loading skeleton (animate-pulse) |
| 31 | `feat/loading-skeletons` | Homepage + advisor loading skeletons — shown during client-side navigation |
| 32 | `feat/tool-loading-skeletons` | Loading skeletons for split-wizard, tiers, back, vetted — all four tool pages |
| 33 | `feat/advisor-cast-copy` | Richer "Cast this result" text: shows actual split %, ZAO stake, token timing |
| 34 | `feat/settings-audius-loading` | Loading skeletons for /settings (BYOK form) and /audius (handle input) |
| 35 | `feat/ship-md-count-fix` | SHIP.md intro: correct PR count from 29 to 35 |
| 36 | `feat/homepage-examples-count` | Homepage USE_CASES: fix Spark examples count from 5 to 7, list all 7 templates |
| 37 | `feat/content-page-loading-skeletons` | Loading skeletons for /examples, /examples/[slug], and /launches |
| 38 | `feat/education-page-loading-skeletons` | Loading skeletons for /lifecycle, /circles, /how-it-works, /collectables |
| 39 | `feat/back-success-loading` | Loading skeleton for /back/success — completes full-site loading skeleton coverage |
| 40 | `feat/launches-live-description` | Remove hardcoded "34 boosters" from static copy in launches.ts + vetted page (live detail page carries accurate counts) |
| 41 | `feat/homepage-fee-split-copy` | Homepage USE_CASES: fix "50% of every fee" → accurate "configure what share" — aligns with creator-first default |
| 42 | `feat/split-wizard-copy-fix` | Split wizard: remove false "IPFS-attested" claim — wizard exports JSON; no IPFS upload in V1 |
| 43 | `feat/homepage-emoji-dedup` | Homepage USE_CASES: fix duplicate emojis (🎵→🎧 for Audius, 🎟→💳 for Fan backing) |
| 44 | `feat/readme-examples-accuracy` | README: fix /examples row (remove "tokenless" misnomer, list all 7 slugs) + add /examples/[slug] row |
| 45 | `feat/v1scope-examples-fix` | V1-SCOPE.md: remove "tokenless" misnomer from /examples row — 3 of 7 templates have tokenPath:'now' |
| 46 | `feat/examples-perk-framing-fix` | examples/[slug]: "What backers enjoy today" → dynamic label for tokenPath:'later' (perks conditional on token); group-crowdfund tokenNote: add "if and when" qualifier to definitive promise |
| 47 | `feat/launches-detail-pct-fix` | launches/[slug]: fix percentage calc — was dividing by top-5 points only; now divides by full contributor pool total, so shares shown are accurate |
| 48 | `feat/homepage-v2-descriptions` | homepage USE_CASES: fix Audius + Collectables descriptions — both used present tense for v2 features ("mints", "earn the most") under "What you can do today" header; rewritten to be accurate |
| 49 | `feat/audius-page-v2-framing` | audius/page.tsx: metadata description + hero paragraph claimed individual fan scoring is live — rewritten to distinguish today (catalog stats) from v2 (fan-level weights); "unlocks" list item 2 qualified with "(v2)" |
| 50 | `feat/no-claiming-accuracy` | spark-examples.ts: fix "no claiming — lands in wallet" perk (Pull split requires claiming at splits.org); lifecycle/page.tsx stage 4: fix "ZOL updates split weights" (ZOL drafts, Zaal executes updateSplit) + "fees landing in wallets" (claim required) |
| 51 | `feat/homepage-automatic-copy` | homepage: fix two "automatic" claims — USE_CASES fee-split description + Zoostr launch card; both implied auto-payout but Pull split requires claiming at splits.org |
| 52 | `feat/readme-collectables-fix` | README: fix "Collectables come standard. Backing earns collectables automatically." — collectables are v2 roadmap; updated to describe spec page + v2 timeline |
| 53 | `feat/examples-claiming-fix` | examples/page.tsx invariants: "No claiming — fees flow" → "Fees accumulate on-chain — claim at splits.org" |
| 54 | `feat/how-it-works-claiming-fix` | how-it-works hero para: "distributes automatically" → "accumulates in split — recipients claim at splits.org"; launches/[slug] share cast: "automatic" → "claim at splits.org" |
| 55 | `feat/back-wallet-copy-fix` | /back page disclaimer: remove false "custodial wallet provisioned automatically" — not implemented; replaced with accurate "email confirmation, no wallet or gas required" |
| 56 | `feat/tiers-wizard-onchain-claim-fix` | TiersWizard: fix two false on-chain claims — export JSON _next step + step 3 preview copy both claimed "proof of backing on-chain automatically"; V1 is Stripe + email only; on-chain backing proof is v2 |
| 57 | `feat/examples-nft-voting-fix` | spark-examples.ts: group-crowdfund noTokenAction claimed "NFT immediately" (v2); perks add v2 qualifier for NFT + voting; pfp-nft-community "Passive fee income" → "claim at splits.org" |
| 58 | `feat/advisor-stripe-copy-fix` | advisor.ts: "Revenue goes directly to your 0xSplits recipients" (false — Stripe doesn't auto-route to 0xSplits in V1); crowdfund rationale: "proposals and votes" → add v2 qualifier |
| 59 | `feat/dao-staking-v2-perks` | dao-staking example: perks presented as "What backers enjoy today" but staking + governance are v2; add v2 qualifiers to all 3 governance perks + splitConfig.note |
| 60 | `feat/launches-detail-claiming-note` | launches/[slug]: community pool note "weekly by contribution" + technical setup "Distribution" field both missing claim step; add "— claim at splits.org" to both |
| 61 | `feat/circles-claiming-fix` | /circles step 02: "wallets start receiving on-chain payments" → fee share accumulates on-chain, recipients claim at splits.org; Available now list: add claim note |
| 62 | `feat/collectables-split-claiming-note` | /collectables step 3: "contract distributes by weights" → fees accumulate in contract, allocated by weights; recipients claim at splits.org |
| 63 | `feat/split-wizard-how-it-works-claiming` | SplitWizard no-token review: "contract pays collaborators" → "holds revenue — claim at splits.org"; how-it-works step 02: "distributes to your list" → "claim at splits.org" |
| 64 | `feat/launches-zoostr-claiming-copy` | launches.ts Zoostr description: "to the leaderboard by points, weekly" → "allocated...by points. Claim at splits.org" |
| 65 | `feat/vetted-zoostr-claiming-copy` | /vetted EXAMPLES Zoostr description: same fix as PR #64 — mirrors launches.ts correction |
| 66 | `feat/ship-md-pr-count-update` | SHIP.md: update intro count 59→65 PRs; add rows for PRs #60–#65; date updated to 2026-07-18 |
| 67 | `feat/ship-md-pr-count-67` | SHIP.md: count 65→66; add row for PR #66 |
| 68 | `feat/collectables-weekly-distribution-fix` | collectables/page.tsx + homepage: "weekly distribution" → "weekly snapshot" (Pull model — minting happens at snapshot, not automatic payout) |
| 69 | `feat/ship-md-pr-count-69` | SHIP.md: count 65→68; add rows for PRs #66–#68 |
| 70 | `feat/byok-advisor-relay` | /api/advisor: wire BYOK key to Claude Haiku; AdvisorFlow: async fetch + ZOL-enhanced badge + loading skeleton; BYOKSettings + settings page: fix "never transmitted" claim |
| 71 | `feat/ship-md-pr-count-71` | SHIP.md: count 68→70; add rows for PRs #69–#70; AdvisorFlow: remove dead getRecommendation wrapper |
| 72 | `feat/spark-examples-notes-claiming-fix` | spark-examples.ts: splitConfig notes 'goes to'/'distributed to' imply auto-push — fixed to 'allocated to...claim at splits.org' for collab-split, group-crowdfund, dao-staking |
| 73 | `feat/ship-md-pr-count-72` | SHIP.md: count 68→72; add rows for PRs #69–#72 |
| 74 | `feat/collectables-body-snapshot-fix` | collectables/page.tsx hero body: "every weekly fee distribution mints" → "every weekly snapshot mints"; "percentage, payout" → "percentage, share" |
| 75 | `feat/ship-md-pr-count-74` | SHIP.md: count 72→74; add rows for PRs #73–#74 |
| 76 | `feat/collectables-fee-split-contract-fix` | collectables/page.tsx status box: "fee distribution contract" → "0xSplits contract" — avoids auto-distribution implication |
| 77 | `feat/ship-md-pr-count-76` | SHIP.md: count 74→76; add rows for PRs #75–#76 |
| 78 | `feat/collectables-specs-contract-name-fix` | collectables/page.tsx tech-specs row: "Sparkz distribution contract" → "0xSplits contract" |
| 79 | `feat/ship-md-pr-count-78` | SHIP.md: count 76→78; add rows for PRs #77–#78 |
| 80 | `feat/env-example-ship-md-env-fix` | add .env.example; SHIP.md env var table: "RESEND_TO_EMAIL" → "ZAO_NOTIFY_EMAIL", add RESEND_FROM_EMAIL |
| 81 | `feat/ship-md-pr-count-80` | SHIP.md: count 78→80; add rows for PRs #79–#80 |
| 82 | `feat/tiers-perk-token-allocation-legal-fix` | TiersWizard: remove "token allocation" from Empire default perk, perk suggestions, and step-5 wizard copy |
| 83 | `feat/ship-md-pr-count-82` | SHIP.md: count 80→82; add rows for PRs #81–#82 |
| 84 | `feat/circles-payout-framing-fix` | circles/page.tsx: "weekly fee payouts" → "weekly fee allocation" |
| 85 | `feat/ship-md-pr-count-84` | SHIP.md: count 82→84; add rows for PRs #83–#84 |
| 86 | `feat/readme-split-distribution-fix` | README.md: "first split distribution" → "first split update" |
| 87 | `feat/ship-md-pr-count-86` | SHIP.md: count 84→86; add rows for PRs #85–#86 |
| 88 | `feat/collectables-metadata-distribution-fix` | collectables/page.tsx: metadata description "weekly distribution" → "weekly snapshot" |
| 89 | `feat/ship-md-pr-count-88` | SHIP.md: count 86→88; add rows for PRs #87–#88 |
| 90 | `feat/collectables-tech-spec-snapshot-fix` | collectables/page.tsx: tech-spec Standard + Volume rows "weekly distribution" → "weekly snapshot" |
| 91 | `feat/ship-md-pr-count-90` | SHIP.md: count 88→90; add rows for PRs #89–#90 |
| 92 | `feat/homepage-collectables-snapshot-fix` | homepage: collectables USE_CASE card "weekly distribution" → "weekly snapshot"; "payout" → "share"; "first split distribution" → "first split update" |
| 93 | `feat/ship-md-pr-count-92` | SHIP.md: count 90→92; add rows for PRs #91–#92 |
| 94 | `feat/spark-examples-label-podcast` | spark-examples.ts: add record-label-roster and podcast-collective templates (7 → 9 examples) |
| 95 | `feat/ship-md-pr-count-94` | SHIP.md: count 92→94; add rows for PRs #93–#94 |
| 96 | `feat/spark-examples-count-9` | examples/page.tsx + homepage: update hardcoded "7 templates" → "9 templates" |
| 97 | `feat/ship-md-pr-count-96` | SHIP.md: count 94→96; add rows for PRs #95–#96 |
| 98 | `feat/examples-meta-count-9` | examples/page.tsx: metadata.description + OG + Twitter text "7 templates" → "9 templates" (missed by PR #96) |
| 99 | `feat/v1-scope-examples-count-9` | V1-SCOPE.md + README.md: examples count 7 → 9; add record-label-roster and podcast-collective to template lists |
| 100 | `feat/ship-md-pr-count-99` | SHIP.md: count 98→100; add rows for PRs #99–#100 |
| 101 | `feat/advisor-related-examples-update` | AdvisorFlow: RELATED_EXAMPLES — collab gets record-label-roster; solo gets podcast-collective |
| 102 | `feat/ship-md-pr-count-101` | SHIP.md: count 100→102; add rows for PRs #101–#102 |
| 103 | `feat/collectables-step4-snapshot-fix` | collectables/page.tsx step-4 'per distribution' → 'per weekly snapshot'; 'distribution payloads' → 'snapshot payloads'; launches/[slug] receipt card 'distribution breakdown' → 'allocation breakdown' |
| 104 | `feat/ship-md-pr-count-103` | SHIP.md: count 102→104; add rows for PRs #103–#104 |
| 105 | `feat/spark-examples-auto-push-fix` | spark-examples.ts record-label-roster note: remove "automatically" auto-push claim; all recipients claim at splits.org |
| 106 | `feat/ship-md-pr-count-105` | SHIP.md: count 104→106; add rows for PRs #105–#106 |
| 107 | `feat/spark-examples-routes-fix` | spark-examples.ts record-label-roster tokenNote: "routes fees to all stakeholders" → "split is already configured for all stakeholders" |
| 108 | `feat/ship-md-pr-count-107` | SHIP.md: count 106→108; add rows for PRs #107–#108 |
| 109 | `feat/collectables-allocation-field-label` | collectables/page.tsx WHAT_IS_ON_IT: field 'Distribution' → 'Allocation'; consistent with PR #103's allocation-breakdown language |
| 110 | `feat/ship-md-pr-count-109` | SHIP.md: count 108→110; add rows for PRs #109–#110 |
| 111 | `feat/spark-examples-direct-payments-fix` | spark-examples.ts collab-split-no-token tokenNote: 'direct payments to all contributors' → pull model + 'claim at splits.org' |
| 112 | `feat/ship-md-pr-count-111` | SHIP.md: count 110→112; add rows for PRs #111–#112 |
| 113 | `feat/examples-slug-spread-others` | examples/[slug]: spread 'other examples' at 0,⅓,⅔,last positions so record-label-roster + podcast-collective always get exposure |
| 114 | `feat/ship-md-pr-count-113` | SHIP.md: count 112→114; add rows for PRs #113–#114 |
| 115 | `feat/launches-link-component` | launches/page.tsx LaunchCard: native &lt;a&gt; → Next.js &lt;Link&gt; for route prefetching (Link was already imported but unused) |
| 116 | `feat/ship-md-pr-count-115` | SHIP.md: count 114→116; add rows for PRs #115–#116 |
| 117 | `feat/components-internal-link-fix` | 5 components (AdvisorFlow, VettingApplication, AudiusConnect, TiersWizard, SplitWizard): internal &lt;a href&gt; → Next.js &lt;Link&gt; |
| 118 | `feat/ship-md-pr-count-117` | SHIP.md: count 116→118; add rows for PRs #117–#118 |

---

## Step 2: Vercel environment variables

After merging all PRs, set these in Vercel → Project → Settings → Environment Variables:

| Variable | Value | When |
|----------|-------|------|
| `NEXT_PUBLIC_BASE_URL` | `https://sparkz.xyz` | Before first deploy |
| `STRIPE_SECRET_KEY` | `sk_live_...` | When Stripe account is ready; omit to run in waitlist mode |
| `RESEND_API_KEY` | `re_...` | When Resend account is ready; omit to skip email |
| `RESEND_FROM_EMAIL` | `sparkz@sparkz.xyz` | From address for Resend emails; default is sparkz@sparkz.xyz |
| `ZAO_NOTIFY_EMAIL` | `zaalp99@gmail.com` | Where vetting applications and backing notifications go |
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
- [ ] `https://sparkz.xyz/examples` — 9 template cards visible (including patronage-solo, collab-split-no-token, record-label-roster, podcast-collective)
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

*Prepared by ZOL · 2026-07-18 · All code is ready. Human merges, Vercel deploys, Zaal verifies.*
