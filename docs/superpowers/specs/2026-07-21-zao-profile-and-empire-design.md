# Design: ZAO Profile + Non-Token Empire deploy

Date: 2026-07-21
Status: draft for review
Branch context: `ws/empire-v1`

## 1. Overview

Sparkz gains an identity foundation (the ZAO Profile) and the ability to deploy a
tokenless Empire Builder empire per Capsule. Every project stays a Capsule (not a
coin); an empire gives it a create2-predictable SmartVault treasury on Base with
nothing on-chain until first interaction - exactly the "spark now, token maybe
later" thesis.

Decided sequencing (user, 2026-07-21): design the whole thing here; **build the
ZAO Profile foundation first**; in parallel wire a **minimal wallet-connect empire
deploy** (no profile required) so the Empire integration can be tested on Base
mainnet immediately, then fold it into the profile layer.

## 2. Layered architecture

- **Layer 0 - ZAO Profile (foundation).** Privy is the login (any social / wallet /
  email). A ZAO Profile IS the Sparkz account. Users link additional wallets,
  socials, Farcaster, and OAuth accounts to the profile, each with an ownership
  proof (Privy linked accounts). One profile, many verified identities.
- **Layer 1 - Capsule ownership.** Capsules are owned by a ZAO Profile. This is the
  user-facing ownership model; the existing operator token stays for privileged
  operator actions (seeding, brand audit) until fully replaced.
