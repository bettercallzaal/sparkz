# Clanker V5, B20, and Droids - research for the Sparkz graduation rail

Researched 2026-07-23, ahead of the Farcaster space with Quazia, Berserker, and
DiviFly. Everything here is from primary sources (Base specs, Clanker docs, the SDK
releases) unless marked otherwise. Numbers are quoted so they can go straight into
the Sparkz fee-transparency panel.

## 1. V5 status: not shipped yet

- `clanker-sdk` latest published release is **v4.2.18 (July 8, 2026)**. No v5 release,
  no v5 branch, no B20 code.
- The [Clanker DOCS repo](https://github.com/clanker-devco/DOCS) still treats **V4 as
  the current version**. There is no public V5 or B20 documentation.
- Consistent with the team's "sending V5 to audit" post (~June 25) and "V5 with the
  B20 standard as default".

**So:** build on v4 today; V5 is the near-term upgrade, not a blocker.

## 2. B20 - the actual headline (and it is a Base-level change)

B20 is **Base's native token standard**, shipped in the **Beryl upgrade, live on Base
mainnet since 2026-06-25**. Source: [Base B20 spec](https://docs.base.org/base-chain/specs/upgrades/beryl/b20).

- **Rust precompiles, not EVM contracts.** All tokens deploy through a singleton
  `B20Factory` precompile at a fixed address - "faster, cheaper, and more native to
  the chain."
- **Strict superset of ERC-20.** "Every ERC-20 call (`transfer`, `transferFrom`,
  `approve`, `balanceOf`, `allowance`, and the standard events) behaves exactly as the
  standard specifies, so existing ERC-20 tooling and integrations work against B20
  with no changes." **0xSplits, Uniswap, and wallets keep working - no migration.**
- **Adds beyond ERC-20:** memos (`bytes32` payloads on operations), mint/burn,
  ERC-2612 permit, granular pause (`TRANSFER` / `MINT` / `BURN` independently),
  transfer policies, supply caps.
- **Transfer policies:** four scopes (sender, receiver, executor for `transferFrom`,
  mint recipient), each either allowlist (default-deny) or blocklist (default-allow).
- **Seven roles:** `DEFAULT_ADMIN_ROLE`, `MINT_ROLE`, `BURN_ROLE`, `BURN_BLOCKED_ROLE`,
  `PAUSE_ROLE`, `UNPAUSE_ROLE`, `METADATA_ROLE`.

### The part that matters for a no-vendor-lock product

- **Freeze-and-seize is real.** `burnBlocked()` "burns from a third party's balance"
  when that account is blocked by transfer policy. An issuer holding
  `BURN_BLOCKED_ROLE` plus a blocking policy **can seize a holder's tokens**.
- **It is opt-in.** Policies default to `ALWAYS_ALLOW`: "An unattended B20 deployment
  is fully open - token behavior must be intentionally constrained."
- **Admin-less launch is possible.** Pass `initialAdmin == address(0)` at inception, or
  call `renounceLastAdmin()` later, which **permanently locks all admin functions**.

**The question for the space:** when Clanker V5 deploys a B20 by default, **who holds
the admin roles - Clanker, the creator, or nobody?** That single answer decides whether
a "creator coin" is genuinely creator-owned or platform-controlled. It is the
vendor-lock question made concrete, and it is now a checkable on-chain fact.

**The Sparkz opportunity:** default graduations to **admin-less B20** (or
creator-held-and-disclosed), and **show the role configuration on the Capsule page** -
a provable "nobody can freeze, seize, mint, or pause your holders" guarantee. No other
launcher is publishing this.

## 3. Droids - the token-funded agent

Source: [Clanker droids docs](https://clanker.gitbook.io/documentation/droids/droids.md)
and the funding page.

- A droid is "an AI agent attached to a Clanker token. It has its own Farcaster
  account, casts and replies in a voice you write, and is funded by the token itself."
- **Human-in-the-loop by design:** "It is not autonomous with your money. You approve
  every cast, replies happen on its own in persona, and the droid's wallet is
  sandboxed." Casting needs approval; **replies are autonomous**.
- **Funding:** "a carve-out of the token's LP rewards is routed to the droid's runtime
  wallet" to pay inference. **Default 1000 bps (10%) of LP rewards, configurable at
  launch from 1% to 50%**, taken from the largest paired-token reward admin slot.
- Out of funds: the next inference throws `Insufficient USDC runway` and the droid
  stops until topped up. **Anyone can top it up** with USDC on Base, and **creators can
  route the fee share to an arbitrary contract (a treasury or splitter)** instead of the
  default wallet.
- **Limits:** replies stop at 5 levels deep, fresh mentions checked from the last 30
  minutes, replies in authored threads last 24 hours.
- **No bring-your-own-key** is documented. FID ownership is **not clarified** in the docs.

### What this means for Sparkz

1. **Nounish Prof's "cheeky intern" instinct is literally the droid model** -
   reply-autonomous, cast-approved. Our agent already defaults to human-in-the-loop, so
   the designs agree. Good sign.
2. **"Voice design is the single biggest lever on whether a droid is good"** - which is
   exactly why the persona work matters more than the plumbing.
3. **The droid funding model is arguably better-aligned than BYOK *once a token
   exists*** - the token's own LP rewards pay for compute, so neither the creator's
   wallet nor the platform's take funds it.
4. **But it does not work pre-token, and that is the Sparkz gap.** A tokenless spark has
   **no LP rewards to carve from**. So Sparkz still needs BYOK (or another funding path)
   for the agent that runs *before* a token exists - which is the whole point of a spark.
   That is a genuine product wedge, not a complaint.
5. **Integration point:** creators can route the droid carve-out to an arbitrary
   splitter - i.e. **straight into a Capsule's 0xSplits treasury.**

## 4. Clanker v4 fees - exact numbers

Source: [Creator rewards and fees](https://clanker.gitbook.io/documentation/general/creator-rewards-and-fees).

- **The protocol takes a fixed 20% of LP fees** collected at the pool level.
- Creator picks a fee tier; protocol takes 20% of it:

  | Creator | Protocol | Total swap fee |
  | --- | --- | --- |
  | 1% | 0.2% | 1.2% |
  | 2% | 0.4% | 2.4% |
  | 3% | 0.6% | 3.6% |

- Rewards are claimed from the token's admin page on clanker.world.
- **Gotcha worth disclosing:** creators earn **only on the initial LP**. "Token creators
  will not earn any rewards" on secondary pools or user-deposited LP.
- History: v3.1 and earlier charged up to 0.6% (WETH or project token); v4 moved to
  0.2% in WETH only. Fee control was permanently handed to creators (claim or burn).

## 5. Empire Builder - the layer Sparkz builds on

Source: [empirebuilder.world](https://www.empirebuilder.world/landing).

- An Empire is "a community hub for your token, Farcaster profile, or anything you are
  building an audience around" - leaderboards, treasuries, staking, and reward payouts
  in one place.
- **Leaderboards:** token balances, NFT holdings, social activity, staked balances, and
  **custom rankings via external API or CSV upload** (this is the "mirror your own
  leaderboard in" path from the brainstorm - confirmed).
- **Boosters:** score multipliers from staking, NFT/token holdings, or reputation.
- **Treasuries:** non-custodial smart vaults **via a Splits partnership**, controlled by
  you with optional guardians. (Confirms the 0xSplits path Sparkz already uses.)
- **Rewards:** weighted, even-split, or random distribution; NFT/ERC-20 airdrops.
- **Fees are NOT publicly disclosed anywhere on the site or docs.**

**Note for the transparency thesis:** the ~20% to the Empire team (Zaal's figure from
working with them) is **not published publicly**. Sparkz publishing it would be
disclosing more than the partner does - which is exactly the stated condition for
integrating ("as long as they are okay with us telling people what their fees come with
and what they get"). Worth confirming the number and the permission directly.

## 6. Landscape - the token-first model was publicly conceded as failed

- **2026-07-13: Coinbase CEO Brian Armstrong publicly admitted Base's content-coins
  strategy failed**, after more than a year of pushing it.
- **February 2026: Base discontinued "Creator Rewards" and removed the social feed**,
  refocusing on trading and stablecoin payments.
- **ZORA fell ~95%**, roughly **$500M of market cap evaporated**; Base developers
  complained the resource allocation crowded out other projects.
- Armstrong was still defending the model in January and reversed by July.
- Commentary frames it as the unsustainability of **zero-sum token models in creator
  economies**.

**Why this matters:** the token-first creator-coin thesis was conceded as a failure by
its biggest backer **nine days before the Nounish Prof brainstorm**. Sparkz shipping
"start with a spark, not a token" right now is not contrarian for its own sake - it is
the direct answer to a publicly admitted failure. That is the strongest positioning
Sparkz has, and it should be said plainly.

## 7. Actions this research suggests

1. **Ask Quazia:** who holds B20 admin roles on a V5-deployed token? Can Sparkz-launched
   tokens ship **admin-less** (`initialAdmin == address(0)`)?
2. **Ask about droids:** FID ownership, and whether BYOK is on the roadmap for the
   pre-token case.
3. **Update the Sparkz transparency panel** with the exact numbers above (Clanker 20% of
   the creator fee; droid carve-out 10% default / 1-50%; Empire's cut pending
   confirmation + permission).
4. **Design "admin-less by default" + on-page role disclosure** as a Sparkz
   differentiator for graduation.
5. **Solve pre-token agent funding** (BYOK) - the droid model cannot cover a tokenless
   spark, and that is exactly where Sparkz lives.
