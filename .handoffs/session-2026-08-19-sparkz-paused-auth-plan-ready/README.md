# Session handoff - 2026-08-19
> from Zaal's mac (Documents/sparkz, branch main) -> to ZOE (cowork bot, via Bonfire + /cockpit inbox)
> doc: .handoffs/session-2026-08-19-sparkz-paused-auth-plan-ready/README.md
> chain: .handoffs/session-2026-08-06-sparkz-overnight-ui-docs-loops/README.md

## Receiver instructions (read me FIRST, then do exactly this)

1. Read ALL sections below (A through E) before responding.
2. Git is clean and fully merged to main - NO diff to apply. Just `git pull`.
3. Create TaskList entries from Section A. NOTE: Sparkz is PAUSED - tasks 1-3 are the
   reopening queue, not standing work. Task 5 STANDS DOWN the 2026-08-06 overnight loops.
4. Use Section B as your "why" - do NOT re-litigate decisions captured there.
5. Once integrated, say: "Ingested handoff sparkz-paused-auth-plan-ready. Queue held. Ready."

## A. Tasks to absorb (paste into your TODO list)

- [ ] WHEN SPARKZ REOPENS (Zaal will say so): execute `docs/AUTH-PLAN.md` steps 1-6 (~2 days) -
      the locked owner-by-FID build (lift the zabalgames JWKS verifier, two doors one session,
      HMAC cookie SameSite=None; Secure, requireHearthOwner, gate swaps, create-spark takes FID
      from the verified session). Done = Zaal signs in with FID 19640 and toggles ZABAL GAMEZ
      integration visibility on trysparkz.com WITHOUT the operator token.
- [ ] Then: runtime spoke gating (~1 day) - wire `getHearthPluginState` into the signal/approval
      loop and call `Connector.status()` on `/c/[slug]`. Today `hearth_spokes` is control-plane
      only; nothing consumes it at runtime.
- [ ] Then: the receipts engine - publish-on-approve via Neynar MANAGED signers (SIWN was
      deprecated 2026-08-14; never copy zaalcaster's send.js SIWN flow for new connections),
      then measure with `GET /v2/farcaster/cast` (1 CU/lookup, 200K free tier) to fill the
      hardcoded-0 reach/referrals/backing_generated on Meme Receipts.
- [ ] Zaal: review + merge ZAOOS research PRs if still open - #3142 (doc 2313, Farcaster auth
      primitives) and #2980 (doc 2251, rebrand + wheel-and-spokes).
- [ ] STAND DOWN the standing overnight UI/docs loops from the 2026-08-06 handoff - Sparkz is
      paused. Holding state only: live + honest on trysparkz.com, repo pristine (main, 0 PRs).
      No autonomous PRs against sparkz until Zaal reopens it.

## B. Why - decisions + pivots + ruled-out paths

- Renamed the core unit **Capsule -> Hearth** (research doc 2251) because "Capsule" collides
  hard (Capsule Wallet a16z, Capsule Social - same audience) and reads as a sealed container,
  not a hub. Integrations are **spokes** on the wheel. Kept "Sparkz" and "backer". Ruled out
  "Studio" (no hub feeling), "Ember"/"Forge"/"Foundry"/"Nexus" (fatal collisions).
- DB rename executed (migration 0005: hearths / hearth_backers / hearth_spokes / hearth_id).
  LESSON: the code PR merged before the migration ran and prod served an empty site for
  minutes (fail-soft reads). For renames: migration FIRST, then code.
- **Launch rules Zaal set: no fake data, no monetization.** Killed the fabricated hero metrics
  (now a no-numbers schematic), deleted test boosts, unpublished /vetted /economics
  /token-timing /patronage /advisor (the advisor recommended Stripe paid tiers - all
  aspirational copy, no payment code ever existed). Kept /community-pool /contribution
  /examples as "options creators experiment with" per Zaal: templates emerge later.
- **Auth decision locked (doc 2313), do not re-open:** two doors one session. Mini-app =
  Quick Auth JWT verified by the lifted zabalgames verifier (107 lines, read in full; Zaal
  FID 19640 already in its allowlist). Web = existing auth-kit client + NEW server-side
  verifySignInMessage. One HMAC httpOnly session, SameSite=None; Secure (doc 591's iframe
  lesson - Lax cookies die in the Farcaster iframe). Context-FID is BANNED for writes
  (host-provided, spoofable). SIWN is dead (deprecated 2026-08-14, verified raw).
- The 2026-08-17 re-audit found the spoke system's per-Hearth toggles are control-plane only
  and receipts have no measurement engine - both now stated honestly in the README
  ("State of the project + roadmap") instead of implied-working.
- The Audius spoke is REAL (live API client, tested: RAC -> 19 tracks, 76k followers), built
  as the first vendor-pattern spoke after Zaal rejected shipping it as a stub.
- Friction log: squash-merges make `merge-base --is-ancestor` lie - always diff CONTENT
  before calling a branch unmerged. Vercel preview deploys are auth-gated - verify on
  trysparkz.com after merge instead. `npm run dev` writes to REAL prod Supabase. GitHub
  secondary-rate-limits parallel PR mutations - go sequential with sleep. `zsh` reserves
  `status` as a variable name.

## C. Git state

- Branch: `main`, in sync with origin, clean (0 dirty). Tip `c4844dc` (PR #305, the
  pre-pause docs snapshot). No uncommitted diff. Untracked: `.handoffs/` +
  `docs/security/audits/` (both gitignored/local by design).

## D. In-flight

- Background bash jobs: none. Subagents: none (all five research/audit agents completed).
- Scheduled wakeups: none. Open AskUserQuestion: none.
- Pending external: ZAOOS PRs #3142 + #2980 await Zaal's review; Cad/Arca P0 fixes still in
  private advisory GHSA-fwqg-p9x7-3xcv (Zaal's lane, untouched).

## E. Cold-start map

- Files touched this session (by theme): the Hearth rename (~90 files + migration 0005);
  spoke system (`src/lib/adapters/connector/`, `src/lib/plugins/community/audius/`);
  launch pass (hero schematic, removed pages, footer/sitemap); owner visibility
  (`/c/[slug]/settings`, `/api/capsules/visibility`, `src/lib/hearth-integrations.ts`);
  docs (README state-of-project, `docs/AUTH-PLAN.md`, ARCHITECTURE/CONTRIBUTING).
- Skills invoked: `zao-research` x2 (docs 2251, 2313 - both PR'd), `clipboard` x5
  (migrations + next-steps for Zaal), `handoff` (this).
- Memory writes: `project_sparkz_state.md` - updated throughout; final entry = the PAUSED
  block pointing at AUTH-PLAN.md as the reopening move.
- Mental model: Sparkz is a live, honest, gold-branded wheel-and-spokes product (Hearths +
  spokes) with the core Meme Engine loop working end to end. Paused deliberately. The whole
  next build is pre-decided and written down in-repo: `docs/AUTH-PLAN.md`.
- Open questions for the receiver: none - the queue is unambiguous; hold until Zaal reopens.

## Inline copy-paste block (for fast receiver paste)

```
Ingest the bundle at .handoffs/session-2026-08-19-sparkz-paused-auth-plan-ready/README.md in bettercallzaal/sparkz and follow receiver instructions at the top. 5 tasks - Sparkz is PAUSED; tasks 1-3 are the reopening queue, task 5 stands down the old overnight loops.
```
