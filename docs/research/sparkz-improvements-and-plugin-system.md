---
topic: infrastructure
type: decision
status: research-complete
last-validated: 2026-08-02
related-docs: farcaster-mini-apps.md, onboarding-friction-create-flow.md, clanker-ecosystem.md
original-query: "Sparkz improvements: (1) what we can improve overall, (2) Farcaster toggles/collaborations we can easily add, (3) easy GitHub integrations to wire in, (4) DEEP on elizaOS plugin architecture so we can build a similar pluggable/toggle system for Sparkz Capsules"
tier: DISPATCH
---

# Sparkz Improvements + a Capsule Plugin System (elizaOS-modeled)

> **Goal:** A ranked, buildable set of Sparkz improvements - easy Farcaster adds, easy
> integrations, communal product features - plus THE architectural move: a unified
> per-Capsule plugin/toggle system modeled on elizaOS, extending the adapter seams
> Sparkz already has.

## Key Decisions (recommendations first)

| # | Decision | Why | Effort |
|---|----------|-----|--------|
| 1 | **Build a unified Capsule Plugin system.** Fold the 4 existing adapter registries (signal-source, backing-provider, approval-channel, media-kit) into ONE `CapsulePlugin` interface + a `capsule_plugins` toggle table. | It is the elizaOS pattern and Sparkz is 70% there already (Map-based `registerX`/`getX`/`listX` + side-effect `bootstrap.ts`). Makes every capability per-Capsule toggleable with no rebuild - directly serves the "additive v1.5" goal in CLAUDE.md. | M |
| 2 | **Ship 4 communal features in v1** (all S): Contributor Leaderboard, Public Activity Feed, Collective/Group Backing, "who you follow also backs this" (Neynar social proof). | Makes Sparkz *feel* communal in weeks, no crypto required. Passes all 4 anti-failure gates (participate, measurable, strengthens Capsule data, testable in 30d). | S each |
| 3 | **Farcaster quick wins** (S): channel-posting on compose-cast (`channelKey`), SIWF profile on receipts, `fc:miniapp` embed already done - lean on it. | Two are already half-built in `ShareButton.tsx` + `layout.tsx`. Cheap distribution + social proof. | S |
| 4 | **Integration quick wins** (S): extend `brand-audit/github.ts` (repo activity + sponsors), Resend email (5 templates), Plausible analytics (8 events). | Unlocks the "can we measure it?" gate and makes OSS-repo Capsules data-rich. | S |
| 5 | **Defer to v1.5:** Stripe fiat backing, 0xSplits *deploy* (read-only display is S/v1), GitHub App + webhooks, Clanker *auto*-deploy. | Medium effort, not blocking. Off-chain splits in Supabase JSON until a token graduates. Clanker stays MANUAL (Sparkz never holds launch keys). | M |

## Finding 1 - The Capsule Plugin system (the architectural move)

**elizaOS model (what to copy).** A `Plugin` is a plain object bundling `actions`,
`providers`, `evaluators`, `services`, and an `init(config, runtime)` lifecycle hook.
Plugins are declared per-agent in `character.plugins: [...]` and loaded at runtime via
`AgentRuntime.registerPlugin(plugin)`, which indexes each component into runtime maps
and awaits `init()`. Cross-plugin dependencies use a service-locator
(`runtime.getService(type)`). Community plugins live in an open registry
(`elizaos-plugins/registry`), one npm package per plugin (`@elizaos/plugin-<name>`).
[PARTIAL - the exact field set of the `Plugin` interface is directionally correct;
verify against `@elizaos/core` `packages/core/src/types` when implementing.]

**The 1:1 mapping to Sparkz** (this is why it is cheap):

