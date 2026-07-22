# Sparkz v1 scope (two-track: ship a floor, keep innovating)

V1 is the FLOOR, not the ceiling. Two parallel tracks so we hit neither failure mode (endless architecture that never ships / shipping something that's obsolete on arrival):

- **SHIP TRACK** - build and prove ONE complete economic loop (Zoostr).
- **INNOVATION TRACK** - continuously design/prototype the larger Sparkz system.

## The north star (the full system - 4 entry points, all Capsule-first)

Every Sparkz project begins as a **Capsule**, not a coin. The coin is an optional economic *output* of the Capsule. The Capsule accumulates identity, contributors, history, lore, content/code, contribution records, supporters, receipts, reputation, governance, economic config, and Meme Engine memory. This is how Sparkz serves pre-token / tokenized / permanently-tokenless / sponsored / membership / bounty / event projects - not betting the business on speculation.

Four connected entry points (schema supports all; v1 builds one):
1. **Creator Coin** - monetize a person + their work/audience/collaborators.
2. **Culture Coin** - monetize + coordinate a community/movement/scene/event.
3. **Open-Source Project** - monetize repos/contributors/maintainers/dependencies. Build ABOVE Drips (which already routes onchain money to maintainers + deps), don't recreate it. This is "the golden standard for monetizing open source."
4. **Meme Engine** - the cultural intelligence + distribution + community-mobilization system powering all three.

**The moat** = the combined accumulating system (Capsules + contribution graphs + cultural memory + trend history + meme lineage + community mobilization + economic routing + cross-platform attribution + receipts + performance data). The more Sparkz operates, the smarter every Capsule gets. NOT the token contract, NOT image generation.

## What ships in v1 (the honest floor - amended, NOT exploded)

Zoostr, as a Creator Capsule:
- **Zoostr Creator Capsule** + pre-token backing (spark; no token required).
- **Fiat-or-BYOK onboarding** (card, no wallet; non-technical creators draw compute from the Sparkz treasury).
- **Human-triggered Meme Engine loop**, built behind a **replaceable adapter** so trend-sources are swappable later without a rebuild:
  `interface SignalSource { detectSignals(capsuleId): Promise<CulturalSignal[]> }` - v1's source is a human/ZOL; Alpha Radar plugs into the same interface later.
  Loop: human flags a moment -> Sparkz drafts 3 Capsule-grounded responses -> human approves -> publish -> **Community Swarm** (members remix approved templates in a time-boxed mission) -> attribution + performance tracking -> reward useful contributors -> post-campaign learning report.
- **Community Swarm is the real v1 product** - rewards do NOT have to be a token: points, reputation, leaderboard position, collectables, access, perks, launch-allocation eligibility, sponsor-funded rewards.
- **Meme Receipts from day one** (the data moat): original signal, why it matched the Capsule, creator, approver, source assets, parent meme, versions, remixes, contributors, reach, referrals, backing generated, rewards, lessons. Cheap to add; irreplaceable later.
- **1/1/98 creator-first economics** + 0xSplits distribution wallet if/when a token launches (Clanker adapter).
- **FEF (Farcaster Eats First) as a protocol rule**: first announcement, first participation round, first quest, first backing window, first collectable, first contributor rewards all go to Farcaster first; distribute outward later.
- Contributor leaderboard + measurable links.
- **Culture Coin + Open-Source-repo templates preserved in the schema** (not built for Zoostr, but the data model supports them so v1.5 is additive, not a migration).

## The v1 proof (reframed)

NOT "we launched Zoostr's coin." The proof is: **Sparkz turned Zoostr's supporters into an attributable cultural distribution network, measured what they created, rewarded the useful contributors, and learned how to improve the next campaign.** That's Gates 1-3 below.

## Product gates (the proof sequence)

- **Gate 1** - Can Zoostr create active backers? (v1)
- **Gate 2** - Can the Community Swarm generate independent distribution? (v1)
- **Gate 3** - Can Sparkz correctly attribute + reward contribution? (v1)
- **Gate 4** - Can the same machinery work for ZAOstock? (v1.5)
- **Gate 5** - Can it work for an open-source repository? (v1.5 - the OSS entry point)
- **Gate 6** - Can trend detection outperform human-only discovery? (v2 - Alpha Radar earns its place here)
- **Gate 7** - Can the system operate safely with increasing autonomy? (v2+)

## Anti-failure gate (every proposed feature must pass all 4, or it stays in the lab)

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Capsule's proprietary data?
4. Can it be tested with a real project within 30 days?

## Deferred (INNOVATION track, preserved in schema, NOT v1)

- **Contribution Graphs** full build (Upgrade 4) - track code + reviews + docs + issues + design + distribution + revenue with evidence/weighting; propose sponsorship splits/bounties/allocations. v1.5, on the Drips primitive.
- **Experiment Engine** (Upgrade 7) - per-Capsule A/B testing with experiment receipts. v1.5/v2.
- **Culture Health Dashboard** (Upgrade 8) - contributor/retention/remix/participation metrics independent of token price. v1.5.
- **Alpha Radar** - build progressively: V1 Human Radar (this) -> V1.5 Community Radar -> V2 Connected Radar -> V2.5 Velocity Radar -> V3 Predictive. START STORING clean historical signal data NOW (via Meme Receipts) so V3 ML has something proprietary to learn from.
- **Culture Coin launcher** (governance/treasury) - after the MIDAO/Greg legal wrapper.
- **Autonomous posting tiers** - v1 is human-in-the-loop.

## Why this sequencing

The Meme Engine is the moat, so it's prototyped FIRST - but as the smallest end-to-end loop behind swappable adapters, with receipts capturing data from day one. The adapter interface + Meme Receipts are the cheap future-proofing that lets the INNOVATION track upgrade the system continuously without ever rebuilding what shipped. Contribution graphs, experiment engine, and the dashboard are additive v1.5/v2 - preserved in the schema, not built for Zoostr.
