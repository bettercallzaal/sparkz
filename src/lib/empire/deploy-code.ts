import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { verifyMessage } from "viem";
import { deployCodeMessage } from "./deploy-code-message";

export { deployCodeMessage };

// One-time deploy code for the tokenless Empire deploy (POST /api/empire/deploy).
//
// Empire Builder checks its own byte-exact, name-only message (tokenlessCustomMessage in
// ./client.ts), so that message cannot carry a nonce. Sparkz therefore asks the owner wallet
// for a SECOND signature, over a Sparkz message that names the code, the Hearth slug, the
// Empire name and the issue time. The deploy route checks it before anything is forwarded
// to Empire. A code is:
//   - issued by the server (POST /api/empire/deploy/code) for one session and one Hearth;
//   - HMAC-signed with SPARKZ_SESSION_SECRET over that session and Hearth, so it cannot be
//     moved to another fid or another Hearth;
//   - good for DEPLOY_CODE_TTL_MS only;
//   - accepted once (consumeDeployCode), like the SIWE nonce in lib/session.ts.
// No database table: same pattern as the sign-in nonce.

export const DEPLOY_CODE_TTL_MS = 5 * 60 * 1000;
const MIN_SECRET_LENGTH = 32;

function secret(): string | null {
  const s = process.env.SPARKZ_SESSION_SECRET;
  return s && s.length >= MIN_SECRET_LENGTH ? s : null;
}

function mac(nonce: string, iat: number, subject: string, hearthId: string, key: string): string {
  return createHmac("sha256", key)
    .update(`empire-deploy|${nonce}|${iat}|${subject}|${hearthId}`)
    .digest("base64url");
}

// The session a code is bound to: the signed-in fid, or the signed-in address for an
// operator who signed in with a wallet. Null when there is no session identity.
export function deploySubject(claims: { fid?: number | null; address?: string | null } | null): string | null {
  if (claims?.fid) return `fid:${claims.fid}`;
  if (claims?.address) return `addr:${claims.address.toLowerCase()}`;
  return null;
}

export function issueDeployCode(
  subject: string,
  hearthId: string,
  now = Date.now(),
): { code: string; issuedAt: string } | null {
  const key = secret();
  if (!key) return null;
  const nonce = randomBytes(16).toString("hex");
  const iat = Math.floor(now / 1000);
  return { code: `${nonce}.${iat}.${mac(nonce, iat, subject, hearthId, key)}`, issuedAt: new Date(iat * 1000).toISOString() };
}

// Single use inside one server instance; entries expire with the code. Across separate
// serverless instances the per-Hearth deploy claim in the route still allows one owner
// deploy per Hearth.
const usedCodes = new Map<string, number>();

export function consumeDeployCode(nonce: string, now = Date.now()): boolean {
  for (const [n, until] of usedCodes) if (until < now) usedCodes.delete(n);
  if (usedCodes.has(nonce)) return false;
  usedCodes.set(nonce, now + DEPLOY_CODE_TTL_MS);
  return true;
}

export type DeployCodeCheck = { ok: true; nonce: string } | { ok: false; error: string };

// Checks the code (binding, expiry), then the owner's signature over deployCodeMessage,
// then spends the code. The code is spent only after a valid signature, so a junk request
// cannot burn the owner's code.
export async function checkDeployCode(a: {
  code: string;
  codeSignature: `0x${string}`;
  subject: string;
  hearthId: string;
  hearthSlug: string;
  name: string;
  owner: `0x${string}`;
  now?: number;
}): Promise<DeployCodeCheck> {
  const now = a.now ?? Date.now();
  const key = secret();
  if (!key) return { ok: false, error: "Deploy codes are not configured" };
  const [nonce, iatRaw, given] = a.code.split(".");
  const iat = Number(iatRaw);
  if (!nonce || !given || !Number.isInteger(iat)) return { ok: false, error: "Deploy code is not valid" };
  const expected = Buffer.from(mac(nonce, iat, a.subject, a.hearthId, key));
  const got = Buffer.from(given);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, error: "Deploy code is not valid for this sign-in and Hearth" };
  }
  const age = now - iat * 1000;
  if (age < 0 || age > DEPLOY_CODE_TTL_MS) return { ok: false, error: "Deploy code expired. Start again." };
  const message = deployCodeMessage({
    hearthSlug: a.hearthSlug,
    name: a.name,
    code: a.code,
    issuedAt: new Date(iat * 1000).toISOString(),
  });
  let signed = false;
  try {
    signed = await verifyMessage({ address: a.owner, message, signature: a.codeSignature });
  } catch {
    signed = false;
  }
  if (!signed) return { ok: false, error: "The owner wallet did not sign this deploy code" };
  if (!consumeDeployCode(nonce, now)) return { ok: false, error: "Deploy code already used. Start again." };
  return { ok: true, nonce };
}
