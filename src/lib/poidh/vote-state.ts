// Pure: turns raw poidh reads into the state Sparkz shows. No network, no env.
// Rules mirror PoidhV3.sol: claimer 0x0 = active, claimer == issuer = cancelled/closed,
// any other claimer = accepted. A vote is running while bountyCurrentVotingClaim != 0;
// resolveVote passes when yes > (yes + no) / 2 once the deadline has passed.
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type RawBounty = { issuer: string; claimer: string; claimId: bigint };
export type RawVote = { currentClaim: bigint; yes: bigint; no: bigint; deadline: bigint };

export type BountyStatus = "open" | "voting" | "vote_ended" | "accepted" | "cancelled";

export type VoteView = {
  claimId: string;
  yes: string;
  no: string;
  deadline: number; // unix seconds
  passing: boolean; // would pass if resolved now
};

export type BountyState = { status: BountyStatus; vote: VoteView | null };

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// Strict majority of total weight, as the contract computes it (integer division).
export function votePasses(yes: bigint, no: bigint): boolean {
  return yes > (yes + no) / 2n;
}

export function bountyState(b: RawBounty, v: RawVote, nowSec: number): BountyState {
  if (!same(b.claimer, ZERO_ADDRESS)) {
    return { status: same(b.claimer, b.issuer) ? "cancelled" : "accepted", vote: null };
  }
  if (v.currentClaim === 0n) return { status: "open", vote: null };
  return {
    status: BigInt(nowSec) < v.deadline ? "voting" : "vote_ended",
    vote: {
      claimId: v.currentClaim.toString(),
      yes: v.yes.toString(),
      no: v.no.toString(),
      deadline: Number(v.deadline),
      passing: votePasses(v.yes, v.no),
    },
  };
}

// Wei string to a short ETH string for display (no float math: wei exceeds 2^53).
export function formatEth(wei: string | bigint, maxDecimals = 6): string {
  const n = typeof wei === "bigint" ? wei : BigInt(wei);
  const whole = n / 10n ** 18n;
  const frac = (n % 10n ** 18n).toString().padStart(18, "0").slice(0, maxDecimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

// ETH decimal text to wei, or null when it is not a plain positive decimal with <= 18 places.
export function parseEthToWei(text: string): bigint | null {
  const t = text.trim();
  if (!/^\d+(\.\d{1,18})?$/.test(t)) return null;
  const [w, f = ""] = t.split(".");
  const wei = BigInt(w) * 10n ** 18n + BigInt(f.padEnd(18, "0"));
  return wei > 0n ? wei : null;
}
