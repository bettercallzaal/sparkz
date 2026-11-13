import { maskBacker } from "./sanitize";

// How a backer shows in the owner's activity list. Same as the public Hearth page
// (sanitize.ts maskBacker: @handles as given, wallets shortened, anything else "a
// supporter", so emails never show), except a signed-in Farcaster backer, stored as
// "fid:<n>" from the verified session, shows as that FID. The username the client sent
// with a boost is an unverified hint, so it is not used here.
export function activityLabel(backerId: string): string {
  const m = /^fid:(\d+)$/.exec(backerId);
  if (m) return `Farcaster fid ${m[1]}`;
  return maskBacker(backerId);
}
