# Session handoff - 2026-08-04
> from Zaal's mac (Documents/sparkz, branch main) -> to future-Zaal (pick this up later)
> doc: .handoffs/session-2026-08-04-sparkz-empire-graduation/README.md
> chain: .handoffs/session-2026-08-02-sparkz-communal-research/README.md

## Receiver instructions (read me FIRST, then do exactly this)

You just received a handoff bundle. Do NOT start work yet. Do this:
1. Read ALL sections below before responding.
2. Git is clean and fully merged to main - NO diff to apply. Just `git pull`.
3. Create TaskList entries from Section A.
4. Use Section B as your "why" - don't re-litigate captured decisions.
5. Section D lists what's still running (nothing blocking).
6. Section E is your cold-start map.
7. Once integrated, say: "Ingested handoff sparkz-empire-graduation. 5 tasks queued. Ready."

## Repo (START HERE)
`bettercallzaal/sparkz` (public, Apache-2.0). Branch `ws/<slug>`, PR-only to main, never push direct. CI = build + `tsc --noEmit` + `eslint`. Read `CLAUDE.md` first - the 4 anti-failure gates filter every feature. Supabase project: `noytvuorbdmgjfxwbufj`. Secondary: `bettercallzaal/zoostr` (the standalone Zoostr site, cleaned earlier).

## A. Tasks to absorb (paste into your TODO list)
- [ ] **Build the graduation readiness meter** on the Capsule page - the #1 next action in `docs/strategy/graduation-timing.md`. Score the 6 launch-readiness gates (product/receipts, community/backers, tokenomics, runway, narrative, liquidity) from a Capsule's LIVE data and show a "ready to launch? / not yet, here's the gap" meter. This is the feature that makes the token-timing thesis real on screen - highest leverage.
- [ ] **Apply migration `0004_capsule_plugins.sql`** in the Supabase SQL editor (project noytvuorbdmgjfxwbufj) so per-Capsule plugin toggles persist. The control plane (`/api/capsules/plugins`, `capsule-config.ts`) is built + degrades to defaults until the table exists.
- [ ] **Build the Campaign layer** (Kickstarter alignment): goal + progress bar + reward tiers + countdown on a Capsule. The creator-support / client-acquisition feature. Rationale in `graduation-timing.md` + the Kickstarter research (Kickstarter's value = campaign structure + backer list, NOT audience - creators bring 60-80%; Sparkz's edge is the Meme Engine IS the marketing). Start with goal + progress (biggest urgency driver).
- [ ] **Spec/build the backer-outreach pipeline** (borrowed from `lalalune/outreachr`): opt-in, human-approved, anti-spam 1:1 outreach so a creator recruits the "initial backers who promote." Borrow the discipline (evidence-on-every-fact, approval state machine, audit trail) - NOT the VC-fundraising purpose.
- [ ] **Activate + triage:** add `NEYNAR_API_KEY` (lights up the Farcaster signal source + `/api/signals/detect`) and `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID` (phone approval); deploy Zoostr's Empire (needs a wallet EIP-191 sig via `/api/empire/deploy`); triage the 47 open ZOL draft PRs on sparkz (content pages - review/batch or close).

