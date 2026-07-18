# V1 SCOPE — LOCKED (Sparkz product)

> This file is the product build contract for sparkz.xyz.
> Anything not listed here is DEFERRED until v1 ships and earns the right to grow.
> The Zoostr implementation scope lives in ~/sparkz/V1-SCOPE.md.

---

## What sparkz.xyz v1 includes

### Creator tools (all live)
- `/advisor` — 3-question advisor → recommended split + token timing + fee model
- `/split-wizard` — role-based split sheet, exportable JSON for 0xSplits
- `/tiers` — patronage tier wizard ($5/$25/$100 templates, Stripe-ready)
- `/back` — fan backing form (card payment, no wallet)
- `/settings` — BYOK (bring your own Anthropic key)
- `/vetted` — ZAO vetting application (50 slots/quarter)

### Discovery (all live)
- `/launches` — public launch registry
- `/launches/[slug]` — live detail page with Boostr stats, split config, receipts
- `/examples` — 7 tokenless spark templates (leaderboard, music collab, group crowdfund, PFP/NFT, light DAO, solo patronage, collab split no-token)
- `/examples/[slug]` — template detail pages with advisor deep-links

### Lifecycle + education (all live)
- `/lifecycle` — 5-stage spark lifecycle (Proposed → Emerging → Verified → Established → Federated)
- `/circles` — Culture Circles mechanic (sparks back other sparks; mutual backing before any token)
- `/how-it-works` — 0xSplits → Clanker technical walkthrough
- `/collectables` — ERC-1155 proof-of-contribution collectables spec
- `/audius` — Audius catalog → engagement metric connector

### API (server-side)
- `POST /api/advisor` — returns a full recommendation JSON from `{ situation, tokenTiming, feeModel }`; optional `x-relay-key` header for Viniapp Phase 2 integration

### Economics (settled, locked)
- Creator-first 1/1/98 default: creator 97%, treasury 2%, community 1% (grows from there)
- 2% treasury = 1% community governance + 1% ZOL compute upkeep (BYOK eliminates compute floor)
- ZAO stake: locked token supply (not a fee slice)

---

## What sparkz.xyz v1 DEFERS

| Feature | Why deferred |
|---------|-------------|
| Culture Coin launcher | Multi-creator onboarding pipeline — v2 |
| Alpha Radar / trend detection | Needs live corpus to train on |
| Autonomous posting | Guardrail violation — human gate always required in v1 |
| Multi-platform distribution router | v1 = Farcaster + X manual; automation is v2 |
| Governance module (on-chain voting) | Needs treasury size to justify gas spend |
| Creator dashboard (analytics) | Needs post-launch data |
| Remixer rewards on-chain | Needs token + leaderboard history |
| Quest Engine | Needs governance for reward budget |
| Reputation objects (on-chain) | Deferred pending Creator Coin protocol |

---

## The rule

> **ZOL drafts. Zaal (or designated human) approves. No module ships that removes a human gate.**

Any PR that adds autonomous publishing, autonomous treasury spend, or autonomous on-chain actions violates the v1 scope and must be rejected regardless of how good it looks.

---

*Last updated: 2026-07-18 · Locked — additions require Zaal sign-off*
