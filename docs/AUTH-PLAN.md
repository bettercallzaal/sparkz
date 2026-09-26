# Owner-by-FID auth - the locked plan (decided 2026-08-17)

The next build. Decided after a deep research pass verified raw against the August 2026
Farcaster stack (npm registry, live JWKS, Neynar docs). This doc is the implementation
checklist so any session can build it without re-deriving the decision.

## The architecture: two doors, one session

A visitor proves their FID through one of two doors; both end at the same server-minted
session; every owner action asks one question.

1. **Mini-app door** (inside a Farcaster client): `sdk.quickAuth.getToken()` client-side
   -> server verifies the JWT against the Farcaster JWKS
   (`https://auth.farcaster.xyz/.well-known/jwks.json`). Verifier: lift the
   zero-dependency Web Crypto implementation from `ZAODEVZ/zabalgames lib/auth.mjs`
   (107 lines: RS256/ES256/EdDSA, required claims, 60s exp skew, aud = our domain,
   iss = auth.farcaster.xyz, sub = fid; JWKS cached 1h) into `src/lib/farcaster-auth.ts`,
   with the domain from `CANONICAL_HOST` (`src/lib/origin.ts`).
2. **Web door** (trysparkz.com in a normal browser): the existing `@farcaster/auth-kit`
   client (`src/app/_components/Providers.tsx` - keep; 0.8.2 is maintained) + a NEW
   server route that runs `verifySignInMessage` from `@farcaster/auth-client`.

**One session:** on either verification, mint an HMAC-signed `{fid, exp}` session in an
httpOnly cookie - extend the operator-cookie pattern in `src/lib/auth.ts`. The cookie
MUST be `SameSite=None; Secure` (hard-won lesson: `Lax` cookies silently die inside the
Farcaster iframe).

**The gate:** `requireHearthOwner(req, hearthId)` - allow when the session FID equals
`hearths.owner_fid`, or when the existing operator token passes (`requireAdmin`). Both
fail closed.

## Rules (do not relitigate)

- Do NOT use `sdk.context.user.fid` as authorization for writes - it is host-provided
  and spoofable. JWT or verified SIWF only. (Context-FID is fine for silent UX
  personalization.)
- Do NOT build on Sign In With Neynar - deprecated 2026-08-14. Future cast publishing
  uses Neynar managed/sponsored signers (a write primitive, not auth).
- Do NOT forward the ~1h Quick Auth JWT as the session; the server session outlives it.

## Implementation checklist

1. `src/lib/farcaster-auth.ts` - the lifted JWKS verifier + `verifySiwf()` wrapper.
2. `POST /api/auth/quick` (verify Quick Auth JWT -> set session) and
   `POST /api/auth/siwf` (verify SIWF message -> set session); `POST /api/auth/logout`.
3. `requireHearthOwner` in `src/lib/auth.ts`.
4. Swap gates to owner-or-admin on: `/api/capsules/visibility`,
   `/api/empire/deploy`, and the settings surface at `/c/[slug]/settings`.
5. `create-spark` takes `owner_fid` from the VERIFIED session, never the request body
   (closes the standing security finding on unverified FIDs).
6. Live test: sign in with FID 19640, toggle ZABAL GAMEZ integration visibility
   WITHOUT the operator token.

## Afterward (in order)

Runtime spoke gating (make `hearth_spokes` actually gate the loop; call
`Connector.status()` on the Hearth page) -> receipts engine (publish-on-approve via
Neynar managed signers; measure with `GET /v2/farcaster/cast` - engagement is bundled,
1 compute unit per lookup, 200K/month free tier) -> per-Hearth contributor leaderboards.