## B. Why - decisions + pivots + friction
- **Token timing is a readiness STATE, not a date** (`graduation-timing.md`). Both failure modes proven with numbers: too-early = 69% of Pump.fun tokens die day one; too-late = quiet-build-then-launch moons + crashes to microcap (quotient/ruminations ~$120K). Sparkz uniquely measures readiness (a Capsule's accumulated data = the 6 gates) AND supplies the post-launch "support immediately" engine (Meme Engine keeps producing, leaderboard keeps engagement). Grounded in a live Farcaster builder thread (shilling-is-cringe / need-initial-backers / support-immediately - Sparkz answers all three).
- **Plugin system is modeled on elizaOS** (the research validated it; Shaw's outreachr independently uses the same agent-constrained-collaborator + approval discipline). Two capabilities shipped AS plugins (Farcaster signal source, Telegram approval) proving the pattern. 6 built-in plugins.
- **Empire integration: reads fully done + tested live** (`/api/empire/{id}` bundle + `/empire/{id}` panel + inline on `/c/{slug}`). Write ops (deploy variants, leaderboard/treasury mgmt) need an EIP-191 signer - build-when-needed. Import empires AS Sparks works (ZABAL -> tokenized [Empire,Token], ZABAL GAMEZ -> spark [Empire]); connection badges on /explore distinguish each Spark's integrations.
- **draft-from-memory closed the feedback loop** (the moat): drafts now train on the Capsule's approved winners + passed-on drafts. Only pays off once real drafts are approved + OpenRouter has credits.
- **Kickstarter alignment reinforces positioning** - Kickstarter is explicitly rewards/pre-order NOT equity, = "back the album not buy a coin." Adopt the campaign structure, not a 5% cut.
- **FRICTION (save yourself the cycles):**
  - `npm run dev` uses `.env.local` = the REAL prod Supabase. There is NO local sandbox DB. Local testing writes to prod (test signals were created + cleaned this session). To VIEW the app use **trysparkz.com** (always up), NOT localhost - the dev server dies the moment a verification check finishes ("localhost refused to connect" = dead dev server, not a bug).
  - **Supabase MCP was disconnected all session** - couldn't verify migrations/indexes directly. Reconnect it to check `pg_indexes` / `capsule_plugins`.
  - **Turbopack isolates route module graphs** - the plugin registry `Map` is a different instance per route bundle in dev. Derive plugin LISTINGS from the static `BUILT_IN_PLUGINS` import, not the runtime Map (see `capsule-config.ts`).
  - Supabase/PostgREST missing-table error is **PGRST205** (schema-cache msg), not raw Postgres `42P01` - match both.
  - GitHub throws **secondary rate limits** on parallel PR mutations - close/delete PRs sequentially with a small sleep, not `xargs -P`.
  - OpenRouter credits deplete fast; topped up mid-session.

## C. Git state
- Branch: `main`, in sync with origin, clean (0 dirty). All work merged + pushed. Tip `0221df7` (graduation-timing #288).
- Uncommitted diff: none. Untracked: `.handoffs/` bundles.

## D. In-flight
- Background jobs: local `next dev` may be lingering (session-local, ignore). Subagents: none pending. Wakeups: none. Open question: none.

## E. Cold-start map
- Files touched this session (all merged): `src/lib/plugins/*` (types, registry, built-in, capsule-config), `src/lib/adapters/*` (bootstrap idempotent, signal-source/farcaster, approval-channel/telegram, dedup), `src/lib/meme-engine/draft.ts` (memory), `src/lib/empire/*` (client reads, import), `src/lib/capsule-connections.ts`, `src/app/api/{signals/detect,capsules/plugins,capsules/import-empire,empire/[id],directory}/route.ts`, `src/app/_components/EmpireLeaderboard.tsx`, `src/app/empire/[id]/page.tsx`, `src/app/c/[slug]/page.tsx`, `src/app/explore/page.tsx`, `supabase/migrations/0004_capsule_plugins.sql` (NOT applied). Docs: `docs/strategy/graduation-timing.md`, `docs/research/{sparkz-improvements-and-plugin-system,empire-builder-api-integration}.md`.
- Skills invoked: `zao-research` (x3: improvements, Empire API, outreachr+token-timing), `superpowers:brainstorming` (gold theme), `artifact-design` (backend explainer), `clipboard`, `handoff`.
- Memory writes: `project_sparkz_state.md` - updated (Zoostr cleanup, brand/gold, then this session's plugin+empire+graduation work is captured in-repo).
- Last-known mental model: Sparkz is prod-ready, gold-themed, with a working plugin system + full Empire read integration + import-empires-as-Sparks + connection badges, and a codified graduation-timing strategy thesis. The NEXT phase is making the thesis real: the graduation readiness meter, the Campaign layer, and the backer-outreach pipeline.
- Open questions for the receiver: which to build first - readiness meter (thesis-proving) vs Campaign layer (creator-facing value)? Apply migration 0004? Add the Neynar/Telegram keys?

## Inline copy-paste block (for fast receiver paste)
```
Ingest the bundle at .handoffs/session-2026-08-04-sparkz-empire-graduation/README.md in bettercallzaal/sparkz and follow receiver instructions at the top. 5 tasks - top one is the graduation readiness meter.
```
