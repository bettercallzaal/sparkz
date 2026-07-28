# Sparkz Operating Principles

> These principles govern every feature decision, copy line, and ZOL action in the Sparkz ecosystem.
> They are not aspirational — they are hard constraints. Any feature that violates them is rejected.
> Source: Brandon's Culture Coins design, ZAO design sessions 2026-07-17.

---

## 1. Extraction Guardrails (Brandon's first-class principles)

These principles prevent Sparkz from drifting into the extractive patterns that killed creator coins.

| Principle | What it means | What it rules out |
|-----------|--------------|-------------------|
| **Culture before price** | Culture, contribution, and community identity come first. Token mechanics serve the culture — never the reverse. | Launching a token as a marketing event. Measuring success by price. |
| **Attribution before extraction** | Every split, receipt, and fee flow must credit the contributor. You cannot extract without attributing. | Anonymous royalty pools. Unverifiable fee flow. |
| **Holding is not contribution** | Owning a token earns you nothing beyond optionality. Contribution — posting, boosting, remixing, showing up — earns fees. | Token-weighted governance that rewards whales. Passive holder dividends. |
| **Capability is not authority** | ZOL can draft. ZOL can compute. ZOL can suggest. ZOL does not sign, spend, or post without human approval. Technical capability does not confer decision authority. | Autonomous on-chain actions. Agent-initiated publishing. |
| **Founder-authority decay** | Creator control over the split decreases over time as the community matures. The Federated stage (Stage 5) means the community runs itself. | Permanent creator veto over community allocations. Forever-locked fee configs. |

---

## 2. The Culture Lifecycle

Every Sparkz community moves through five stages. Features unlock per stage. Token is NOT required to advance.

| Stage | Name | What defines it | Token? | Key unlock |
|-------|------|----------------|--------|------------|
| 1 | **Proposed** | Creator declares the spark; 0xSplits config drafted | No | Split wizard + advisor |
| 2 | **Emerging** | First backers / boosters appear; leaderboard non-empty | No | Live leaderboard + receipt |
| 3 | **Verified** | ZAO vets it; "ZAO-vetted" badge; consistent activity ≥ 4 weeks | No | Vetted badge + circles backing |
| 4 | **Established** | Token launched on Clanker; fee allocation live; collectables minting | Yes | Token + weekly split + collectables |
| 5 | **Federated** | Multiple Circles composably backing; community self-governs treasury | Yes (optional) | Culture Circles + light DAO |

Zoostr launched at Stage 2→3 (leaderboard already proven before token existed) and will cross Stage 4 at deploy.

---

## 3. ZOL Autonomy Tiers

ZOL operates in one of four tiers depending on context. Tier escalation requires human sign-off.

| Tier | Name | What ZOL does | Human gate |
|------|------|--------------|-----------|
| 1 | **Advisory** | Recommends splits, token timing, fee models. Drafts casts. | Human decides and acts. |
| 2 | **Creative** | Generates 3 cast variants, meme-engine drafts, receipt copy. | Human picks and approves. |
| 3 | **Guarded** | Runs snapshot, computes weights, formats splits-update.json. | Human reviews + executes updateSplit(). |
| 4 | **Mature** | Autonomously posts (never ships in v1). | Not available in v1 — hard blocked. |

Current v1 ZOL tier: **advisory + creative + guarded**. Never posts, signs, or spends without Zaal.

---

## 4. Framing Rules (locked 2026-07-17)

Use this language in ALL copy: site, casts, marketing, docs, advisor recommendations.

**Say this:**
- "Back the work" (not "buy the token")
- "Access, not speculation" (not "price will go up")
- "Claim your share at splits.org" (not "fees land in your wallet automatically")
- "Contribution → points → fee share" (not "passive income")
- "Weekly snapshot" (not "weekly distribution")
- "Fee allocation" (not "fee distribution" or "payouts")
- "Start with a spark, not a token" (before any token talk)
- "Generative, not extractive. Symbiotic, not parasitic."
- "ZAO-curated, not permissionless"

**Never say:**
- buy / invest / moon / pump / holders control
- passive income / auto-payout / no claiming required
- raise (use "fund" or "back")
- guaranteed (use "what contributors enjoy today")
- permissionless minting / anyone can launch

---

## 5. The V1 Human Gate (non-negotiable)

In v1, every action that touches money, posting, or on-chain state requires a human.

| Action | Who acts | ZOL's role |
|--------|----------|-----------|
| Deploy token on clanker.world | Human (Aziz or Zaal) | Prepares config; does NOT click deploy |
| Deploy 0xSplits contract | Human | Provides address; does NOT sign transaction |
| Update split weights on splits.org | Human | Provides splits-update.json; does NOT call updateSplit() |
| Post launch thread / receipt cast | Human (Zaal) | Drafts variants; human picks + posts |
| Approve weekly cast (detect-moment) | Human (Zaal) | Writes meme-engine-draft-*.md; human approves |
| Send backing payment (Stripe) | Fan (human) | /back form handles the flow; no agent spend |

The rule: **ZOL drafts. Humans decide. No module ships that removes a human gate.**

---

## 6. Fee Config Constraints

Any fee configuration shipped must pass these tests:

1. **Sum to 100%** — no rounding errors; splits-update.json total = 1,000,000 (base denominator)
2. **Pass the extraction test** — "a Farcaster skeptic cannot call this a skim." Community share must be defensible on first principles (contribution → reward), not just stated.
3. **Size treasury to solvency** — 1% ZOL compute floor must cover treasury compute outflow; seed with CEF early if needed.
4. **No auto-mint** — tokenization is explicit creator opt-in, never triggered by posting or engagement alone.
5. **No investment language** — the fee config is a monetization mechanism, never framed as "buying shares in the creator."

---

*Written by ZOL · 2026-07-28 · Binding on all Sparkz feature decisions · Update requires Zaal sign-off*