| elizaOS | Sparkz |
|---------|--------|
| Character | Capsule |
| `character.plugins: [...]` | `capsule_plugins` rows (per-Capsule toggle) |
| `AgentRuntime` | `CapsuleRuntime` |
| `registerPlugin()` | already have `registerSignalSource()` etc - generalize it |
| Plugin registry (npm) | in-repo `DEFAULT_REGISTRY` first; external packages later |
| `runtime.getService()` | `runtime.getService()` (shared clients: Neynar, Octokit, Stripe) |

**Proposed shape** (fits the existing `src/lib/adapters/*` seams):

```ts
// src/lib/plugins/types.ts
export interface CapsulePlugin {
  id: string;                 // "signal-github", "backing-stripe", "approval-discord"
  version: string;
  name: string;
  // component arrays - each subsumes a current adapter seam
  signals?: SignalSource[];
  backings?: BackingProvider[];
  approvalChannels?: ApprovalChannel[];
  mediaKits?: MediaKit[];
  // config declared like elizaOS pluginParameters (secret-flagged)
  configSchema?: Record<string, { required?: boolean; secret?: boolean; description: string }>;
  init?: (ctx: { capsuleId: string; runtime: CapsuleRuntime; config: Record<string, string> }) => Promise<void>;
}
```

```sql
-- migration: capsule_plugins (RLS on, server-only writes like every table)
create table capsule_plugins (
  id          uuid primary key default gen_random_uuid(),
  capsule_id  uuid not null references capsules(id) on delete cascade,
  plugin_id   text not null,
  enabled     boolean not null default true,
  config      jsonb not null default '{}'::jsonb,   -- per-Capsule keys/settings
  created_at  timestamptz not null default now(),
  unique (capsule_id, plugin_id)
);
alter table capsule_plugins enable row level security;
```

`loadCapsulePlugins(capsuleId)` reads the enabled rows, resolves each from the
registry, and `registerPlugin()`s it into a `CapsuleRuntime`. Migration path: today's
`bootstrap.ts` side-effect imports become `DEFAULT_REGISTRY.register(...)` calls; each
current adapter becomes one component inside a plugin. No behavior change for v1
Capsules that only run the defaults.

## Finding 2 - Easy Farcaster adds (grounded in the installed SDK)

Deps present: `@farcaster/miniapp-sdk ^0.3`, `@farcaster/auth-kit ^0.8`,
`miniapp-wagmi-connector`, wagmi, viem. Two features are ALREADY half-built.

| Feature | Effort | API | Needs paid key | Communal value |
|---------|--------|-----|----------------|----------------|
| Compose-cast + channel post | S | `sdk.actions.composeCast({ text, embeds, channelKey })` or `warpcast.com/~/compose?...` (already in `ShareButton.tsx`) | No | Backers share receipts/milestones into #zao etc |
| `fc:miniapp` embed / Frame | S (done) | meta tag in `layout.tsx` (`launch_miniapp`) | No | Capsule links render as launch cards in-feed |
| SIWF profile on receipts | S | `useSignIn()` -> `{ fid, username, pfpUrl }`, verify server-side | No | FID-gated backing, real faces on receipts |
| Neynar "who you follow also backs this" | M | `GET /v2/farcaster/user/followers` + overlap with backer FIDs | Free tier (~1M credits/mo) | THE communal social-proof win |
| Add Mini App + notifications | M | `sdk.actions.addMiniApp()` -> notification token; server sends "new receipt"/"milestone hit" | Freemium | Re-engagement loop |
| Channel-gated Capsules | S | pass `channelKey`; read membership via Neynar | Free tier | Community-scoped Capsules |

## Finding 3 - Easy integrations

