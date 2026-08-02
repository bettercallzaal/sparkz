# Session handoff - 2026-08-02
> from Zaal's mac (Documents/sparkz, branch main) -> to ZOE (cowork bot, via Bonfire + /cockpit inbox)
> doc: .handoffs/session-2026-08-02-sparkz-communal-research/README.md
> chain: .handoffs/session-2026-07-25-sparkz-prod-readiness/README.md

## Receiver instructions (read me FIRST, then do exactly this)

You just received a handoff bundle. Do NOT start work yet. Do this:

1. Read ALL sections below before responding.
2. Git is clean and fully merged to main - there is NO diff to apply. Just `git pull`.
3. Create TaskList entries from Section A. Task 1 is a STANDING directive, not a one-off - treat it as an ongoing research beat.
4. Use Section B as your "why" - do not re-litigate decisions captured there.
5. Section D lists what is still running (nothing blocking).
6. Section E is your cold-start map.
7. Once integrated, message back: "Ingested handoff sparkz-communal-research. 4 tasks queued. Ready."
8. If you /handoff later, your new bundle's `chain:` points BACK to this bundle's path.

## Repos to use (START HERE)

- **Primary:** `bettercallzaal/sparkz` - `https://github.com/bettercallzaal/sparkz.git` (public, Apache-2.0). Convention: branch `ws/<slug>`, PR-only to main, never push direct. CI = build + `tsc --noEmit` + `eslint`. Read `CLAUDE.md` first - the 4 anti-failure gates are the filter for EVERY feature idea. If unsure which repo, it is this one.
- Secondary: `bettercallzaal/zoostr` (PRIVATE) - the first Spark, a standalone Next.js site with a live Boostr leaderboard (just cleaned this session, now clean main). `bettercallzaal/ZAOOS` - the private lab (commercial specifics live there, NOT in public sparkz).

## Capability boundary (cloud vs terminal)

Boot self-check: `~/.zao/zao.env` (secrets), `~/.claude/skills` (the brain incl. `sparkz-research` / `zao-research`), `gh auth status`, `$DISPLAY` (GUI). STOP and ask Zaal to run it in a mac terminal (or do it himself) when a task needs: local `.env.local` secrets (Supabase service role, admin token), a browser/GUI, the Vercel dashboard/OAuth, a locally-authed MCP (Supabase MCP was disconnected this session), Zaal's real accounts, onchain writes, or a non-repo local file. Do everything you CAN from a clone: research, issues, PRs, code.

