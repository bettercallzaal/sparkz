# Sparkz - Build Milestone 1 (the Hearth foundation)

Kickoff brief for a dedicated build terminal. Read this + `ARCHITECTURE.md` +
`V1-SCOPE.md` before writing code. This scopes the FIRST shippable slice; brainstorm
the schema with Zaal before building (ZAO convention: plan first, then build).

## What Sparkz is (30-second orient)

Every Sparkz project is a **Hearth**, not a coin. The Hearth accumulates identity,
contributors, history, content, backing, and economic config. A **Spark** is an event
on a Hearth (a moment, a token, an NFT drop, a bounty, an event), ideally something
onchain we can point to. The coin is an *optional output*. Back the album, not a coin.
V1 proves ONE loop with Zoostr (a Creator Hearth); the schema supports every entry
point (Creator / Culture / Open-Source repo) so v1.5 is additive, not a migration.

## Milestone 1 - the foundation everything accumulates into

Build the smallest end-to-end slice that lays the foundation.

1. **Hearth schema (Supabase).** One `hearths` table supporting every type, v1 seeds a
   Creator Hearth for Zoostr. Plus `hearth_backers` (pre-token "spark" backing - no
   token required). Design it so a Culture Hearth or an OSS-repo Hearth is just a
   different `type` + config, not a new schema.
2. **Adapter seams** (the future-proofing that avoids a rebuild): a `BackingProvider`
   (v1 implementation = the off-chain ledger) and a generic `Connector` spoke.
3. **A minimal UI**: create/seed the Zoostr Hearth, boost it, and view its backers.
   Mobile-first, dark theme.

## Conventions (match the ZAO estate)

- Stack: Next.js (App Router) + Supabase (RLS on every table) + Tailwind + TypeScript.
- Zod `safeParse` on every API input; `NextResponse.json`; try/catch + sanitized 500s.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` / secrets to the client.
- PR-only to main, never push direct. Branch `ws/<slug>`. Migrations = ask Zaal first.
- Public repo (`bettercallzaal/sparkz`) - build in the open, OSS-first.

## Every feature passes the 4 anti-failure gates or it stays in the lab

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Hearth's data?
4. Can it be tested with a real project within 30 days?

## The bigger convergence (why this matters beyond Zoostr)

We are auditing every ZAO project (ZAOcowork, wwtracker, CoCConcertZ, ...) as beta
testing. Each audited project is a **Hearth candidate** - the audit is the
Spark-readiness pass. So the `hearths` schema's OSS-repo type should be able to
import an existing ZAO repo as a Hearth (repo + contributors + audit result).
CoCConcertZ in particular is slated to become a Spark. Build the schema with that in
mind: a Hearth can wrap a repo, not just a creator.
