---
topic: base
type: decision
tier: STANDARD
status: research-complete
last-validated: 2026-07-23
original-query: "should graduations default to admin-less B20"
outcome: BUILD
pr: "https://github.com/bettercallzaal/sparkz/pull/190"
---

# Should Sparkz default graduations to admin-less B20?

Decision doc. Builds on `clanker-v5-b20-research.md` (B20 mechanics) and
`clanker-ecosystem.md` (fees), with a new competitive-baseline pass on who else lets a
creator launch a token nobody controls - and who discloses it.

## Findings

### B20 makes "nobody controls this token" a real, checkable state (VERIFIED)

From the Base B20 spec: a B20 has seven roles including `DEFAULT_ADMIN_ROLE`,
`MINT_ROLE`, `BURN_BLOCKED_ROLE`, `PAUSE_ROLE`. **Freeze-and-seize is real** -
`burnBlocked()` "burns from a third party's balance" when an account is blocked by
transfer policy. It is **opt-in** (policies default to `ALWAYS_ALLOW`), and a token can
**launch admin-less**: pass `initialAdmin == address(0)` at inception, or call
`renounceLastAdmin()` later, which "permanently locks all admin functions." So
"provably nobody can freeze, seize, mint, or pause your holders" is not marketing - it
is an on-chain fact anyone can read.

### The competitive baseline (REPORTED - see caveat)

- **Clanker:** initial liquidity is "locked forever and cannot be accessed by the token
  creator, the Clanker team, or the interface." Good. **But** the token admin "may
  change the reward type at any time post-deployment" and may reset the beneficiary - so
  a Clanker token is not fully hands-off; some admin control persists. No documented
  full-renunciation path.
- **Zora:** creator/content coins; the cautionary tale (down ~95%). Not a
  credible-neutrality story.
- **Nobody in this space advertises "your token is admin-less and here is the proof."**
  The disclosure itself is unoccupied ground.

### A strategic finding that is NOT verified - flagged, not shipped

Secondary search results state that when a token launches via an **interface partner**,
the split is **40% creator / 40% interface partner / 20% Clanker**. If true, that is a
direct answer to the open "how does Sparkz make money pre-nothing" question - Sparkz as
an interface partner would earn 40% of the creator fee tier on graduations it routes.

**This is REPORTED, not VERIFIED.** I could not confirm the 40/40/20 split or the
interface-partner registration path in Clanker's primary docs (the creator-rewards page
only states the flat 20% protocol take). Per the publishable-numbers rule it **does not
go in any product surface** until confirmed. It is a top question for the space.

## What it means for Sparkz

Base's own standard leans toward issuer control (that is who Beryl is for). Sparkz
choosing the opposite - **admin-less by default, with the role config shown on the
Capsule page** - is a differentiator that (a) matches the thesis (no vendor lock), (b)
costs nothing, and (c) is provable on-chain, which no competitor claim is. It turns
"we don't lock you in" from a slogan into a checkable fact.

## Decision: BUILD

Passes gate 1 (trust is a distribution unlock) and gate 3 (the disclosed role config is
proprietary, per-Capsule data). Shipped this PR:

- **"Your token, provably yours" block** in the graduation panel: explains B20
  freeze/seize exists, that it is opt-in, that Sparkz defaults graduations to admin-less,
  and that the role config will be shown on the Capsule page as a checkable fact.
- Framed honestly as the **commitment**, because no graduation is live yet - it does not
  claim a running token is admin-less; it states the default Sparkz will hold when
  graduation ships.

Also fixed the stale `pr: #187` reference in `farcaster-mini-apps.md` (actual PR was
#189).

### The build that makes this provable (tracked, needs the graduation flow)

When the Clanker/B20 graduation is actually built, the Capsule page should **read the
token's on-chain role assignments and render them** ("admin: none", "mint: locked",
"freeze policy: none"). That closes the loop from commitment to proof. Blocked on the
graduation flow existing (which is blocked on Clanker V5 / B20-default shipping).

## Sources

- [Base B20 spec](https://docs.base.org/base-chain/specs/upgrades/beryl/b20) [FULL]
- [Clanker token deployments / ownership](https://clanker.gitbook.io/documentation/general/token-deployments) [PARTIAL - ownership/renounce specifics not fully documented]
- [Clanker creator rewards and fees](https://clanker.gitbook.io/documentation/general/creator-rewards-and-fees) [FULL - confirms flat 20%; does NOT confirm the 40/40/20 interface split]
- Web search summary asserting 40/40/20 interface split [REPORTED - unverified]
- Sparkz code: `src/app/_components/GraduationPanel.tsx` [FULL]

## Next Actions

| Action | Owner | By When |
| --- | --- | --- |
| Ship the "provably yours" admin-less commitment block (this PR) | Zaal | 2026-07-23 (done) |
| At the space: confirm the interface-partner split (40/40/20?) and how to register Sparkz as one | Zaal | 2026-07-23 |
| When graduation is built: read + render the token's on-chain B20 roles on the Capsule page | Zaal | when Clanker V5 / B20-default ships |