- **Layer 2 - Empire deploy.** Two paths, both hanging off the profile:
  - **Free path:** sign the byte-exact custom-mode message with any wallet linked
    to the profile -> server calls `POST /api/deploy-empire-tokenless` (custom
    mode). Owner = that wallet. No Farcaster, no cost.
  - **Agent path:** create an agent for the Capsule (its own wallet + Farcaster
    account; custody is the user's pick) -> farcaster-mode deploy. The agent
    becomes the Farcaster identity approved memes publish from.
- **Layer 3 - Agent Meme Engine (later, not this spec's build).** The agent's
  Farcaster account autonomously detects/publishes; v1 keeps human-in-the-loop
  approval and publishes from the agent account.

## 3. Layer 0 - ZAO Profile

**Auth:** Privy (`@privy-io/react-auth`). Login with email / social / wallet /
Farcaster. Privy issues a verified user with an id and linked accounts.

**Server verification:** every privileged API call carries the Privy access token;
the server verifies it (Privy server SDK / JWKS) and maps `privy_user_id` -> a
`profiles` row. Never trust a client-sent profile id.

**Data model:**

```
profiles(
  id uuid pk,
  privy_user_id text unique not null,   -- the Privy DID
  handle text unique,                   -- ZAO handle (chosen)
  display_name text,
  avatar_url text,
  created_at, updated_at
)

linked_accounts(
  id uuid pk,
  profile_id uuid fk -> profiles,
  kind text check (kind in ('wallet','farcaster','twitter','google','github','email','other')),
  address_or_id text not null,          -- 0x wallet, fid, oauth subject, etc
  label text,
  verified bool not null default false, -- proof-of-ownership (Privy-verified)
  metadata jsonb not null default '{}',
  created_at,
  unique (kind, address_or_id)          -- an identity links to one profile
)
```

RLS on both, service-role-only writes; a profile may read its own rows via a
server route that scopes by the verified `privy_user_id`.

## 4. Layer 1 - Capsule ownership

Add `owner_profile_id uuid references profiles(id)` to `capsules` (nullable during
migration; seed/brand-audit Capsules can stay operator-owned). Write routes that
mutate a Capsule check either operator auth (existing) OR that the caller's profile
== `owner_profile_id`.

## 5. Layer 2 - Empire deploy

**Server deploy service** (`src/lib/empire/`). The `EMPIRE_API_KEY` stays server-
side; the client never sees it. Client produces the wallet signature; server
forwards to Empire.

Empire contract (verified from empirebuilder.world/skill):
- Base URL `https://www.empirebuilder.world/api`, mainnet only (Base 8453).
- `POST /api/deploy-empire-tokenless`, `x-api-key` + EIP-191 signature by `owner`.
- Custom mode message (byte-exact): `I am deploying a custom tokenless Empire named {name}`.
- Farcaster mode message: `I am deploying a tokenless Farcaster Empire with Farcaster ID {fid} and name {name}`.
- Rate limit: 2 deploys / wallet / 24h. Response gives `baseToken`; resolve the
  SmartVault via `GET /api/empires/{baseToken}`.

**Free path flow:**
1. User connects or selects a linked wallet (Privy).
2. Client builds `message = custom template(name)`, `signature = wallet.signMessage(message)`.
3. `POST /api/capsules/[id]/deploy-empire` `{ mode:'custom', name, owner, signature }`.
4. Server verifies profile owns the Capsule, calls Empire with `x-api-key`,
   resolves the SmartVault, writes `economic_config.empire = {empire_id, empire_address, mode, owner, deployed_at}`.

**Agent path flow:** same, but `owner` = the agent's wallet, `mode:'farcaster'`,
`fid` = the agent's fid; the agent's signer produces the signature (custodial: server
signs with the agent key; user-owned: user's granted signer).

## 6. Layer 3 - Agents + Farcaster

```
agents(
  id uuid pk,
  capsule_id uuid fk -> capsules,
  profile_id uuid fk -> profiles,       -- who created/controls it
  custody text check (custody in ('sparkz_managed','user_owned')),
  fid bigint,                           -- Farcaster id (once created)
  farcaster_username text,
  neynar_signer_uuid text,              -- managed signer ref
  wallet_address text,
  wallet_key_ref text,                  -- KMS/secret ref (never the raw key in DB)
  status text default 'created',
  created_at, updated_at
)
```

- **Sparkz-managed (custodial):** Neynar managed/sponsored account creates the fid +
  signer; the agent wallet key lives in a secret store (never in the DB), server
  signs on the agent's behalf. ZAO can sponsor or charge the fid cost.
- **User-owned:** the user's Farcaster account grants Sparkz a Neynar signer; the
  user created/funded the fid. Both supported; user picks at agent creation.
- Farcaster account creation cost is the reason the free path exists ("don't pay
  just to use the feature").

Autonomy (auto-detect, auto-post) is explicitly out of scope here; v1 agent =
identity + empire owner + the account approved memes publish from.

## 7. Parallel minimal deploy test (ships first, to test Empire on mainnet)

Independent of the profile layer, to de-risk the Empire integration:
- A gated operator page: connect a wallet (viem injected / Privy), enter a name,
  sign the custom message, `POST` to a deploy route, deploy ONE real tokenless
  empire on Base, resolve + display the SmartVault treasury.
- Uses `EMPIRE_API_KEY` (operator-provided) + the connected wallet as owner.
- Respects the 2/wallet/24h limit; first deploy is deliberate.
- Later refactored so the deploy route accepts a profile-owned wallet.

## 8. New dependencies

- `@privy-io/react-auth` (+ server verify) - auth / wallet / linked accounts.
- `viem` - EIP-191 signing + address handling.
- Neynar (HTTP API; `NEYNAR_API_KEY` already in `.env.example`) - agent Farcaster
  accounts + signers.

All require the user's approval before install (project rule).

## 9. Security

- Privy access token verified server-side on every privileged call; map to profile.
- `EMPIRE_API_KEY`, agent wallet keys, Neynar secret = server-only, never client.
- Agent wallet private keys never stored raw in the DB - secret store / KMS ref only.
- RLS on all new tables, service-role-only; ownership checks in every mutating route.
- Empire deploys are mainnet-live; deploy routes require ownership + are rate-aware.

## 10. Build sequence

1. ZAO Profile foundation (Privy auth, `profiles` + `linked_accounts`, verify
   middleware, minimal profile UI).
2. In parallel: minimal operator empire-deploy test (section 7) - validate Empire
   on mainnet.
3. Capsule ownership (`owner_profile_id` + ownership checks).
4. Empire free path folded onto profiles.
5. Agents + Farcaster (both custody models).
6. (Later) Agent Meme Engine autonomy.

## 11. Open questions / deferred

- Who pays the agent fid cost (ZAO-sponsored vs user-paid) - pricing TBD.
- Whether to keep the operator token long-term or fully replace with profiles.
- Agent wallet key custody mechanism (KMS vs encrypted secret) - pick at build.
- Farcaster account creation via Neynar managed accounts - confirm current API +
  cost at build time.
