# Sparkz - stack map

The living map of what Sparkz is made of and how the pieces fit. Keep current.

## Layers

| Layer | What | Where |
|-------|------|-------|
| App / deploy | Next.js 16 (App Router), TypeScript, Tailwind. Vercel, host-routed. | `trysparkz.com` -> `/try`, `sparkz.lol` -> `/lol`, else `/`. `src/middleware.ts` |
| Data | Supabase: Postgres + RLS (every table) + Storage | tables: `hearths`, `hearth_backers`, `sparks`, `waitlist`; bucket `empire-logos`. `src/lib/supabase/` |
| Auth | Verified Farcaster or Ethereum session; admins are an allowlist; fails closed | `src/lib/auth.ts`, `src/lib/session.ts`, `src/lib/admin-identities.ts` |
| Wallet | Reown AppKit + wagmi + viem - mobile connect + signing | scoped to `/admin/empire` via `src/app/admin/empire/{layout,providers}.tsx`, `src/lib/wallet/config.ts` |
| On-chain rails | Empire Builder (tokenless empire = create2 + 0xSplits treasury on Base); Clanker (token graduation later) | `src/lib/empire/client.ts`, `src/app/api/empire/deploy` |
| Value / backing | LedgerProvider (off-chain, live) + Boost engine (free support signal) | `src/lib/adapters/backing-provider/`, `src/app/api/boost` |
| Sparks | An event on a Hearth (moment, token, NFT drop, bounty, event) | `src/app/api/sparks`, `src/app/_components/SparksPanel.tsx` |
| Distribution | Share-to-Farcaster (Warpcast compose) + X + copy | `src/app/_components/ShareButton.tsx` |
| Brand audit | Import a ZAO repo as an `oss` Hearth (repo + contributors + gates) | `src/lib/brand-audit/`, `/audit` |

## The adapter seams (swappable, no migration to add one)

- **BackingProvider** - where value settles. Now: `ledger`. Later: eliza, bankr (on-chain), clanker/empire (tokenization).
- **Connector** - the generic spoke any vendor tool plugs into (`src/lib/adapters/connector`).

## The core flow

Hearth (Supabase) -> optionally deploy a **tokenless empire** (Empire Builder, signed with a wallet **through Reown**) -> **back / boost** it (ledger now, on-chain later) -> light a **Spark** -> **share to Farcaster** -> traffic.

## Why Reown (wallet connect)

Mobile browsers have no injected `window.ethereum`, so the old injected-only connect failed on phones. Reown AppKit bridges a mobile web page to any wallet via QR/deeplink, unified behind wagmi (`useAccount`, `useSignMessage`). Needs `NEXT_PUBLIC_REOWN_PROJECT_ID` (free, public). Smart wallets sign via ERC-1271 - if an external verifier (e.g. Empire) rejects, use a plain EOA for that signature. See the `connecting-wallets` skill.

## Env (see `.env.example`)

Required: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SPARKZ_SESSION_SECRET`.
Wallet: `NEXT_PUBLIC_REOWN_PROJECT_ID`. On-chain: `EMPIRE_API_KEY`. Optional: `GITHUB_TOKEN`.

## Not built yet (spec'd)

ZAO Profile / Farcaster-first auth + Privy backup; real dollar backing (fiat/BYOK); Farcaster Mini App wrapper. See `docs/superpowers/specs/2026-07-21-zao-profile-and-empire-design.md`.
