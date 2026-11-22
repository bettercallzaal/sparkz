import { createHash, timingSafeEqual } from "node:crypto";

// Reviewer sign-in for App Review (Zaal, 21 Nov 2026, redesign decision D3; App Store
// guideline 2.1: the reviewer needs a working sign-in). Sparkz signs in with Farcaster or
// a wallet, which a reviewer does not have, so the review notes carry a code instead.
//
// Server-only and off by default: it works only while SPARKZ_REVIEW_CODE is set (16 or
// more characters). Setting the variable is the review flag; removing it after review
// turns the door off. Zaal sets it in Vercel, never in the repo.
//
// The reviewer becomes a fixed wallet identity: 0x...0001, the ecrecover precompile, an
// address nobody holds a key for, so it can never be a real person's account. It is not
// an admin and not on the Hearth allowlist, so it can browse, back, boost, report and
// block, but cannot open a Hearth (HEARTH_CREATE_LOCK in src/lib/alpha-access.ts).
export { REVIEW_ADDRESS } from "@/lib/review-address";
const MIN_CODE_LENGTH = 16;

function configuredCode(): string | null {
  const code = process.env.SPARKZ_REVIEW_CODE?.trim();
  return code && code.length >= MIN_CODE_LENGTH ? code : null;
}

export function reviewSignInEnabled(): boolean {
  return configuredCode() !== null;
}

// Constant-time: both sides are hashed to the same length first.
export function reviewCodeMatches(input: string): boolean {
  const code = configuredCode();
  if (!code) return false;
  const a = createHash("sha256").update(input.trim()).digest();
  const b = createHash("sha256").update(code).digest();
  return timingSafeEqual(a, b);
}
