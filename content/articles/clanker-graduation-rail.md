---
title: Clanker is the graduation rail
subtitle: When a spark earns a token, it should be one call - not a migration
date: 2026-07-22
tags: [clanker, tokens, base, graduation]
author: Sparkz
---

Sparkz is tokenless by default. A Capsule accumulates backing, receipts, and momentum
long before anyone asks whether it should have a coin. But when a Capsule does earn
that moment - real community, real funds, real status - the graduation has to be
clean: no migration, no fragmented liquidity, no starting over. That is exactly what
Clanker is built for, which is why it is the token rail Sparkz graduates onto.

## What Clanker is, and where it stands

Clanker is a Farcaster-native token launcher on Base. You can deploy a token by
mentioning a bot, through its web UI, or programmatically through its TypeScript SDK -
and get a live token with liquidity in under a minute.

A note on versions, because it matters for planning. As of this writing the current
production release is **Clanker v4** (the `clanker-sdk` is at v4.2.x on npm). **v5 is
not yet shipped** - the team sent it to audit in late June 2026, and it will ship with
the B20 standard as default. So the honest picture is: build on v4 today, plan the v5
upgrade for when the audit clears. v4 is fully backward-compatible, so this is an
upgrade path, not a rewrite.

## Why the mechanics fit "graduate later"

Three things about Clanker's v4 model make the graduation clean:

**It is one programmatic call.** The SDK exposes a `deployTokenV4` method. Sparkz can
call it from the backend on an explicit operator action - a "graduate" button - with
the full config in one shot: fee tiers, vault/lock, reward recipients, metadata. No
listing process, no manual liquidity dance.

**Fees route into a split you already have.** Clanker lets you set reward recipients
with fixed splits. A graduating Capsule already has an Empire treasury - a 0xSplits
contract on Base - so the token's trading fees can flow straight into the same split
that the tokenless Capsule was already using. Contributors, reserve, and creator keep
their shares whether or not a token exists. That is what makes "the coin is optional"
true in the plumbing, not just the pitch.

**Liquidity is locked, so backers are protected.** Clanker's LP is deposited to a
locker and cannot be withdrawn - a permanent-liquidity guarantee that removes the most
common rug vector. For a platform whose whole thesis is "back the work, not a coin,"
launching onto a rail that structurally cannot rug your backers is the point.

## Creator-first, by default

Clanker's default reward split favors the deployer, and with an interface partner in
the mix the split becomes creator / partner / protocol. That lines up with the Sparkz
creator-first stance (our 1/1/98 default) rather than fighting it. Every trade then
does double duty: it pays the creator and their contributors, and it writes more data
into the Capsule - who bought, when, at what price. The token becomes another stream
into the moat, not a replacement for it.

## What this means for Sparkz today

- The Empire (tokenless create2 + 0xSplits treasury) is the pre-token home. It exists
  from day one and nothing is on-chain until the first interaction.
- The Clanker config seam is already in the Capsule's `economic_config`, ready for the
  graduation call.
- Ship on v4 now; adopt v5 (B20 default) when it clears audit.

A token should be the thing a spark earns the right to launch - and when it does, it
should be a single call that preserves everything the Capsule already built. Clanker
is the rail that makes that true.

---

*Sources: the current `clanker-sdk` release and v4 documentation confirm v4.2.x as
current and v5 as in-audit at time of writing. Fee percentages and protocol economics
evolve - treat specific numbers as a snapshot, and the v4-to-v5 upgrade as the near-term
watch item.*
