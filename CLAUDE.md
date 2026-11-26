# CLAUDE.md - Sparkz

Auto-loaded by any Claude Code session in this repo. Read this first, then the
three design docs before writing code.

## What Sparkz is

Sparkz is The ZAO's open-source experiment in crediting contribution. The target is
**open-source builders, humans and agents**. The question it exists to answer: what is
the best way to tokenize a pull request, for an agent or a human, and allocate
contribution credit fairly? Our answer to test first is **the Respect Game** (ZAO
Fractal): contributors receive Respect, peer-ranked, and Respect is the record of credit.

Every Sparkz project is a **Hearth**, not a coin. A Hearth holds a project's identity,
contributors, history, receipts, reputation, backing and bounties. For an open-source
Hearth that will mean its repo, its merged PRs, who made each one (a human, or which agent
and its operator), the review grade, and the issue it closed (planned, not built yet). The coin is an *optional
output*. The moat is the accumulating contribution record - NOT the token contract,
NOT image generation.

The first experiment is **this repo**: Sparkz is its own first open-source Hearth.
**Planned, not built yet:** every merged PR becomes a contribution record; a poidh bounty
can fund an issue; contributors receive Respect through the Respect Game. Today the code
has none of these: bounties link to Hearths, and there are no PR records or Respect reads. Creator, Culture and Meme Engine Hearths stay in
the schema and keep working, but they are not the target.

Sparkz is for The ZAO's projects. Anyone else can fork the code. To add a project you
join The ZAO (come to a fractal, introduce yourself, receive Respect) and propose it.

## Positioning (non-negotiable framing)

Sparkz is **open-source infrastructure for crediting contribution, not a business on the
rails and not SaaS**. It does not take a cut of flows and is not priced per seat. The
infra is meant to stay free or close to it. What it produces is a public, verifiable
record of who built what, credited through Respect. Hard rules: **back the album, not buy
a coin** - no "raise" language, token is optional/opt-in/later, distribution is
human-approved, token upside is option value only, and Respect is never sold. Full frame:
`docs/strategy/positioning.md`.

## Read these before coding (in order)

1. `docs/BUILD-MILESTONE-1.md` - the current scope (the Hearth foundation).
2. `docs/V1-SCOPE.md` - the shippable floor + product gates.
3. `docs/ARCHITECTURE.md` - the full vision (the 9 upgrades).

## Operating mode (right now)

Live alpha at trysparkz.com. On main: migrations 0001 to 0009 (supabase/migrations/), the
Hearth (src/app/c/[slug]/, src/app/api/capsules/), Sparks (src/app/api/sparks/), backing
(src/app/api/boost/, src/lib/adapters/backing-provider/), report and block
(src/app/api/reports/, src/app/api/blocks/), account deletion (src/app/api/account/delete/),
Farcaster and wallet sign-in plus the App Review sign-in (src/app/api/auth/), and the iOS
shell (ios/).

The Meme Engine is deprecated: its pages and the Receipts tab are gone from the product
(#424). Its code (src/lib/meme-engine/, src/app/api/signals/, src/app/api/receipts/) is
still on main until removal PR 2 (branch ws/remove-meme-engine-code) merges. Do not build
on it. Its tables (meme_receipts, signals, signal_drafts) stay; dropping them is a
migration for Zaal's yes.

**Migrations: merging is the Production apply.** .github/workflows/db.yml runs
scripts/db-migrate.sh against Production on every push to main that touches
supabase/migrations/. So a PR that adds a migration puts a HOLD line first in its body,
carries the `hold` label, and cites a run on a scratch database (a Neon branch) before
Zaal merges it. Migrations are additive and idempotent (`if not exists`), with RLS on.
Work is PR-only from the lane's backlog. For a schema change, a new product surface or a
money/token decision, plan it with Zaal first (one round of questions, then confirm).

## Stack + conventions

- Next.js (App Router) + Tailwind + TypeScript. Data: Neon Postgres plus Vercel Blob in
  production (`SPARKZ_DB=neon`, `src/lib/db/`); Supabase is the older backend, still
  supported when `SPARKZ_DB` is unset (`src/lib/supabase/server.ts`). RLS on every table (each migration in
  `supabase/migrations/` enables it; `scripts/db-migrate.sh` applies them).
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
3. Does it strengthen the Hearth's proprietary data?
4. Can it be tested with a real project within 30 days?

## The convergence

Each audited ZAO project is a **Hearth candidate** - the audit is the
Spark-readiness pass. The OSS-repo Hearth type should be able to wrap an existing
repo (repo + contributors + audit result + receipts). CoCConcertZ is slated to
become a Spark. Build the schema with that in mind.

## Provenance

Sparkz two-track strategy, Zaal + Brandon Ducar (DreamNet), 2026-07-17. Re-aimed
2026-11-25: the target is open-source builders and contribution credit through the
Respect Game. Part of the
ZAO estate (`bettercallzaal/ZAOOS` is the lab); Sparkz is public + OSS-first.
