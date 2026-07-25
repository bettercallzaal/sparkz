# Session handoff - 2026-07-25 11:xx
> from Zaal's mac (Documents/sparkz, branch main) -> to ZOE (cowork bot, via Bonfire + /cockpit inbox)
> doc: .handoffs/session-2026-07-25-sparkz-prod-readiness/README.md
> chain: .handoffs/session-2026-07-24-sparkz-rebrand-positioning/README.md

## Receiver instructions (read me FIRST, then do exactly this)

You just received a handoff bundle. Do NOT start work yet. Do this:

1. Read ALL sections below before responding.
2. Git is clean and fully merged to main - there is NO diff to apply. Just `git pull`.
3. Create TaskList entries from Section A. These are the next moves.
4. Use Section B as your "why" - do not re-litigate decisions captured there.
5. Section D lists what is still running (nothing blocking).
6. Section E is your cold-start map for files, skills, memory state.
7. Once integrated, message back: "Ingested handoff sparkz-prod-readiness. 4 tasks queued. Ready."
8. If you /handoff later, your new bundle's `chain:` points BACK to this bundle's path.

## Repos to use (START HERE)

- **Primary:** `bettercallzaal/sparkz` - `https://github.com/bettercallzaal/sparkz.git` (public, Apache-2.0). Working branch convention: `ws/<slug>`, PR-only to main, never push direct. CI = build + `tsc --noEmit` + `eslint` on every PR. If unsure which repo, it is this one.
- Reference: `bettercallzaal/ZAOOS` is the private lab (commercial specifics live there, NOT in this public repo).

## Capability boundary (cloud vs terminal)

Boot self-check: `~/.zao/zao.env` (secrets), `~/.claude/skills` (the brain), `gh auth status`, `$DISPLAY` (GUI). STOP and ask Zaal to run it in a mac terminal (or do it himself) when a task needs: local `.env.local` secrets (Supabase service role, admin token), a browser/GUI, the clipboard skill, a locally-authed MCP (the **Supabase MCP was disconnected** this session), Zaal's real accounts, onchain writes, or a non-repo local file. Continue with everything you CAN do from a clone.

## A. Tasks to absorb (paste these into your TODO list)
- [ ] Test the shipped prod-readiness work on **trysparkz.com + sparkz.lol** (from phone) - full flag -> draft -> approve -> Meme Receipt loop + new admin console UX (flow strip, AI/FALLBACK badges, receipt approver/creator).
- [ ] Verify migration `0003` index landed in Supabase (index `meme_receipts_signal_unique` on `meme_receipts.signal_id`) - Zaal applied it manually, not auto-verified because the Supabase MCP was down. Check `pg_indexes` when the MCP is reconnected.
- [ ] Confirm Vercel prod env vars: `SPARKZ_ORIGIN`, `OPENROUTER_API_KEY` (credits now added), `SPARKZ_ADMIN_TOKEN`.
- [ ] Optional polish (non-blocking, none gates a pilot): refactor ~25 hardcoded `trysparkz.com` refs across 12 files -> `canonicalOrigin()` from `src/lib/origin.ts`; wire the adapter + agent tests into CI (no `test` script in main `package.json` yet); check ~10 unchecked Supabase `{ error }` read paths (audit-flagged); add Sentry / error tracking.

