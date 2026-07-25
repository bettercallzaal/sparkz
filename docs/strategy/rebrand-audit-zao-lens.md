# Rebrand audit - through the ZAO lens

Audits the Sparkz brand against the actual ZAO worldview, voice, visual identity, and
ownership model (distilled from the ZAO lab: the brand voice guide, the visual identity
spec, the ORDAO/Respect governance docs, the manifesto). This is the ZAO lens, not the
SaaS/business lens of the external commercial audit - the question here is "does Sparkz
read as a genuine ZAO estate project," not "is it a viable SaaS."

Companion to `positioning.md` (OSS monetization, not SaaS). Brand/positioning only - no
commercial numbers.

## The lens (ZAO, in one screen)

- **Values:** build infrastructure ("picks and shovels"), don't capture value; projects
  **graduate to independence** (WaveWarZ is the proof); anti-speculation; **member-owned,
  no investors** - Respect (soulbound, earned, never sold); radical on-chain
  transparency; culture / music / Farcaster-native; real and rural (Maine), not SF/Miami.
- **Voice:** *Confident. Specific. Direct. Never hype.* **Receipts over claims. Numbers
  do the talking. Let the mechanism speak.** Avoid: "ecosystem," "decentralized" (without
  specifics), "innovative," "revolutionary," "disrupting," "drop," "mint," "hodl," "the
  future of music," "we're EXCITED to announce," superlatives, and all VC-speak.
- **Visual:** ZAO Black `#0A0A0A`, ZAO White `#F5F5F5`, **ZAO Gold `#FFD700`** for
  on-chain moments/CTAs; signature gradient `#0047FF -> #9945FF -> #FFD700`; **Space
  Grotesk + JetBrains Mono**; "underground + on-chain," crypto-community-event-poster, not
  corporate.
- **Ownership:** ZOR/Respect soulbound + ORDAO fractal governance (100+ consecutive
  weeks, on-chain settlement); transparent revenue; aligned payouts ("even the loser
  earns").

## Where Sparkz is already ZAO (keep - do not touch)

1. **The anti-speculation spine** - "start with a spark, not a token," "back the album,
   not buy a coin." This is core ZAO. It is the strongest part of the brand.
2. **Meme Receipts.** A receipt of what a moment *earned* is literally the ZAO ethos
   ("receipts over claims," "TX hash, not press release"). The most on-brand primitive in
   the product - lean into it harder.
3. **OSS-first, public, Farcaster-native.** Matches ZAO exactly.
4. **Honest empty states.** The recent cleanup to real `0 / 0 / 0` counts (no fabricated
   "a supporter") is authentically ZAO - "admit what's unproven," numbers you can trust.
5. **Base palette.** Sparkz's `#0a0a0a` background *is* ZAO Black.

## Where it drifts (the rebrand targets)

### 1. The visual system reads "generic Farcaster app," not "ZAO"
- Sparkz flame gradient is orange -> pink -> violet (`#f97316 -> #ec4899 -> #c084fc`,
  `globals.css`). ZAO's signature gradient is **blue -> purple -> gold**
  (`#0047FF -> #9945FF -> #FFD700`). Sparkz leads with violet (Farcaster-generic); ZAO
  leads with gold for the on-chain moment.
- Sparkz uses amber `#fbbf24` where ZAO uses **Gold `#FFD700`** - close but not the
  shared token.
- Sparkz type is Geist Sans/Mono + a display face. ZAO is **Space Grotesk + JetBrains
  Mono**. Adopting these is the single fastest way to make Sparkz visibly share DNA with
  WaveWarZ / COC Concertz / ZABAL.

### 2. Nothing says Sparkz belongs to The ZAO
The brand reads as a standalone product. No "Part of The ZAO," no member-owned / Respect
story, no visible link to the estate, no `/zao` `/zabal` channel presence on the page.
Every real ZAO sub-brand (WaveWarZ, COC Concertz, ZABAL) is unmistakably ZAO. Sparkz
should be too.

### 3. The ownership / collective story is missing from the product brand
`positioning.md` now says OSS/aligned-ownership, but the UI never expresses the anti-SaaS
social contract - member-owned, contributors earn (ZOLs/Respect), revenue transparent.
That story *is* the differentiator; right now it is invisible to a visitor.

### 4. The voice is "warm explainer" where ZAO is "mechanism + receipts"
Sparkz over-explains: *"Here is the whole idea in plain words..."* (README). ZAO would
lead with the mechanism or the number and let it speak. The warmth is fine for the
no-code audience, but the hero should **show a real receipt / a real count**, not
describe the concept.

### 5. "Graduate to a token" is the wrong graduation
ZAO's graduation is **to independence** - WaveWarZ graduated to its own repo and domain.
A token is one *optional* path; the real graduation is a project standing on its own. Say
"graduate to independence (a token only if it fits)," which also reinforces the tokenless
spine.

### 6. Word hygiene: drop "ecosystem"
The footer says "Part of the ZAO ecosystem." ZAO's own voice guide flags **"ecosystem" as
jargon to avoid**. Prefer "Part of The ZAO."

## Rebrand moves (prioritized)

- **P0 - shared identity:** adopt **Space Grotesk + JetBrains Mono**; add **ZAO Gold
  `#FFD700`** as the on-chain/CTA accent; add **"Part of The ZAO"** with a link to the
  estate; reframe graduation as **"to independence."** Low effort, high signal.
- **P1 - voice:** tighten the homepage + README toward receipts-over-claims; once real
  numbers exist, make a **real Meme Receipt the hero** instead of the explainer.
- **P2 - ownership:** surface the **member-owned / contributors-earn / transparent**
  story on the page (straight from `positioning.md`), so the anti-SaaS contract is visible.
- **P3 - gradient:** evolve the flame gradient toward a **ZAO-sanctioned spark variant**
  (keep the flame motif; let gold carry the accent, not violet) so Sparkz shares the ZAO
  gradient DNA rather than reading Farcaster-default.

## What NOT to do (per the ZAO off-brand list)

No "revolutionary / disrupting / future of music," no "we're EXCITED to announce," no
price/speculation talk, no VC-speak (founders/valuations/series-A), no crypto-bro moon
language, no rebranding for its own sake. The mission has been consistent - keep it.

## Net read

Sparkz's **thesis and copy are already ZAO** - the anti-speculation spine and Meme
Receipts are as on-brand as it gets. The gap is **surface, not soul**: the visual system
drifts Farcaster-generic, and the brand doesn't yet *show* that it belongs to The ZAO or
that the collective owns it. The rebrand is mostly P0 (type + gold + "Part of The ZAO" +
"graduate to independence") - a few hours of work that makes Sparkz visibly one of the
family.

## Sources

- ZAO lab (`~/Documents/ZAO OS V1`): brand voice guide, visual identity spec, ORDAO/
  Respect governance, manifesto, whitepaper, `community.config.ts`.
- Sparkz brand surfaces: `README.md`, `src/app/page.tsx`, `src/app/globals.css`,
  `src/app/_components/*`, `CLAUDE.md`, `docs/strategy/positioning.md`.
