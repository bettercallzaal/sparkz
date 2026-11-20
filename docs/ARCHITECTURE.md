# Sparkz Architecture

> V1 is the floor, not the ceiling. Keep the build focused enough to ship, while continuously upgrading the architecture so Sparkz never becomes a basic token launcher. The shippable slice lives in [V1-SCOPE.md](./V1-SCOPE.md); this is the fuller picture it is derived from.

## Two parallel tracks

- **SHIP TRACK** - build and prove one complete loop.
- **INNOVATION TRACK** - continuously design, prototype, and test the larger Sparkz system.

Prevents both failure modes: endless architecture that never reaches users; shipping something small that is obsolete immediately.

## Entry points, one Hearth

- **Creator** - a person, their work, audience, and collaborators.
- **Culture** - a community, movement, scene, or shared identity.
- **Open-Source Project** - a repository, its contributors, maintainers, and project community.

```
Creator ────────┐
Culture ────────┼──→ HEARTH ──→ Sparks (events)
Open-source repo┘
```

## Central idea: every project is a Hearth

Every Sparkz project begins as a **Hearth**, not immediately a coin. The Hearth accumulates: identity; creators and maintainers; project history; content and code; supporters and free boosts; collaborators; financial activity; economic config. A **Spark** is an event on a Hearth: a moment, a token, an NFT drop, a bounty, or an event, ideally something onchain we can point to. Back the album, not a coin. A coin is an optional output, never the starting point.

## Upgrades (amend V1, do not explode it)

1. **Replaceable adapters.** Every external system sits behind a seam: `BackingProvider` and `Connector`. A **Hearth plugin system** (`src/lib/plugins`) bundles components into **spokes**; `registerPlugin()` fans them into the seams; the `hearth_spokes` table holds per-Hearth enable/disable and config. **Vendors self-serve**: drop a folder in `src/lib/plugins/community/` (a `spoke.json` manifest plus `index.ts`) and open a PR (see `community/README.md`); a working `audius-catalog` example ships in-repo.
2. **Project Contribution Graphs.** For repos, recognize more than commits: code, reviews, testing, docs, issue discovery, community support, design, security, distribution, partnerships, research, education, revenue, dependencies. Each with evidence, weighting, review status, and provenance. Build ABOVE Drips, do not recreate it.
3. **FEF (Farcaster Eats First) as a protocol rule.** First announcement, participation round, quest, backing window, and collectable go to Farcaster first; distribute outward later. Farcaster Mini Apps provide feed discovery, notifications, identity, and wallet transactions.
4. **Culture Health Dashboard** independent of token price: active contributors, retention, supporter conversion, returning supporters, response time, collaboration, revenue diversity, founder dependence, bot concentration, treasury health, real usage. A price pump with collapsing participation is not healthy; a small project with growing contributors and repeat backers is, even pre-token.
5. **Hard anti-failure gates.** Every feature must pass all four or stay in the lab: (a) helps someone earn, participate, or distribute? (b) measurable? (c) strengthens the Hearth's data? (d) testable with a real project in 30 days?

## Product gates (the proof sequence)

1. Can Zoostr create active backers?
2. Can Sparks bring people in and give them something to do onchain?
3. Can the same machinery work for ZAOstock?
4. Can it work for an open-source repository?

---

Source: Sparkz two-track strategy, co-developed by Zaal + Brandon Ducar (DreamNet), 2026-07-17. The shippable v1 floor: [V1-SCOPE.md](./V1-SCOPE.md).