| Integration | Effort | v1? | Note |
|-------------|--------|-----|------|
| GitHub REST extend (`brand-audit/github.ts`) | S | v1 | repo activity + sponsors + live contributors; 5000 req/hr w/ token audits ~100 repos; cache in Supabase (1d TTL) |
| Resend email | S | v1 | 5 templates (welcome, backer, milestone, payout, digest); free 100/day |
| Plausible analytics | S | v1 | privacy-first; events: signal_flagged, meme_drafted/approved/published, backer_joined, remix_*; free 10k/mo |
| Neynar (read-only) | S | v1 | profile + engagement; free tier ample |
| 0xSplits (read) | S | v1 | display splits config; deploy on-chain deferred to v1.5 |
| Stripe (fiat backing) | M | v1.5 | non-wallet backing; PaymentIntent + webhook |
| GitHub App + webhooks | M | v1.5 | live repo events -> Meme Signals |
| Clanker | M | v1 (manual) | show "ready to graduate"; creator deploys on clanker.world, Sparkz prefills - never hold keys |
| IPFS/Arweave receipts | S | v1.5 | permanence once receipts are user-facing proof |

## Finding 4 - Communal product features (Supabase-cheap)

Build in v1 (S each): **Contributor Leaderboard** (`contributor_stats` view), **Public
Activity Feed** (`activity_log` + Supabase realtime), **Collective/Group Backing**
(`backing_group` + members - "9 of your friends backed this"), **Capsule Templates**
(Creator/Culture/OSS/Event presets), **Cross-Capsule Meme Lineage** (`meme_parent_id`
on `meme_receipts` - already has `parent_meme_id`; surface it). v1.5: multi-owner
Capsules, contributor badges/reputation, opt-in backer social proof.

All hold the positioning guardrail (`docs/strategy/positioning.md`): back the album,
not buy a coin; token optional/later; distribution human-approved.

## Also See
- [Farcaster Mini Apps](farcaster-mini-apps.md)
- [Onboarding friction - create flow](onboarding-friction-create-flow.md)
- [Clanker ecosystem](clanker-ecosystem.md)

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Draft the `CapsulePlugin` interface + `capsule_plugins` migration + `CapsuleRuntime`, PR to sparkz (generalize the existing 4 adapter registries) | @Zaal | PR | 2026-08-16 |
| Ship Contributor Leaderboard + Public Activity Feed (Supabase view + realtime), PR merged | @Zaal | PR | 2026-08-16 |
| Wire Neynar "who you follow also backs this" on the Capsule page (social-proof), PR merged | @Zaal | PR | 2026-08-23 |
| Add `channelKey` to compose-cast + SIWF profile on receipts, PR merged | @Zaal | PR | 2026-08-16 |
| Extend `brand-audit/github.ts` (repo activity + sponsors) + add Plausible events, PR merged | @Zaal | PR | 2026-08-23 |
| Verify the elizaOS `Plugin` interface field set against `@elizaos/core` before finalizing the CapsulePlugin type | @Zaal | Research | 2026-08-16 |

## Sources
- [elizaOS/eliza GitHub](https://github.com/elizaOS/eliza) [PARTIAL - core Plugin type inferred from docs + runtime; verify fields in packages/core]
- [elizaOS Plugins org + registry](https://github.com/elizaos-plugins) [FULL]
- [Plugins - eliza docs](https://eliza.how/docs/core/plugins) [FULL]
- [Farcaster Mini Apps SDK](https://miniapps.farcaster.xyz/docs/getting-started) [FULL]
- [Farcaster auth-kit](https://github.com/farcasterxyz/auth-monorepo) [FULL]
- [Neynar API docs](https://docs.neynar.com) [FULL]
- [0xSplits docs](https://docs.0xsplits.xyz) [FULL]
- [Resend docs](https://resend.com/docs) [FULL]
- [Plausible docs](https://plausible.io/docs) [FULL]
- [GitHub REST API](https://docs.github.com/en/rest) [FULL]
- Codebase: `src/lib/adapters/{signal-source,backing-provider,approval-channel,media-kit}/`, `src/lib/adapters/bootstrap.ts`, `src/lib/brand-audit/github.ts`, `src/app/_components/ShareButton.tsx`, `src/app/layout.tsx` [FULL]
