# The last month: Base Beryl, Clanker V5 status, and where Farcaster actually is

Snapshot as of **2026-07-23**. Covers the biggest shipped infrastructure of the last
month and the current state of the two platforms Sparkz depends on.

## The big build of the last month: Base Beryl (mainnet 2026-06-25)

Source: [Base engineering blog](https://blog.base.dev/introducing-base-beryl)
(testnet 2026-06-18, mainnet **2026-06-25**; next upgrade **Cobalt targeted September
2026**).

Three things shipped:

1. **B20 native token standard** - precompiled contracts in the node software rather
   than smart contracts, with full ERC-20 compatibility. Issuer-focused features:
   role-based access control, transfer policies, freeze-and-seize, optional transfer
   memos. **Two variants: Asset** (general purpose, supports rebasing) and
   **Stablecoin** (fixed 6-decimal precision with currency codes).
2. **Withdrawal delay cut from 7 days to 5** on the common single-proof path. "With
   Multiproofs, finalization instead requires a positive TEE or ZK proof, so the
   remaining delay serves a narrower purpose."
3. **Reth V2 / Storage V2** - execution-client overhaul targeting "the two things that
   most constrain a high-throughput chain: how much disk a node needs, and how quickly
   it can compute state roots." Reported elsewhere as up to ~50% less disk and ~33% more
   throughput.

**Coming next for B20:** gas payment in native tokens, virtual deposit addresses,
indexed data from RPCs, **~50% cheaper transfers, and doubled throughput**.

Note: B20 "arrives with its switches off" - deployed at activation, but not every
feature immediately active. Mainnet slipped a day (to the 26th in some reporting) to
complete the B20 registry.

### The strategic signal - read this twice

Base states plainly who Beryl is for: **regulated asset issuers**. Their rationale:
*"we've consistently seen issuers rebuild compliance features from scratch, slowing
their speed to market and introducing the risk of missteps."* Target use cases are
**stablecoins, real-world assets, and regulated tokens - explicitly not consumer apps.**

Put that next to the rest of the timeline:

- **Feb 2026** - Base discontinued Creator Rewards and removed the social feed,
  refocusing on trading and stablecoin payments.
- **2026-06-25** - Beryl ships a compliance-first token standard aimed at regulated
  issuers.
- **2026-07-13** - Coinbase's CEO publicly concedes the content-coin strategy failed.

**Base has pivoted to institutional asset issuance and away from the creator economy.**
That is not a rumour; it is in their own engineering blog and their CEO's own admission.

### What that means for Sparkz (it is not all bad)

- **The infra wins are free.** Cheaper transfers, doubled throughput, cheaper nodes, and
  faster withdrawals help Sparkz whether or not Base cares about creators.
- **The default direction of B20 is issuer control** - roles, policies, freeze-and-seize,
  built for compliance. That makes Sparkz's opposite choice sharper, not weaker:
  **graduate admin-less** (`initialAdmin == address(0)`) and **show the role
  configuration on the Capsule page**. When the standard's gravity is toward control,
  "provably nobody can freeze or seize your holders" becomes a real differentiator.
- **The creator-economy lane on Base is vacated, not contested.** Base went upmarket to
  RWAs and stablecoins. Nobody big is serving creators on this stack right now.

## Clanker V5: still not shipped (as of 2026-07-23)

- `clanker-sdk` latest release remains **v4.2.18 (July 8, 2026)**. No v5 release or
  branch; the DOCS repo still documents V4 as current.
- No V5 launch announcement found in June or July reporting. The most recent
  substantive CLANKER coverage indexed is from March 2026.
- **Caution:** a DexScreener pair literally named **"Clanker V5"** trades on Base. That
  is a token someone named after the upcoming release - **not** the protocol version.
  Do not cite it as evidence V5 shipped, and do not let anyone in the space confuse it.

**Practical read:** V5 remains post-audit and unannounced. Build the graduation rail on
v4 now; treat V5 (and B20-by-default) as the upgrade to design for, not wait on.

## Farcaster now, under Neynar

- **Neynar acquired Farcaster on 2026-01-21** - the protocol contracts and repos, the
  Farcaster app, and Clanker all transferred. **Jack from the Clanker team joined
  Neynar.** Founders Dan Romero and Varun Srinivasan stepped back; ~$180M is being
  returned to investors. Backed by Paradigm and a16z crypto.
- **Neynar's stated vision:** *"Enable builders to go from idea to recurring revenue,
  supported by a builder-first network."* No immediate product changes; they described a
  prioritisation exercise and "a small team so we will walk before we run."
- **Monetization exists:** a **$10/month Farcaster Pro** subscription (longer posts,
  more images). **There is no native protocol token** as of 2026 - a `$WARPS` idea has
  been discussed but not committed. **DEGEN** remains the community token most
  associated with the network.
- **Scale, honestly:** ~**34k DAU** (Jan 2026), DAU down ~40%, revenue down ~85%, with
  100k+ funded wallets. MAU figures conflict badly across outlets (250k vs under 20k) -
  do not quote a Farcaster MAU number publicly without re-verifying it.
- **Who is building:** clients and apps like **Nook** and **Kiosk**, Farcaster-native
  gaming via **Farworld Labs** (Variant-backed), **Bountycaster** for bounties,
  **Rounds.wtf** for community token rewards, and incubators like Builders Garden
  running mini-app cohorts. Discovery happens through **Launchcaster** and the client's
  trending Mini Apps view.

**Note:** Farcaster-native activity is poorly indexed by web search. Specific mini-app
launches from the last month did not surface; the reliable way to track this is
Launchcaster and the in-client trending view, not Google.

## The synthesis worth carrying into the space

**Base went institutional. Farcaster went builder-first. The creator-economy gap between
them is exactly where Sparkz sits.**

- Base's own upgrade targets regulated issuers, not consumer apps.
- Neynar's own vision is builders going from **idea to recurring revenue** - which is a
  near-verbatim description of what a Capsule does (start with a spark, accumulate
  backing and receipts, graduate only if it fits).
- The token-first creator model is publicly dead, and the compliance-first token standard
  makes **admin-less graduation** a differentiator with an on-chain proof.

Sparkz is aligned with the new owner's stated direction and counter-positioned against a
conceded failure. The risk is not positioning - it is that the host network is small and
the pre-token business model is still unanswered.
