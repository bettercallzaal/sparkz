# Sparkz Architecture - the two-track strategy

> V1 is the floor, not the ceiling. Keep the build focused enough to ship, while continuously upgrading the architecture so Sparkz never becomes a basic token launcher with a meme button. The shippable slice lives in [V1-SCOPE.md](./V1-SCOPE.md); this is the full vision it's derived from.

## Two parallel tracks

- **SHIP TRACK** - build and prove one complete economic loop.
- **INNOVATION TRACK** - continuously design, prototype, and test the larger Sparkz system.

Prevents both failure modes: endless architecture that never reaches users; shipping something small that's obsolete immediately.

## The Sparkz system - four connected entry points

- **Creator Coin** - monetize a person, their work, audience, and collaborators.
- **Culture Coin** - monetize + coordinate a community, movement, scene, event, or shared identity.
- **Open-Source Project** - monetize repositories, contributors, maintainers, dependencies, and project communities.
- **Meme Engine** - the cultural intelligence, distribution, and community-mobilization system powering all three.

```
Creator ────────┐
Culture ────────┼──→ SPARKZ CAPSULE ──→ Economy
Open-source repo┘           │
                            ↓
                       MEME ENGINE
             Detect → Create → Mobilize
              Track → Reward → Learn
```

## Central innovation: every launch is a living Capsule

Every Sparkz project begins as a **Capsule**, not immediately a coin. The Capsule accumulates: identity; creators/maintainers; project history; cultural lore; content and code; contribution records; supporters; collaborators; financial activity; community signals; rights/permissions; reputation; governance; economic config; Meme Engine memory; receipts. **The coin is an optional economic output of the Capsule.** This lets Sparkz support projects that are pre-token, tokenized, permanently tokenless, sponsored, membership-based, bounty-funded, event-based, commercially licensed, or community-owned - so the business isn't a bet on speculative coins.

## The 9 upgrades (amend V1, don't explode it)

1. **Thin Meme Engine, not dumb.** Keep the v1 loop (human flags moment -> Sparkz drafts 3 responses -> human approves -> publish -> community remixes -> contributors rewarded), but build every component as a replaceable adapter. `interface SignalSource { detectSignals(capsuleId): Promise<CulturalSignal[]> }`. Sources grow from human submission to Farcaster activity to Alpha Radar to predictive intelligence - no rebuild.
2. **Meme Receipts immediately.** Every meme/campaign gets a traceable record (original signal, why it matched the Capsule, creator, approver, source assets, parent meme, versions, remixes, contributors, reach, referrals, backing generated, rewards, lessons). The data moat: others generate images; Sparkz learns which person/idea/format/community/moment created measurable value.
3. **Community Swarm is the real v1 product.** Don't just publish from the official account - activate supporters (detect opportunity -> approved campaign material -> Swarm mission -> members make variations -> track attribution/performance -> reward useful contributors). Rewards need not be a token: points, reputation, leaderboard, collectables, access, perks, tickets, merch, launch-allocation eligibility, sponsor-funded rewards.
4. **Project Contribution Graphs.** For repos, recognize more than commits: code, reviews, testing, docs, issue discovery, community support, design, security, distribution, partnerships, research, memes/education, revenue, dependencies. Each with evidence, weighting, review status, provenance. Then propose sponsorship splits, contributor rewards, bounties, launch allocations, treasury grants, reputation, governance eligibility. Build ABOVE Drips, don't recreate it.
5. **FEF (Farcaster Eats First) as a protocol rule.** First announcement, participation round, quest, backing window, collectable, and contributor rewards all go to Farcaster first; distribute outward later. Farcaster Mini Apps provide the feed discovery, notifications, identity, and wallet transactions to make the loop real.
6. **Alpha Radar, progressively.** V1 Human Radar -> V1.5 Community Radar -> V2 Connected Radar -> V2.5 Velocity Radar -> V3 Predictive. Start storing clean historical signal data now (detected when/by whom, size then, peak, did we enter, outcome, was the fit score right) so V3 ML has something proprietary to learn from.
7. **Experiment Engine.** Per-Capsule controlled experiments (meme styles, backing tiers, CTAs, holder vs non-holder, posting windows, individual vs community, financial vs cultural rewards), each producing a receipt (hypothesis, variants, audience, duration, result, conversion, cultural response, decision). Learn per-Capsule, not generic best practices.
8. **Culture Health Dashboard** independent of token price: active contributors, retention, independent content, remix depth, supporter conversion, returning supporters, response time, collaboration, revenue diversity, founder dependence, bot concentration, treasury health, real usage. A price pump with collapsing participation isn't healthy; a small project with growing contributors + repeat engagement is - even pre-token.
9. **Hard anti-failure gates.** Every feature must pass all four or stay in the lab: (a) helps someone earn/participate/distribute? (b) measurable? (c) strengthens the Capsule's proprietary data? (d) testable with a real project in 30 days?

## Product gates (the proof sequence)

1. Can Zoostr create active backers?
2. Can the Community Swarm generate independent distribution?
3. Can Sparkz correctly attribute + reward contribution?
4. Can the same machinery work for ZAOstock?
5. Can it work for an open-source repository?
6. Can trend detection outperform human-only discovery?
7. Can the system operate safely with increasing autonomy?

## The moat

Not the token contract, not image generation, not AI recommendations. It's the combined system: persistent Capsules + contribution graphs + cultural memory + trend history + meme lineage + community mobilization + economic routing + cross-platform attribution + verification receipts + accumulated performance data. The more Sparkz operates, the smarter every Capsule and recommendation becomes.

## The immediate upgraded V1

Amend Claude's scope, don't explode it: Zoostr Creator Capsule; pre-token backing; human-triggered Meme Engine; three Capsule-grounded response options; approval workflow; Community Swarm mission; remix submission; attribution records; measurable links; contributor leaderboard; reward receipt; post-campaign learning report; architecture prepared for interchangeable trend sources; Culture Coin + repository templates preserved in the schema.

**The first proof is not "we launched Zoostr's coin." It is: Sparkz turned Zoostr's supporters into an attributable cultural distribution network, measured what they created, rewarded the useful contributors, and learned how to improve the next campaign.** That foundation lets us add Culture Coins, repo monetization, ZAOstock, Alpha Radar, and increasingly autonomous Meme Engine operations without guessing.

---

Source: Sparkz two-track strategy, co-developed by Zaal + Brandon Ducar (DreamNet), 2026-07-17. Builds on Brandon's "Culture Coins and Meme Engines" white paper. The shippable v1 floor: [V1-SCOPE.md](./V1-SCOPE.md).
