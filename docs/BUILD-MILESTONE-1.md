# Sparkz - Build Milestone 1 (the Capsule foundation)

Kickoff brief for a dedicated build terminal. Read this + `ARCHITECTURE.md` +
`V1-SCOPE.md` before writing code. This scopes the FIRST shippable slice; brainstorm
the schema with Zaal before building (ZAO convention: plan first, then build).

## What Sparkz is (30-second orient)

Every Sparkz project is a **Capsule**, not a coin. The Capsule accumulates identity,
contributors, history, content, receipts, reputation, backing, economic config, and
Meme Engine memory. The coin is an *optional output*. The moat is the accumulating
data - NOT the token contract, NOT image generation. V1 proves ONE loop with Zoostr
(a Creator Capsule); the schema supports all four entry points (Creator / Culture /
Open-Source repo / Meme Engine) so v1.5 is additive, not a migration.

## Milestone 1 - the foundation everything accumulates into

Build the smallest end-to-end slice that lays the moat, with **Meme Receipts from
day one**. Ship this before Swarm/leaderboard (those are milestone 2).

1. **Capsule schema (Supabase).** One `capsules` table supporting all 4 types
   (`type: creator | culture | oss | meme`), v1 seeds a Creator Capsule for Zoostr.
   Plus: `capsule_backers` (pre-token "spark" backing - no token required),
   `meme_receipts` (THE data moat - see fields below), `signals` (flagged cultural
   moments). Design it so a Culture Capsule or an OSS-repo Capsule is just a
   different `type` + config, not a new schema.
2. **`SignalSource` adapter interface** (the future-proofing that avoids a rebuild):
   `interface SignalSource { detectSignals(capsuleId: string): Promise<CulturalSignal[]> }`
   V1 implementation = `HumanSignalSource` (a human / ZOL flags a moment). Alpha Radar
   plugs into the same interface later - do not hardcode the trend source.
3. **The human-in-the-loop Meme Engine core loop** (no autonomy in v1):
   flag a signal -> Sparkz drafts **3 Capsule-grounded responses** (use the cheap
   model tier per `.claude/rules/claude-usage.md` - OpenRouter/Ollama, not the
   Claude cap) -> human approves one -> publish. Swarm + attribution + rewards +
   learning report come in milestone 2, but the receipt is written NOW.
4. **Meme Receipt fields** (write one per drafted/approved response, cheap now,
   irreplaceable later): capsule_id, original_signal, why_it_matched_the_capsule,
   creator, approver, source_assets, parent_meme_id, versions, contributors, reach,
   referrals, backing_generated, rewards, lessons, created_at.
5. **A minimal UI**: create/seed the Zoostr Capsule, flag a signal, see the 3 drafts,
   approve one, and view the receipt trail. Mobile-first, dark theme.

## Conventions (match the ZAO estate)

- Stack: Next.js (App Router) + Supabase (RLS on every table) + Tailwind + TypeScript.
- Zod `safeParse` on every API input; `NextResponse.json`; try/catch + sanitized 500s.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` / secrets to the client.
- PR-only to main, never push direct. Branch `ws/<slug>`. Migrations = ask Zaal first.
- Public repo (`bettercallzaal/sparkz`) - build in the open, OSS-first.

## Every feature passes the 4 anti-failure gates or it stays in the lab

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Capsule's proprietary data?
4. Can it be tested with a real project within 30 days?

## The bigger convergence (why this matters beyond Zoostr)

We are auditing every ZAO project (ZAOcowork, wwtracker, CoCConcertZ, ...) as beta
testing. Each audited project is a **Capsule candidate** - the audit is the
Spark-readiness pass. So the `capsules` schema's OSS-repo type should be able to
import an existing ZAO repo as a Capsule (repo + contributors + audit result +
receipts). CoCConcertZ in particular is slated to become a Spark. Build the schema
with that in mind: a Capsule can wrap a repo, not just a creator.

## First moves for the build terminal

1. Brainstorm the Capsule + Meme Receipt schema with Zaal (one round, then confirm).
2. Write the migration (ask before applying).
3. Build the HumanSignalSource + the flag -> 3-drafts -> approve loop behind the adapter.
4. Minimal UI. PR. Then milestone 2 (Community Swarm + attribution + leaderboard).
