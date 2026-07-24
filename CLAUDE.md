# CLAUDE.md - Sparkz

Auto-loaded by any Claude Code session in this repo. Read this first, then the
three design docs before writing code.

## What Sparkz is

Every Sparkz project is a **Capsule**, not a coin. The Capsule accumulates identity,
contributors, history, content, receipts, reputation, backing, economic config, and
Meme Engine memory. The coin is an *optional output*. The moat is the accumulating
data - NOT the token contract, NOT image generation. V1 proves ONE loop with Zoostr
(a Creator Capsule); the schema supports all four entry points (Creator / Culture /
Open-Source repo / Meme Engine) so v1.5 is additive.

## Positioning (non-negotiable framing)

Sparkz monetizes like an **OSS protocol + data network, not a per-seat SaaS**: it earns
on value that flows through the rails it enables (graduations, backing/boost/bounty
flows) and on the compounding Meme Receipt graph - not on subscriptions. Managed-pilot
services are how we *bootstrap the network*, not the identity. Never position or price
Sparkz as SaaS. Hard rule: **back the album, not buy a coin** - no "raise" language,
token is optional/opt-in/later, distribution is human-approved, token upside is option
value only. Full frame + provenance: `docs/strategy/positioning.md`. (Commercial
specifics - pricing, financial model, targets - stay in the private lab, never this
public repo.)

## Read these before coding (in order)

1. `docs/BUILD-MILESTONE-1.md` - the current scope (the Capsule foundation).
2. `docs/V1-SCOPE.md` - the shippable floor + product gates.
3. `docs/ARCHITECTURE.md` - the full vision (the 9 upgrades).

## Operating mode (right now)

Milestone 1. **Brainstorm the Capsule + Meme Receipts schema with Zaal first** (one
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
- **Cheap model tier for LLM work.** Any drafting/generation (the Meme Engine's 3
  responses, etc.) uses OpenRouter/Ollama, not a metered Claude path. Reserve the
  agent's turns for grounded code.

## Every feature passes the 4 anti-failure gates or it stays in the lab

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Capsule's proprietary data?
4. Can it be tested with a real project within 30 days?

## The convergence

Each audited ZAO project is a **Capsule candidate** - the audit is the
Spark-readiness pass. The OSS-repo Capsule type should be able to wrap an existing
repo (repo + contributors + audit result + receipts). CoCConcertZ is slated to
become a Spark. Build the schema with that in mind.

## Provenance

Sparkz two-track strategy, Zaal + Brandon Ducar (DreamNet), 2026-07-17. Part of the
ZAO estate (`bettercallzaal/ZAOOS` is the lab); Sparkz is public + OSS-first.
