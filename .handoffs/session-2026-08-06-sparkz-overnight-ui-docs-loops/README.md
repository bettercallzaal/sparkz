# Session handoff - 2026-08-06
> from Zaal's mac (Documents/sparkz, branch main) -> to ZOE (cowork bot, via Bonfire + /cockpit inbox)
> doc: .handoffs/session-2026-08-06-sparkz-overnight-ui-docs-loops/README.md
> chain: .handoffs/session-2026-08-04-sparkz-empire-graduation/README.md

## Receiver instructions (read me FIRST, then do exactly this)
1. Read ALL sections below before responding.
2. Git is clean, fully merged to main - NO diff to apply. Just `git pull`.
3. Create TaskList entries from Section A. Tasks 1 + 2 are STANDING overnight loops, not one-offs.
4. Use Section B as your "why" + friction map.
5. Once integrated, say: "Ingested handoff sparkz-overnight-ui-docs-loops. 4 tasks queued. Ready."

## Repos to use (START HERE)
`bettercallzaal/sparkz` - `https://github.com/bettercallzaal/sparkz.git` (public, Apache-2.0). Branch `ws/<slug>`, PR-only to main, never push direct. CI = build + `tsc --noEmit` + `eslint`. Read `CLAUDE.md` first - the 4 anti-failure gates filter every change. Supabase project `noytvuorbdmgjfxwbufj`. Gold theme tokens live in `src/app/globals.css :root`.

## Capability boundary (cloud vs terminal)
Boot self-check: `~/.zao/zao.env` (secrets), `~/.claude/skills`, `gh auth status`, `$DISPLAY`. STOP + ask Zaal to run in a mac terminal when a task needs: local `.env.local` secrets (Supabase service role, admin token), a browser/GUI, the Vercel dashboard, a locally-authed MCP (Supabase MCP was down), Zaal's real accounts, onchain writes, or a non-repo local file. Do everything you CAN from a clone: UI + doc PRs, research, code. **To SEE the app, use trysparkz.com (always up) - NOT localhost.**

## A. Tasks to absorb (paste into your TODO list)
- [ ] **STANDING overnight UI-improvement loop.** Audit + polish the Sparkz UI - landing (`page.tsx`), `/explore`, `/c/[slug]`, the `/admin` Meme Engine console, the `/empire/[id]` panel, `EmpireLeaderboard`. Look for: gold-theme consistency (tokens in `globals.css`), mobile-first layout, accessibility (focus states, aria, contrast), empty/loading states, microcopy that reads from the user's side. Each improvement = its own SMALL, CI-green PR (`ws/ui-<thing>`). Start each night by auditing what's roughest; log what you dropped/deferred. Verify visually on trysparkz.com after merge.
- [ ] **STANDING overnight documentation loop.** Keep README / ARCHITECTURE / CONTRIBUTING + the `docs/strategy` + `docs/research` docs current, clear, and gap-free. Improve first-time-contributor onboarding (SETUP, CONTRIBUTING). Cross-reference against recent merges so docs never drift. Small PRs. The `document-release` pattern is a good model.
- [ ] **Build the graduation readiness meter** on the Capsule page - the #1 pending feature (`docs/strategy/graduation-timing.md`). Score the 6 launch-readiness gates (product/receipts, community/backers, tokenomics, runway, narrative, liquidity) from a Capsule's LIVE data and render a "ready to launch? / not yet, here's the gap" meter on `/c/[slug]`. Reuse `capsuleConnections()` + the directory data. This proves the token-timing thesis on screen.
- [ ] **Guardrails.** (a) Do NOT touch or publish the security P0s - they're in a PRIVATE advisory `GHSA-fwqg-p9x7-3xcv` (Farcaster request-body ownership in `create-spark`; raw admin token in the cookie in `auth.ts`). Cad (arcabotai) is packaging fixes there via a temp private fork. Stay clear of those files' security aspects in public PRs. (b) There are 47 stale ZOL-generated content PRs open - TRIAGE (review/close/batch), do not blind-merge.

## B. Why - decisions + friction
- **Overnight work = small self-contained PRs**, each CI-green, on the gold theme, passing the CLAUDE.md 4 gates. Never one giant PR - the loop should produce many reviewable increments Zaal can scan in the morning.
- **The graduation readiness meter is the strategic centerpiece.** Both token-launch failure modes are real (too-early = 69% of Pump.fun tokens die day one; too-late = moon-then-microcap). Sparkz's edge: a Capsule's accumulated data IS the readiness signal, and the Meme Engine + leaderboard ARE the post-launch support engine. The meter makes that visible. Full framework in `graduation-timing.md`.
- **Security is handled PRIVATELY.** An audit (Cad/Arca, stewarded by Luis Felipe Abarca) found 2 P0 integrity issues + several P1s. They live in advisory `GHSA-fwqg-p9x7-3xcv` + local `docs/security/audits/` (gitignored - sparkz is public, unfixed-vuln detail must NOT be published). The overnight loop must not surface them publicly.
- Prior session shipped: plugin system (6 plugins; migration 0004 APPLIED, per-Capsule toggles persist), full Empire read integration + import-empires-as-Sparks (ZABAL, ZABAL GAMEZ are live Sparks), connection badges, draft-from-memory. Docs synced (PR #290).
- **Friction (save the cycles):** `npm run dev` uses `.env.local` = the REAL prod Supabase - no local DB. localhost dies after a check ("refused to connect" = dead dev server, not a bug); use trysparkz.com. Supabase MCP was disconnected. Turbopack isolates route module graphs - derive plugin listings from static `BUILT_IN_PLUGINS`, not the runtime Map. Missing-table error = `PGRST205` (not raw `42P01`). GitHub secondary-rate-limits parallel PR mutations - go sequential with a small sleep.

## C. Git state
Branch `main`, in sync with origin, clean (0 dirty). Tip `0666d9b`. No uncommitted diff. Untracked: `.handoffs/` + `docs/security/audits/` (gitignored).

## D. In-flight
Background: local `next dev` may linger (session-local, ignore). Subagents: none. Wakeups: none. Open question: none. Pending external: Cad to post P0 fix commits in advisory `GHSA-fwqg-p9x7-3xcv` (Zaal reviews - not ZOE's lane).

## E. Cold-start map
- Files this session: docs sync (`README.md`, `docs/ARCHITECTURE.md`), migration 0004 marked applied, local security triage (gitignored). Prior session: the plugin system + Empire integration + graduation-timing strategy (all merged).
- Skills invoked: `handoff`, `clipboard`, `document-release`.
- Memory: `project_sparkz_state.md` - updated (0004 applied, security advisory open, this overnight directive).
- Mental model: Sparkz is prod-ready, gold-themed, with a plugin system + full Empire integration + a codified graduation-timing thesis, and a private security advisory in flight. The NEXT phase is continuous polish (UI + docs overnight loops) + building the graduation readiness meter.
- Open questions: cadence/reporting surface for the overnight loops (how often, where to summarize) - confirm with Zaal on first run.

## Inline copy-paste block (for fast receiver paste)
```
Ingest the bundle at .handoffs/session-2026-08-06-sparkz-overnight-ui-docs-loops/README.md in bettercallzaal/sparkz and follow receiver instructions at the top. 4 tasks - tasks 1+2 are standing overnight UI + docs improvement loops.
```
