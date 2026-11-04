"use client";

import { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSwitchChain, useWriteContract, usePublicClient } from "wagmi";
import type { Address } from "viem";
import WalletProviders from "@/app/admin/empire/providers";
import { claimsHatterAbi, HATS_CHAIN_ID } from "@/lib/hats";

// "Get your first hat": connect a wallet and claim the ZAO Member hat on Optimism straight
// from the Hats claims module. The member's own wallet sends it, so there is no server key
// (Zaal, 4 Nov 2026). Gas is a fraction of a cent on Optimism. Zaal, 3 Nov 2026: the free
// hat is how commitment starts; the paid hats per Spark come after.
type Status = {
  configured: boolean;
  canMint: boolean;
  hat: string | null;
  hatId: string | null;
  claimsHatter: Address | null;
  supply: { supply: number; max: number } | null;
  address: string | null;
  worn: boolean;
};

async function status(address?: string): Promise<Status | null> {
  const r = await fetch(`/api/hats/status${address ? `?address=${address}` : ""}`, { credentials: "include" });
  const j = (await r.json().catch(() => null)) as { ok: boolean; data?: Status } | null;
  return j?.ok && j.data ? j.data : null;
}

export default function FirstHat() {
  return (
    <WalletProviders>
      <FirstHatInner />
    </WalletProviders>
  );
}

function FirstHatInner() {
  const { address, chainId } = useAccount();
  const { open } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const reader = usePublicClient({ chainId: HATS_CHAIN_ID });
  const [state, setState] = useState<Status | null>(null);
  const [busy, setBusy] = useState<"sign" | "mint" | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    status(address).then(setState);
  }, [address]);

  if (!state) return null;
  if (!state.configured) {
    return <p className="text-muted text-sm">Free hats open soon. The ZAO Member hat is being set up on Optimism.</p>;
  }

  async function claim() {
    setError(null);
    if (!address) {
      open();
      return;
    }
    try {
      if (!state?.claimsHatter || !state.hatId) throw new Error("Free hats are not switched on yet.");
      setBusy("sign");
      if (chainId !== HATS_CHAIN_ID) await switchChainAsync({ chainId: HATS_CHAIN_ID });
      const hash = await writeContractAsync({
        chainId: HATS_CHAIN_ID,
        address: state.claimsHatter,
        abi: claimsHatterAbi,
        functionName: "claimHat",
        args: [BigInt(state.hatId)],
      });
      setBusy("mint");
      await reader?.waitForTransactionReceipt({ hash, timeout: 60_000 });
      setTx(hash);
      setState(await status(address));
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const worn = state.worn;
  return (
    <div className="card-solid border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm text-accent">ZAO Member hat</div>
          <div className="text-muted text-xs mt-1">
            Hat {state.hat} on Optimism.{" "}
            {state.supply ? `${state.supply.supply} of ${state.supply.max} claimed.` : ""}
          </div>
        </div>
        {worn ? (
          <span className="text-xs font-semibold rounded-full border border-accent/60 px-3 py-1">You wear it</span>
        ) : (
          <button
            type="button"
            onClick={claim}
            disabled={busy !== null || !state.canMint}
            className="btn-spark rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {busy === "sign" ? "Check your wallet..." : busy === "mint" ? "Minting your hat..." : address ? "Get your first hat" : "Connect wallet"}
          </button>
        )}
      </div>
      {worn && (
        <p className="text-muted text-xs leading-relaxed">
          Soulbound and free, you only cover a fraction of a cent of network fee. This is your commitment to The ZAO. Project hats come next, per Spark.
          {tx && (
            <>
              {" "}
              <a href={`https://optimistic.etherscan.io/tx/${tx}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                Transaction ↗
              </a>
            </>
          )}
        </p>
      )}
      {!worn && !state.canMint && <p className="text-muted text-xs">Minting is paused for a moment. Try again shortly.</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
