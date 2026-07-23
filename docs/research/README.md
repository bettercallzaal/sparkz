# Sparkz research

Primary-source research behind the product decisions. Every number here is meant to be
quotable - if a figure is uncertain or from secondary reporting, it says so. Re-verify
before publishing anything in a public Sparkz surface.

| Doc | What's in it |
| --- | --- |
| [Clanker ecosystem](clanker-ecosystem.md) | The graduation rail: ownership chain (Farcaster -> Neynar), exact v4 fees, CLANKER token economics, traction, V5 status, and Droids (incl. the pre-token funding gap Sparkz owns). |
| [Farcaster and the potential](farcaster-and-the-potential.md) | The honest read: Farcaster's real size and direction post-Neynar, the publicly conceded failure of token-first creator coins, the competitive landscape, and what is genuinely strong vs genuinely risky for Sparkz. |
| [Base Beryl + recent builds](base-beryl-and-recent-builds.md) | The last month: Beryl shipped 2026-06-25 (B20, 7->5 day withdrawals, Reth V2) and Base states plainly it is for **regulated issuers, not consumer apps**. Clanker V5 still unshipped. Farcaster's current state under Neynar. |
| [Clanker V5 + B20](../notes/clanker-v5-b20-research.md) | Deep dive on B20 (Base's native token standard): what it adds, the seven roles, freeze-and-seize, admin-less launch, and the question that decides whether a "creator coin" is creator-owned. |
| [Nounish Prof brainstorm](../notes/nounish-prof-brainstorm.md) | Takeaways and improvements from the 2026-07-22 brainstorm - fee transparency, the on-ramp ladder, agent options, the soul-code idea, the cheeky-intern voice. |

## The three findings that matter most

1. **Token-first was publicly conceded as a failure.** Coinbase's CEO admitted Base's
   content-coin strategy failed on **2026-07-13**; Base killed Creator Rewards in
   February; ZORA is down ~95%. "Start with a spark, not a token" is the direct answer
   to a documented failure, not a contrarian bet.

2. **B20 makes creator-ownership provable.** Base's native standard (live since
   2026-06-25) ships real freeze-and-seize powers - but they are opt-in, and a token can
   launch **admin-less** (`initialAdmin == address(0)`). Sparkz can graduate tokens that
   provably nobody can freeze, seize, mint, or pause, and show the role config on the
   Capsule page. No competitor is doing this.

3. **Sparkz owns the pre-token gap.** Clanker Droids fund their agent from a carve-out of
   LP rewards - which cannot exist before a token does. The agent that runs for a
   *tokenless* spark is a hole only Sparkz is positioned to fill.

4. **Base went institutional; Farcaster went builder-first; Sparkz sits in the gap.**
   Base's own Beryl post says the upgrade targets **regulated issuers, stablecoins, and
   RWAs - "not consumer apps"**. Neynar's stated vision for Farcaster is **"enable
   builders to go from idea to recurring revenue"** - a near-verbatim description of a
   Capsule. The creator lane on this stack is vacated, not contested.