## B. Why - decisions + pivots + ruled-out paths
- Ran a full prod-readiness audit (3 review subagents + manual). Found 5 blockers, fixed ALL 5, shipped in PR #221 + #222 (both merged to main). Blockers: rate-limit bypass, host-header-spoof of approval links, double-publish race, missing LICENSE, OpenRouter config.
- **rate-limit fail-closed:** `selfServeCountInWindow`/`boostCountInWindow` ignored the Supabase `{ error }` and returned `0` on failure - a DB hiccup lifted the limit entirely. Now throws. Also decoupled the IP-hash salt from `SPARKZ_ADMIN_TOKEN` (rotating the token silently reset every rate-limit window = a bypass).
- **host-spoof:** `POST /api/signals` built the operator approval URL from `req.nextUrl.origin` (attacker-controlled Host header). Now uses `canonicalOrigin()` (new `src/lib/origin.ts`) reading `SPARKZ_ORIGIN` env.
- **double-publish race:** concurrent approvals could both write a Meme Receipt for one signal. Added migration `0003` (partial unique index on `meme_receipts.signal_id`) + the approve route handles the 23505 idempotently. Migration was drafted separately and applied manually - DB migrations are never auto-applied.
- **LICENSE:** repo was positioned OSS-first but had no LICENSE (CITATION.cff claimed MIT with nothing backing it). Chose **Apache-2.0** over MIT because Sparkz is a protocol/network others build on - the explicit patent grant + retaliation clause + trademark protection matter. MIT's only edge was simplicity.
- **dev-unlock:** added `POST /api/admin/dev-login` HARD-gated to `NODE_ENV=development` (404 in prod) + console auto-unlock, so local dev never pastes the operator token. Prod auth path (`/api/admin/login`) untouched.
- **silent LLM fallback:** `meme-engine/draft` swallowed OpenRouter failures and silently returned labelled `[fallback]` drafts. Added logging - which immediately surfaced the live cause: OpenRouter was OUT OF CREDITS (402). Zaal topped up; real `deepseek/deepseek-chat` drafts confirmed working.
- **Cleanup:** closed all 20 stale draft PRs + deleted 163 stale remote branches - they targeted the OLD pre-rebrand architecture (advisor/audius/back/circles/collectables/split-wizard/tiers) that no longer exists on main and could not merge cleanly. Remote is now just `main`, 0 open PRs.
- Two-domain split (PR #195) was REVERTED in #216 - single domain now; `src/lib/origins.ts` gone, replaced by `src/lib/origin.ts` `canonicalOrigin()`.
- Suppressed a hydration warning with `suppressHydrationWarning` on `<html>` - it was a browser-extension (Scribe/Grammarly) attribute injection, not an app bug.

## C. Git state
- Branch: `main` (in sync with origin/main, clean - 0 dirty tracked files)
- Push status: all merged + pushed. Tip `c102091` (LICENSE), `9f91630` (prod-readiness).
- Uncommitted diff: none.
- Untracked: `.handoffs/` (this bundle).

## D. In-flight
- Background bash jobs: `next dev` was running locally on :3000 (session-local, dies with the mac terminal - not relevant to ZOE).
- Subagents pending: none.
- Scheduled wakeups: none.
- Open AskUserQuestion: none.

## E. Cold-start map (read if you are confused)
- Files touched this session:
  - Security/correctness: `src/lib/rate-limit.ts`, `src/lib/origin.ts` (new), `src/app/api/signals/route.ts`, `src/app/api/signals/approve/route.ts`, `src/lib/meme-engine/draft.ts`
  - Auth/dev-unlock: `src/lib/auth.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/dev-login/route.ts` (new)
  - Console UX + receipts: `src/app/admin/page.tsx`, `src/app/api/receipts/route.ts`, `src/app/layout.tsx`
  - Migration: `supabase/migrations/0003_meme_receipt_unique_signal.sql` (new, applied manually)
  - License/meta: `LICENSE` (new), `NOTICE` (new), `package.json`, `CITATION.cff`, `README.md`, `.env.example`
- Skills invoked: `clipboard` (migration SQL page), `handoff` (this bundle).
- Memory writes: `project_sparkz_state.md` - updated (prod-readiness pass shipped, cleanup done, OPEN list current).
- Last-known mental model: Prod-readiness pass is complete and merged to main. All 5 blockers cleared, repo is clean (only `main`, 0 PRs, Apache-2.0 licensed), core loop works with real AI drafts. Next is testing on prod from phone + optional polish. Zaal is moving to build from Telegram/phone with ZOE.
- Open questions: none blocking.

## Inline copy-paste block (for fast receiver paste)

```
Ingest the bundle at .handoffs/session-2026-07-25-sparkz-prod-readiness/README.md in bettercallzaal/sparkz and follow receiver instructions at the top. 4 tasks to absorb.
```
