# Sparkz MVP - readiness + brand-test playbook

Step-back assessment (2026-07-22), updated 2026-11-19. The question this answers: **can a real ZAO brand
test Sparkz today, and what's the minimum to say yes?**

## The MVP, in one line

A brand can (1) have a Hearth page, (2) get real people to **back/boost** it,
(3) **light a Spark** on it (a moment, a token, an NFT drop, a bounty, an event), and
(4) **share it to Farcaster**.

Everything else (empire, token) is past-MVP.

## Scorecard

| MVP capability | Status | Note |
|----------------|--------|------|
| 1. Hearth page (identity, live) | DONE | `/c/[slug]`, 7 brands live |
| 2. Public backing / boost | DONE | free boost engine, deduped |
| 3. Sparks on a Hearth | DONE | the owner lights a Spark; shown on the Hearth page |
| 4. Share to Farcaster | DONE | composeCast in-app + channel casts + Warpcast deeplink |
| Farcaster identity (SIWF) | DONE | `/profile` |
| Mini App (in-feed) | Embed-ready | needs the `FARCASTER_*` account association to publish |

Everything on the "not done" list (mobile wallet, real dollar backing, token launch) is
**not required to test the MVP loop** - it is the roadmap.

## How to run a brand test (the playbook)

For each brand (operator = you, at `/admin`):

1. **Hearth exists** - it's imported (oss) or created (`/admin/new`). 7 ZAO brands
   are already in.
2. **Give it a Farcaster home** - link its channel/fid (`/api/capsules/link-farcaster`;
   done for CoCConcertZ fid 19640, ZAO OS + Zoostr /zao).
3. **Light a Spark** - the owner lights a real event on the Hearth.
4. **Share** - cast it to the brand's Farcaster channel (Share button / composeCast).
5. **Point the community at the Hearth page** - `/c/[slug]` - let them **boost**,
   watch backers climb.

Run this for 2-3 brands over a few days. The proof is not "we launched a coin" - it's
"the brand's supporters showed up and we measured it."

## What to STOP building until after the first brand tests

Empire on-chain deploy and the Clanker token. They're built or scaffolded; they wait
for signal from the first tests. Ship the loop, test it, then let the results pick
what's next.
