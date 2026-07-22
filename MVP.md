# Sparkz MVP - readiness + brand-test playbook

Step-back assessment (2026-07-22). The question this answers: **can a real ZAO brand
test Sparkz today, and what's the minimum to say yes?**

## The MVP, in one line

A brand can (1) have a Capsule page, (2) get real people to **back/boost** it,
(3) run the **Meme Engine** to produce + publish real Capsule-grounded content,
(4) **share it to Farcaster**, and (5) watch **receipts + backing accumulate**.

That's the loop V1-SCOPE calls the proof: "turned supporters into an attributable
cultural distribution network." Everything else (empire, token, agent, swarm) is
past-MVP.

## Scorecard

| MVP capability | Status | Note |
|----------------|--------|------|
| 1. Capsule page (identity, live) | DONE | `/c/[slug]`, 7 brands live |
| 2. Public backing / boost | DONE | free boost engine, deduped |
| 3. Meme Engine loop (flag -> 3 drafts -> approve -> receipt) | DONE (code) | **fallback drafts on prod until `OPENROUTER_API_KEY` is set in Vercel** - the one real gap |
| 4. Share to Farcaster | DONE | composeCast in-app + channel casts + Warpcast deeplink |
| 5. Receipts + backing accumulate | DONE | the moat, visible on the Capsule page |
| Operator can run the loop per brand | DONE | `/admin` (gated) - functional |
| Farcaster identity (SIWF) | DONE | `/profile` |
| Mini App (in-feed) | Embed-ready | needs the `FARCASTER_*` account association to publish |

**Verdict: ~1 env var from a real brand test.** Set `OPENROUTER_API_KEY` in Vercel and
the Meme Engine produces real drafts on production - then the full loop is live for
every brand.

## The only hard gap

- **`OPENROUTER_API_KEY` in Vercel** -> real Capsule-grounded drafts (it's set locally,
  so it already works in dev; production just serves labelled `[fallback]` drafts).

Everything else on the "not done" list (mobile wallet, real dollar backing, agent
autonomy, token launch) is **not required to test the MVP loop** - it's the roadmap.

## How to run a brand test (the playbook)

For each brand (operator = you, at `/admin`):

1. **Capsule exists** - it's imported (oss) or created (`/admin/new`). 7 ZAO brands
   are already in.
2. **Give it a Farcaster home** - link its channel/fid (`/api/capsules/link-farcaster`;
   done for CoCConcertZ fid 19640, ZAO OS + Zoostr /zao).
3. **Run the loop** - `/admin` -> pick the Capsule -> flag a real cultural moment ->
   pick the best of 3 drafts -> approve. A Meme Receipt is written.
4. **Publish + share** - cast the approved draft to the brand's Farcaster channel
   (Share button / composeCast).
5. **Point the community at the Capsule page** - `/c/[slug]` - let them **boost**,
   watch backers + receipts climb.
6. **Read the receipts** - which moment/draft earned attention. That's the moat data.

Run this for 2-3 brands over a few days. The proof is not "we launched a coin" - it's
"the brand's supporters created attributable distribution and we measured it."

## What to STOP building until after the first brand tests

Empire on-chain deploy, Clanker token, agent autonomy, swarm/leaderboard. They're
built or scaffolded; they wait for signal from the first tests. Ship the loop, test
it, then let the results pick what's next.