## A. Tasks to absorb (paste these into your TODO list)
- [ ] **STANDING research loop (the core directive):** continuously research ways to improve Sparkz and make it MORE COMMUNAL. Use the `sparkz-research` skill; log findings to the research library; surface actionable proposals on a regular beat, not once. This is ongoing - keep a running thread.
- [ ] **"More communal" focus areas:** community-pool mechanics (Sparkz already frames a 1% pool / pull model), collaborative + multi-owner Capsules, a contributor social graph, collective/group backing, the Meme Engine as a SHARED loop (multiple flaggers/approvers), leaderboards as social proof (Zoostr already does this via Boostr). Benchmark comparable creator/community platforms and bring back what transfers.
- [ ] **Convert top findings into concrete issues/PRs** on `bettercallzaal/sparkz`. Every proposal MUST pass the CLAUDE.md 4 anti-failure gates: (1) helps someone earn/participate/distribute, (2) measurable, (3) strengthens the Capsule's proprietary data, (4) testable with a real project in 30 days. Kill ideas that do not.
- [ ] **Progress the open threads:** (a) connect `bettercallzaal/zoostr` to Vercel (Zaal's click - needs Vercel OAuth; prep + prompt him); (b) triage the ~47 ZOL draft content PRs on Sparkz (manifesto/capsule/economics/etc - likely valid, need review/batch-merge or close); (c) create the first real Zoostr Capsule on prod Sparkz (needs the admin token - Zaal unlocks).

## B. Why - decisions + pivots + ruled-out paths
- **Zoostr repo cleanup:** it had 247 open PRs + 248 branches against a 1-commit README - all ZOL-generated. KEY: the branches STACK (each PR = cumulative), so the tip branch `feat/homepage-new-links` (PR #248) WAS the whole 20-page site. Squash-merged that one to main, closed the other 246, deleted every branch. Did NOT try to salvage 247 individually - pointless when the tip contains everything.
- **Gold re-theme (PR #274, merged):** promoted rich metallic gold (#e8c66a) to PRIMARY accent (was violet #c084fc), added holographic foil utilities (`.holo-text`/`.holo-border`), animated logo hero on the homepage, logo everywhere. All tokens live in `src/app/globals.css :root` - one place to tune. Chose "tasteful holo accents" over "bold everywhere" (premium restraint) and "rich metallic gold" over "bright pure gold" (legibility).
- **Brand is locked GOLD:** the Sparkz logo is a gold holographic Z + flame. "Part of The ZAO." Never revert to violet-primary.
- **Zoostr <-> Boostr:** the Zoostr site pulls `https://boostr.itscashless.com/api/zabaal/stats` via a cached server proxy (`/api/boostr`, `src/lib/boostr.ts`) - the live likes leaderboard (ZABAL x Boostr). Plan: Sparkz pulls FROM the deployed Zoostr later, not directly.
- **Prod-readiness (prior session) is done:** all 5 blockers fixed (rate-limit, host-spoof, double-publish race + migration 0003, LICENSE Apache-2.0, OpenRouter credits). dev-unlock exists (dev-only). Real AI drafts work.
- **Friction to not re-discover:** Supabase MCP was disconnected (couldn't verify DB / migration index - reconnect to check). GitHub throws SECONDARY RATE LIMITS on parallel PR mutations - close/delete PRs SEQUENTIALLY with a small sleep, not `xargs -P`. Browser nav was permission-denied once (Zaal controls that gate).
- **Positioning guardrail:** Sparkz monetizes like an OSS protocol + data network, NOT SaaS. "Back the album, not buy a coin." Token is optional/later. Any communal feature must hold this line (see `docs/strategy/positioning.md`).

## C. Git state
- Branch: `main` (in sync with origin/main, clean - 0 dirty tracked files)
- Push status: all merged + pushed. Tip `b048964` (gold theme #274).
- Uncommitted diff: none.
- Untracked: `.handoffs/` bundles.

## D. In-flight
- Background bash jobs: a local `npm start` on :3200 was used for a visual check and killed - session-local, irrelevant to ZOE.
- Subagents pending: none.
- Scheduled wakeups: none.
- Open AskUserQuestion: none.

## E. Cold-start map (read if you are confused)
- Files touched this session (all merged to main):
  - Zoostr repo: squash-merged the full site to main (72 src/app files), closed 246 PRs, deleted 248 branches.
  - Sparkz gold theme (PR #274): `src/app/globals.css` (tokens + holo + gold CTA), `src/app/_components/Flame.tsx` + `src/app/icon.svg` (gold mark/favicon), `src/app/page.tsx` (animated logo hero), `src/app/api/og/route.tsx` (gold OG card), `README.md` (logo GIF hero), `public/brand/*` (png/mp4/webm/gif), `docs/superpowers/specs/2026-07-29-gold-theme-design.md`.
- Skills invoked: `handoff` (this + prior), `clipboard` (migration SQL, ZOE boot), `superpowers:brainstorming` (theme design).
- Memory writes: `project_sparkz_state.md` - updated (Zoostr repo cleaned + real, Sparkz brand assets + gold direction).
- Last-known mental model: Sparkz is prod-ready, licensed, now gold-themed with the new logo everywhere (live on trysparkz.com after Vercel deploy). Zoostr repo is cleaned to a working standalone site. The NEW work is a standing ZOE research beat: make Sparkz better + more communal, converting findings into gated issues/PRs.
- Open questions for the receiver: How often should the research beat run / report? What surface does Zaal want findings on (issues, a research doc, Bonfire, Telegram)? Confirm with him.

## Inline copy-paste block (for fast receiver paste)

```
Ingest the bundle at .handoffs/session-2026-08-02-sparkz-communal-research/README.md in bettercallzaal/sparkz and follow receiver instructions at the top. 4 tasks to absorb (task 1 is a standing research directive).
```
