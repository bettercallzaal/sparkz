---
topic: farcaster
type: guide
tier: STANDARD
status: research-complete
last-validated: 2026-07-23
original-query: "keep researching (Farcaster Mini Apps - what is Sparkz missing)"
outcome: BUILD
pr: "https://github.com/bettercallzaal/sparkz/pull/189"
---

# Farcaster Mini Apps - what Sparkz was missing

Sparkz is a Mini App. Its whole distribution thesis is "Farcaster eats first." So the
Mini App implementation is not a nice-to-have - it is the funnel. This checks the live
spec against what Sparkz actually ships and converts the gap into a build.

## Findings

### The manifest spec (VERIFIED - miniapps.farcaster.xyz/docs/specification)

Required: `version` "1", `name` (<=32 chars), `homeUrl` (<=1024), `iconUrl`
(1024x1024 PNG), `accountAssociation`. Optional and relevant:

- **`webhookUrl`** (<=1024) - "Must be set if the Mini App application uses
  notifications."
- **`requiredChains`** - CAIP-2 chain IDs.
- **`requiredCapabilities`** - each entry a path to an SDK method.
- **`canonicalDomain`** - a valid domain without protocol/port/path.
- **`noindex`** - boolean, exclude from search.
- **`screenshotUrls`** - up to 3 portrait images at 1284x2778.

### Retention model (VERIFIED)

The spec is explicit that retention hangs on two mechanisms:
1. **Add-to-app** - `sdk.actions.addMiniApp()` "prompts the user to add the Mini App"
   to their apps screen. **This is the prerequisite for notification eligibility.**
2. **Notifications** - delivered via `webhookUrl` to users who added the app.

`addMiniApp()` returns void and throws **`RejectedByUser`** (user declined) or
**`InvalidDomainManifestJson`** (no valid `farcaster.json` or domain mismatch - tunnel
domains fail; the app's domain must exactly match the manifest). Best practice: call it
on a user action, after `ready()`.

### What Sparkz shipped (checked in code, 2026-07-23)

- `src/app/.well-known/farcaster.json/route.ts` - valid manifest with account
  association, category, tags. **No `webhookUrl`, no `canonicalDomain`.**
- `src/app/_components/MiniAppReady.tsx` - correctly calls `sdk.actions.ready()`.
- `src/app/_components/ShareButton.tsx` - correctly uses `sdk.actions.composeCast()`.
- **`grep addMiniApp src/` returns nothing.** The app is never addable.

## What it means for Sparkz

**The single biggest Mini App gap: nobody can add Sparkz.** A Mini App that never calls
`addMiniApp()` is single-use - a visitor opens it once from a cast embed and it is gone.
No apps-screen presence, and - because add-to-app gates notifications - **no ability to
ever notify a backer that a spark they backed just published a receipt.** For a product
whose thesis is "the game is internet traffic," that is the funnel leaking at the top.

## Build decision: BUILD

Passes gate 1 (helps distribution - the core thesis) and gate 3 (adds proprietary data -
who added the app is a real retention signal). Shipped in the same PR:

1. **`AddMiniApp` component** - an "+ Add" button rendered only inside a Mini App (via
   `sdk.isInMiniApp()`), calling `sdk.actions.addMiniApp()` on click, with toast
   feedback that distinguishes `RejectedByUser` from a real error. Placed in the global
   header so it rides along on every page.
2. **`canonicalDomain: "trysparkz.com"`** added to the manifest - cheap correctness that
   also protects `addMiniApp()` from the domain-mismatch failure mode.

### The follow-on (deliberately NOT in this PR - it needs infra)

**Notifications** require `webhookUrl` in the manifest **plus** a webhook route that
receives Farcaster's `miniapp_added` / notification events and stores per-user
notification tokens, plus a sender. That is a real build with storage implications, not
a one-liner. Adding `webhookUrl` without the handler would be wrong (it would advertise
notifications we cannot deliver). Tracked as the next research-to-build:
**"wire Mini App notifications so a backer gets pinged when a spark they backed publishes
a receipt"** - the payoff of the add-to-app we just enabled.

## Sources

- [Mini App specification](https://miniapps.farcaster.xyz/docs/specification) [FULL]
- [addMiniApp action docs](https://miniapps.farcaster.xyz/docs/sdk/actions/add-miniapp) [FULL]
- Sparkz code: `src/app/.well-known/farcaster.json/route.ts`, `MiniAppReady.tsx`,
  `ShareButton.tsx`, `AddMiniApp.tsx` [FULL]

## Next Actions

| Action | Owner | By When |
| --- | --- | --- |
| Ship `addMiniApp()` prompt + `canonicalDomain` (this PR) | Zaal | 2026-07-23 (done) |
| Wire notifications: manifest `webhookUrl` + webhook route + token storage + a "your backed spark published a receipt" ping | Zaal | when a webhook/token-storage decision is made |
