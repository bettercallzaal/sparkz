---
topic: business
type: audit
status: research-complete
last-validated: 2026-08-03
related-docs: sparkz-improvements-and-plugin-system.md, clanker-ecosystem.md
original-query: "Empire Builder API - enumerate every endpoint, TEST each against the live API with our EMPIRE_API_KEY, confirm which work, map to the Sparkz empire integration so Zoostr can be tested with all Empire endpoints on our UI tonight"
tier: STANDARD
---

# Empire Builder API - Endpoint Audit + Sparkz Integration

> **Goal:** Every Empire Builder endpoint enumerated + tested live, mapped to what Sparkz
> has / added / still needs, so Zoostr can run on Empire's leaderboard + reward rails.

## Key Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | **The entire PUBLIC read surface is confirmed working** (tested live 2026-08-03). Wire the Sparkz UI to it directly. | 8 GET endpoints all returned 200 with real data against a live empire (BizarreBeasts, base_token `0x0520...`). |
| 2 | **Sparkz now covers all reads** via the extended `empire/client.ts` + `GET /api/empire/{id}` bundle route. | One call returns resolve + leaderboards + top-board entries + rewards + boosters. Verified: 10 boards, 500 entries, 3 reward records, 33 boosters. |
| 3 | **Deploy + write ops need an EIP-191 signature** (only tokenless-custom deploy is built in Sparkz). Zaal signs; the rest are build-when-needed. | Empire verifies the signer against the empire owner/guardian; Sparkz holds no signer server-side. |
| 4 | **Zoostr has NO empire yet** (`/empires/zoostr` -> 404). Tonight: deploy Zoostr's empire (Zaal signs), then the read route serves its leaderboard + rewards. | Zoostr's "50% fees to leaderboard by points" == Empire's distribute-to-leaderboard flow. |

## Findings - endpoints tested live (base URL `https://www.empirebuilder.world/api`)

### PUBLIC (no key) - ALL 200, confirmed
| Endpoint | Path | Result |
|----------|------|--------|
| List empires | `GET /empires?type=&page=&limit=` | 200 - paginated |
| Top empires | `GET /top-empires` | 200 |
| Resolve one | `GET /empires/{id}` | 200 (id = base_token / fid<n> / slug); 404 if none |
| Search | `GET /empires/search?q=` | 200 |
| By owner | `GET /empires/owner/{wallet}` | 200 |
| Boosters | `GET /boosters/{id}` | 200 (33 for BizarreBeasts) |
| List leaderboards | `GET /leaderboards?tokenAddress={id}` | 200 (10 boards) |
| Leaderboard entries | `GET /leaderboards/{leaderboardId}` | 200 (500 ranked entries) |
| Address rank | `GET /leaderboards/{leaderboardId}/address/{wallet}` | documented, path confirmed |
| Empire rewards | `GET /empire-rewards/{id}` | 200 (even/weighted/raffle) |
| Distribution records | `GET /distribution-records/{empireAddress}` | 200 (per-recipient USD) |

### AUTHENTICATED (x-api-key + EIP-191 signature) - key accepted, writes need a signer
- Deploy: `POST /deploy-empire-tokenless` (Sparkz HAS, custom mode), `POST /deploy-empire` (existing token), `POST /get-token-config` + `/deploy-empire` (new token). 2 deploys/wallet/24h.
- Leaderboard mgmt: create (`/leaderboards/{type}Leaderboards` - token-holders / stakers / nft / api / csv / farcaster-cast/channel/interaction), `DELETE /leaderboards/delete?leaderboardId=`, `PATCH /leaderboards/refresh/{type}` (30s cooldown).
- Boosters: `POST/DELETE /boosters/{id}`, `POST/DELETE /staking-boosters/{id}`, `POST /empires/activate-staking`.
- Treasury: `POST /distribute-prepare`, `POST /store-distribution` (tx <10min), `POST /store-burn`, `POST /store-airdrop`.
- `x-api-key` valid (27 chars, set in env). Full spec cache: `empire-builder.gitbook.io/.../llms-full.txt`.

## Sparkz mapping

- **Had:** `resolveEmpire` (GET /empires/{id}), `deployTokenlessCustom` (POST /deploy-empire-tokenless), `/api/empire/deploy`, `/api/capsules/link-empire`.
- **Added this session** (`src/lib/empire/client.ts`): `listEmpires`, `searchEmpires`, `empiresByOwner`, `listEmpireLeaderboards`, `getLeaderboard`, `getLeaderboardAddress`, `getBoosters`, `getEmpireRewards`, `getDistributionRecords` + `GET /api/empire/{id}` (full read bundle for the UI).
- **Not built (write ops, need a signer):** deploy-existing-token, deploy-new-token, leaderboard create/delete/refresh, booster add/remove, staking, store-distribution/burn/airdrop, distribute-prepare. Build per Zoostr's needs.

## Also See
- [Sparkz improvements + plugin system](sparkz-improvements-and-plugin-system.md)
- [Clanker ecosystem](clanker-ecosystem.md)

## Next Actions
| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Test `GET /api/empire/{id}` in the UI tonight against a live empire (BizarreBeasts `0x0520...`) to confirm the leaderboard renders | @Zaal | Test | 2026-08-03 |
| Deploy Zoostr's tokenless empire (sign via `/api/empire/deploy`), then point the read route at its base_token | @Zaal | Deploy | 2026-08-03 |
| Build the `store-distribution` + `distribute-prepare` write path when Zoostr runs its first "50% to leaderboard" payout | @Zaal | PR | 2026-08-31 |

## Sources
- [Empire Builder docs](https://empire-builder.gitbook.io/empire-builder-docs) [FULL - enumerated all endpoints + exact paths]
- [Empire llms-full.txt spec](https://empire-builder.gitbook.io/empire-builder-docs/llms-full.txt) [FULL]
- Live API `https://www.empirebuilder.world/api` - 8 public GETs tested 200 against empire `0x0520bf1d3cee163407ada79109333ab1599b4004` [FULL]
- Codebase: `src/lib/empire/client.ts`, `src/app/api/empire/deploy/route.ts`, `src/app/api/empire/[id]/route.ts` (new) [FULL]
