# Clanker - the ecosystem Sparkz graduates onto

Researched 2026-07-23. Primary sources where possible; secondary reporting marked.
Numbers here are meant to be quotable in the Sparkz transparency surfaces.

## What Clanker is

A token deployment protocol on Base (also Arbitrum, Monad, BNB, Ethereum). Its AI agent
launches a tradable token when you mention `@clanker` in a Farcaster cast; it also has a
web UI and a TypeScript SDK. Founded by **Jack Dishman (@dish)**, a Farcaster engineer,
with **Proxy (@proxystudio.eth)**. Launched **November 2024** (some sources say Nov 2023
- treat the exact month as unconfirmed).

Three deployment paths: the Farcaster bot, `clanker.world/deploy`, and `clanker-sdk`.

## Ownership chain (this matters)

1. **October 2025 - Farcaster acquired Clanker.** CLANKER rose ~350-360% that week.
2. **January 2026 - Neynar acquired Farcaster** (see the Farcaster doc). So Clanker is
   now owned by Neynar, via Farcaster.

**Implication for Sparkz:** the token rail, the social protocol, and the dominant infra
provider are now **one company**. That is convenient (tight integration) and a
concentration risk (one vendor across identity, distribution, and token issuance).
Sparkz's adapter seams are the hedge - keep the rails swappable.

## Fees and creator rewards (v4, exact)

Source: Clanker docs, "Creator rewards and fees".

- **The protocol takes a fixed 20% of LP fees** at the pool level.
- The creator picks a fee tier; the protocol takes 20% *of that*:

  | Creator fee | Protocol | Total swap fee |
  | --- | --- | --- |
  | 1% | 0.2% | 1.2% |
  | 2% | 0.4% | 2.4% |
  | 3% | 0.6% | 3.6% |

  Formula: `CreatorFee * 0.2 = protocol take`.
- Rewards are claimed from the token's admin page on clanker.world.
- **Disclose this gotcha:** creators earn **only on the initial LP**. "Token creators
  will not earn any rewards" from secondary pools or user-deposited LP.
- History: v3.1 and earlier took up to 0.6% (WETH or project token); v4 moved to 0.2%
  WETH-only. Fee control was later handed permanently to creators (claim or burn).

## CLANKER token economics

- After the Farcaster acquisition, **two-thirds of current and future protocol fees buy
  and hold CLANKER**; the remaining third is kept in USDC for tax/ops. (Reported: one
  day's buy was ~$65k.)
- ~7% of supply was locked in one-sided liquidity to deepen markets.
- **Clanker Ecosystem Fund** recycles protocol fees to builders - **$8M deployed to buy
  14% of CLANKER supply**, with future fees earmarked for infrastructure and community
  across Clanker and Farcaster.

**Read:** the protocol is explicitly designed so usage accrues to CLANKER holders. If
Sparkz routes volume onto Clanker, it is feeding that flywheel. Fine - but say it out
loud in the transparency panel rather than letting a creator discover it.

## Traction

- **Over $50M in cumulative protocol fees** since inception.
- **Fourth-largest protocol on Base by weekly revenue** (as reported).
- Thousands of tokens deployed across chains.

This is the strongest argument for graduating onto Clanker rather than rolling our own:
it is a real, revenue-generating, audited rail with liquidity plumbing solved.

## V5 status

- **Not shipped.** `clanker-sdk` latest is **v4.2.18 (July 8, 2026)**; no v5 release or
  branch. The DOCS repo still treats V4 as current; no public V5/B20 docs.
- Sent to audit ~June 25; ships with **B20 as the default standard**.
- See `clanker-v5-b20-research.md` (in `docs/notes/`) for the full B20 breakdown -
  including the admin-role/freeze-and-seize question that decides whether a
  "creator coin" is actually creator-owned.

## Droids - the token-funded agent

- "An AI agent attached to a Clanker token. It has its own Farcaster account, casts and
  replies in a voice you write, and is funded by the token itself."
- **Human-in-the-loop by design:** "You approve every cast, replies happen on its own in
  persona, and the droid's wallet is sandboxed."
- **Funding:** a carve-out of the token's LP rewards pays inference. **Default 1000 bps
  (10%), configurable 1%-50%** at launch, from the largest paired-token reward slot.
- Runs dry -> `Insufficient USDC runway`, droid stops until topped up. **Anyone can top
  it up** with USDC on Base, and the carve-out **can be routed to an arbitrary contract
  (a treasury or splitter)**.
- Limits: replies stop 5 levels deep; fresh mentions from the last 30 minutes; replies
  in authored threads last 24 hours.
- **No BYOK documented. FID ownership is not clarified in the docs.**

### Three takeaways for Sparkz

1. The droid model **is** the "cheeky intern" pattern (reply-autonomous, cast-approved) -
   our agent's human-in-the-loop default already agrees with it.
2. The carve-out can be pointed at a **Capsule's 0xSplits treasury** - a clean
   integration point.
3. **The gap we own:** droid funding requires LP rewards, so it cannot fund an agent
   **before a token exists**. A tokenless spark has no LP to carve. Pre-token agent
   funding (BYOK or otherwise) is exactly the Sparkz-shaped hole.

## Open questions for the Farcaster space

1. On a V5 (B20) deployment, **who holds the admin roles** - Clanker, the creator, or
   nobody? Can Sparkz launch **admin-less** (`initialAdmin == address(0)`)?
2. Droids: **who owns the FID**, and is **BYOK** on the roadmap for the pre-token case?
3. Does the **20%-of-creator-fee** protocol take change in V5?
4. Any interface-partner program (a revenue share for a launcher like Sparkz), and what
   would Sparkz be permitted to publish about it?
