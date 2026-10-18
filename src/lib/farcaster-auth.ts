import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { CANONICAL_HOST } from "@/lib/origin";

// The two doors that prove a FID (docs/AUTH-PLAN.md). Both end at the same
// session (lib/session.ts).
//
// 1. Mini-app door: a Farcaster Quick Auth JWT, verified here against the Farcaster
//    JWKS. Zero-dependency Web Crypto, lifted from ZAODEVZ/zabalgames lib/auth.mjs.
// 2. Web door: a Sign In With Farcaster message + signature from auth-kit, verified
//    server-side with verifySignInMessage against the key registry on Optimism.
//
// Never authorize a write on `sdk.context.user.fid` - it is host-provided and
// spoofable. Only these two verifiers yield a FID that can be trusted.

const JWKS_URL = "https://auth.farcaster.xyz/.well-known/jwks.json";
const QUICK_AUTH_ISSUER = "https://auth.farcaster.xyz";

type Jwk = JsonWebKey & { kid?: string; alg?: string };

function b64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToJson(b64url: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(b64url)));
}

// JWKS cached in the process for an hour. `fresh` forces a refetch (used once on an
// unknown kid, so a key rotation does not lock sign-in out for the cache hour), but
// never more than once a minute.
let jwksCache: { keys: Jwk[] | null; ts: number } = { keys: null, ts: 0 };
async function getJwks(fresh = false): Promise<Jwk[]> {
  const age = Date.now() - jwksCache.ts;
  if (jwksCache.keys && age < 3_600_000 && !(fresh && age > 60_000)) return jwksCache.keys;
  const r = await fetch(JWKS_URL, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`jwks ${r.status}`);
  const j = (await r.json()) as { keys?: Jwk[] };
  jwksCache = { keys: j.keys ?? [], ts: Date.now() };
  return jwksCache.keys ?? [];
}

// Map JWT alg -> Web Crypto import + verify params (RSA, P-256, Ed25519).
function algParams(
  alg: unknown,
): { imp: RsaHashedImportParams | EcKeyImportParams | Algorithm; vrf: AlgorithmIdentifier | EcdsaParams } | null {
  if (alg === "RS256")
    return { imp: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, vrf: { name: "RSASSA-PKCS1-v1_5" } };
  if (alg === "ES256")
    return { imp: { name: "ECDSA", namedCurve: "P-256" }, vrf: { name: "ECDSA", hash: "SHA-256" } };
  if (alg === "EdDSA") return { imp: { name: "Ed25519" }, vrf: { name: "Ed25519" } };
  return null;
}

// Verify a Quick Auth JWT and return its FID (the `sub` claim). Throws on any
// failure. Claims are REQUIRED: a token missing exp/aud/iss is rejected.
export async function verifyQuickAuth(token: string, domain = CANONICAL_HOST): Promise<number> {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("malformed");
  const header = b64urlToJson(h);
  const payload = b64urlToJson(p);
  const params = algParams(header.alg);
  if (!params) throw new Error(`unsupported alg ${String(header.alg)}`);
  let jwk = (await getJwks()).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await getJwks(true)).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("unknown kid");
  if (jwk.alg && jwk.alg !== header.alg) throw new Error("alg mismatch");
  const key = await crypto.subtle.importKey("jwk", jwk, params.imp, false, ["verify"]);
  const data = new Uint8Array(new TextEncoder().encode(`${h}.${p}`));
  const ok = await crypto.subtle.verify(params.vrf, key, b64urlToBytes(s), data);
  if (!ok) throw new Error("bad signature");
  // 60s skew allowance on exp.
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now - 60) throw new Error("expired");
  if (payload.aud !== domain) throw new Error("aud mismatch");
  // Exact match, not a substring: the issuer is a fixed origin.
  if (payload.iss !== QUICK_AUTH_ISSUER) throw new Error("iss mismatch");
  const fid = Number(payload.sub);
  if (!Number.isInteger(fid) || fid <= 0) throw new Error("no sub");
  return fid;
}

// Same RPC the client-side auth-kit config uses (Providers.tsx).
const appClient = createAppClient({
  ethereum: viemConnector({ rpcUrl: "https://mainnet.optimism.io" }),
});

// Verify a SIWF message + signature for the nonce this server issued, and return
// the FID. Throws on any failure.
export async function verifySiwf(args: {
  message: string;
  signature: `0x${string}`;
  nonce: string;
}): Promise<number> {
  const res = await appClient.verifySignInMessage({
    message: args.message,
    signature: args.signature,
    nonce: args.nonce,
    domain: CANONICAL_HOST,
  });
  if (res.isError || !res.success) throw new Error("siwf verification failed");
  if (!Number.isInteger(res.fid) || res.fid <= 0) throw new Error("no fid");
  return res.fid;
}
