# CLAUDE.md - Sparkz

Auto-loaded by any Claude Code session in this repo. Read this first, then the
three design docs before writing code.

## What Sparkz is

Every Sparkz project is a **Hearth**, not a coin. The Hearth accumulates identity,
contributors, history, content, backers, free boosts, and economic config. A **Spark**
is an event on a Hearth (a moment, a token, an NFT drop, a bounty, an event), ideally
onchain things we can point to. The coin is an *optional output*. Back the album, not a
coin. V1 proves ONE loop with Zoostr (a Creator Hearth); the schema supports every entry
point (Creator / Culture / Open-Source repo) so v1.5 is additive.

## Positioning (non-negotiable framing)

Sparkz monetizes like an **OSS protocol + data network, not a per-seat SaaS**: it earns
on value that flows through the rails it enables (graduations, backing/boost/bounty
flows) - not on subscriptions. Managed-pilot
services are how we *bootstrap the network*, not the identity. Never position or price
Sparkz as SaaS. Hard rule: **back the album, not buy a coin** - no "raise" language,
token is optional/opt-in/later, token upside is option value only. Full frame + provenance: `docs/strategy/positioning.md`. (Commercial
specifics - pricing, financial model, targets - stay in the private lab, never this
public repo.)

## Read these before coding (in order)

1. `docs/BUILD-MILESTONE-1.md` - the current scope (the Hearth foundation).
2. `docs/V1-SCOPE.md` - the shippable floor + product gates.
3. `docs/ARCHITECTURE.md` - the full vision (the 9 upgrades).

## Operating mode (right now)

Milestone 1. **Brainstorm the Hearth schema with Zaal first** (one
round of questions, then confirm) BEFORE writing code. Plan, then build.

## Stack + conventions

- Next.js (App Router) + Supabase (RLS on every table) + Tailwind + TypeScript.
- Validate ALL API input with Zod `safeParse`; return `NextResponse.json`; wrap
  handlers in try/catch, log server-side, return a sanitized 500.
- Mobile-first, dark theme.
- `@/` import alias.

## Non-negotiable

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or any secret to the browser. Service
  role = server-only.
- **Never** commit secrets or `.env`. Stub keys on disk; real keys at runtime only.
- **PR-only to main.** Branch `ws/<slug>`. Never push direct.
- **Ask before** any DB migration, new dependency, or env-var change.

## Every feature passes the 4 anti-failure gates or it stays in the lab

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Hearth's proprietary data?
4. Can it be tested with a real project within 30 days?

## The convergence

Each audited ZAO project is a **Hearth candidate** - the audit is the
Spark-readiness pass. The OSS-repo Hearth type should be able to wrap an existing
repo (repo + contributors + audit result). CoCConcertZ is slated to
become a Spark. Build the schema with that in mind.

## Provenance

Sparkz two-track strategy, Zaal + Brandon Ducar (DreamNet), 2026-07-17. Part of the
ZAO estate (`bettercallzaal/ZAOOS` is the lab); Sparkz is public + OSS-first.
