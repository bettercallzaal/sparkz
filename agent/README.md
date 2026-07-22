# Sparkz Agent (ElizaOS)

The autonomous Meme Engine operator. This is a **separate runtime** from the Next.js
app - it runs the flag -> draft -> (approve) -> publish loop on its own, casting to
Farcaster, so a Capsule's momentum keeps moving without a human at the keyboard.

It is scaffolded as its own package on purpose: ElizaOS pulls a heavy dependency tree
that must NOT be bundled into the Sparkz web app (which stays lean). The agent talks
to Sparkz over its public/operator API and to Farcaster via Neynar.

## What it does (v1 of the agent)

1. **Detects** signals for a Capsule - polls the Sparkz API (the `human` SignalSource
   today; later a Farcaster/Alpha-Radar source).
2. **Drafts** 3 Capsule-grounded responses on the cheap tier (OpenRouter) - the same
   Meme Engine the app uses.
3. **Publishes** an approved draft and **casts** it to the Capsule's linked Farcaster
   channel/account (Neynar signer), then writes the Meme Receipt.
4. Stays **human-in-the-loop by default** (proposes, waits for approval) with an
   opt-in autonomy tier - approval can come from the app, Discord, or the agent's own
   confidence gate.

## Stack

- **ElizaOS** (`@elizaos/core`) - the agent runtime (MIT, github.com/elizaOS/eliza)
- **Farcaster plugin** (Neynar) - read casts/channels, publish casts on behalf of the
  agent's signer
- **Base plugin** - on-chain actions (later: trigger a Clanker graduation / Empire)
- **Sparkz API** - `trysparkz.com/api/*` for capsules, signals, drafts, receipts

## One agent per Capsule

Each Capsule can have one agent (see the `agents` table in the ZAO Profile spec:
`docs/superpowers/specs/2026-07-21-zao-profile-and-empire-design.md`). The agent's
identity is a Farcaster account (custodial via Neynar managed signer, or user-owned),
and it casts from that account into the Capsule's linked channel.

## Run (once keys are set)

```bash
cd agent
cp .env.example .env   # fill the keys
npm install
npm run dev            # starts the ElizaOS runtime with character.json
```

## Keys (see .env.example)

- `SPARKZ_API_BASE` (https://trysparkz.com) + `SPARKZ_ADMIN_TOKEN` - talk to Sparkz
- `OPENROUTER_API_KEY` - cheap-tier drafting (never the Claude cap)
- `NEYNAR_API_KEY` + `NEYNAR_SIGNER_UUID` - the agent's Farcaster account (managed
  signer)
- `CAPSULE_SLUG` - which Capsule this agent runs (e.g. `zoostr`)

## Status

Scaffold. The character + integration shape are here; wiring the ElizaOS plugins to
the Sparkz API + Neynar is the build. Start human-in-the-loop, add autonomy behind a
confidence gate. Reference: elizaOS Farcaster plugins + the Sparkz Meme Engine at
`src/lib/meme-engine/`.
