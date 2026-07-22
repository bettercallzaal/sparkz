# Sparkz Agent

The autonomous Meme Engine operator. A **separate runtime** from the Next.js app: it
runs the flag -> draft -> approve -> cast loop for one Capsule on its own, casting to
Farcaster, so a Capsule's momentum keeps moving without a human at the keyboard.

It talks to Sparkz over the operator API and to Farcaster via Neynar. Lean by design -
no heavy framework, native `fetch`, so it runs anywhere Node 20+ does (a box, a cron,
a Fly/Railway worker).

## What it does

The Sparkz web app already flags a moment, drafts 3 Capsule-grounded responses, and
writes a Meme Receipt on approval. The agent adds the three things the app can't:

1. **Judgment** - scores the 3 drafts (`src/score.ts`): cast-length fit, no
   moon/token shilling, grounded in the Capsule. Picks the best and a confidence.
2. **Autonomy** - a gate (`decide()` in `src/engine.ts`) decides whether to act:
   - `propose` (default) - pick a draft, notify a human (Discord + log), never publish. Human-in-the-loop.
   - `confidence` - auto-publish only when the winner's confidence clears a threshold.
   - `auto` - always publish the best draft.
3. **Casting** - the app holds no Farcaster signer; the agent does. On publish it
   approves the draft (writing the receipt) and **casts** it to the Capsule's linked
   channel via a Neynar managed signer (`src/farcaster.ts`).

## The loop (per tick)

```
resolve Capsule by slug
  -> list its signals, keep the ones "drafted" (have drafts, not yet published)
    -> score the 3 drafts, pick the best + a confidence
      -> gate: propose  -> notify a human, stop
                publish -> approve (writes the Meme Receipt) -> cast to Farcaster
```

`AGENT_DRY_RUN=true` runs the whole loop and logs what it *would* do without approving
or casting - safe for a first run against production.

## Files

| File | Role |
| --- | --- |
| `src/config.ts` | Env parsing + validation (fails fast) |
| `src/sparkz.ts` | Typed client for the Sparkz operator API |
| `src/score.ts` | Draft scorer + best-pick (pure, tested) |
| `src/farcaster.ts` | Neynar cast client |
| `src/engine.ts` | The loop + the autonomy gate |
| `src/index.ts` | Entrypoint (interval loop; `AGENT_ONCE` for cron) |
| `src/engine.test.ts` | Tests for the scorer + gate |

## Run

```bash
cd agent
cp .env.example .env      # fill CAPSULE_SLUG + SPARKZ_ADMIN_TOKEN (+ Neynar to cast)
npm install
npm test                  # scorer + gate (no keys needed)
AGENT_DRY_RUN=true npm run once   # one safe tick against the API
npm run dev               # the live loop
```

## Keys

- `CAPSULE_SLUG` + `SPARKZ_API_BASE` + `SPARKZ_ADMIN_TOKEN` - which Capsule, and talk to Sparkz.
- `AGENT_AUTONOMY` (`propose`|`confidence`|`auto`) + `AGENT_CONFIDENCE_THRESHOLD`.
- `NEYNAR_API_KEY` + `NEYNAR_SIGNER_UUID` - the agent's Farcaster account (to cast). Without them it writes receipts but does not cast.
- `DISCORD_APPROVAL_WEBHOOK` - optional, where `propose` notifications go.

## One agent per Capsule

Each Capsule runs one agent (its `CAPSULE_SLUG`). The agent's identity is a Farcaster
account (a Neynar managed signer), and it casts from that account into the Capsule's
linked channel (`metadata.farcaster.channel`, set via `/api/capsules/link-farcaster`).

## The autonomy path

Start in `propose` (nothing publishes without a human). Move to `confidence` with a
high threshold once the scorer earns trust for a given Capsule. `auto` is for a
Capsule whose voice is well-established and whose operator wants a hands-off engine.

## Upgrade path: ElizaOS

`character.json` holds the persona (system prompt, style, knowledge) in ElizaOS format.
The lean loop here is the runnable core; dropping it into an ElizaOS runtime (adding
the Farcaster + Base plugins) is the path to a richer agent that also converses, reads
Farcaster for its own signals, and triggers on-chain graduation. The seams
(`SparkzClient`, `NeynarClient`, the scorer) carry over unchanged.
