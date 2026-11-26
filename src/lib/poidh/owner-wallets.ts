import { getServiceClient } from "@/lib/supabase/server";
import { getEthAddresses } from "@/lib/hypersnap";

// Is this wallet one the Hearth owner controls? A bounty may be linked to a Hearth only when
// it came from such a wallet, or an owner could put someone else's bounty on their Hearth.
// The owner's wallets are the Hearth's owner_wallet plus every Ethereum address on the
// owner FID's Farcaster record (the primary address and each verified address).
//   "yes"          the wallet is the owner's
//   "no"           it is not, and every source was read: permanent
//   "unavailable"  the Farcaster record could not be read, so it cannot be told yet
export type OwnerWalletCheck = "yes" | "no" | "unavailable";

export const WRONG_WALLET_MESSAGE =
  "That wallet is not on the Hearth owner's Farcaster account. Send the bounty from your primary or a verified wallet.";
export const WALLETS_UNAVAILABLE_MESSAGE =
  "Sparkz could not check the owner's Farcaster wallets right now. Try again in a minute.";

const isAddress = (v: unknown): v is string => typeof v === "string" && /^0x[0-9a-fA-F]{40}$/.test(v.trim());

export async function checkOwnerWallet(hearthId: string, wallet: string): Promise<OwnerWalletCheck> {
  const target = wallet.trim().toLowerCase();
  const { data, error } = await getServiceClient()
    .from("hearths")
    .select("owner_fid, owner_wallet")
    .eq("id", hearthId)
    .maybeSingle();
  if (error) throw error;
  const hearth = data as { owner_fid: number | string | null; owner_wallet: string | null } | null;
  if (isAddress(hearth?.owner_wallet) && hearth.owner_wallet.trim().toLowerCase() === target) return "yes";

  const ownerFid = hearth?.owner_fid == null ? null : Number(hearth.owner_fid);
  if (!ownerFid) return "no";
  const addresses = await getEthAddresses(ownerFid);
  if (addresses === null) return "unavailable";
  return addresses.includes(target) ? "yes" : "no";
}
