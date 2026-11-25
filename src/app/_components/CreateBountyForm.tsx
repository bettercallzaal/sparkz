"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { parseAbi } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import WalletProviders from "@/app/admin/empire/providers";
import { useViewer } from "@/lib/view-as";
import { canManageHearth } from "@/lib/can-manage";
import { poidhAbi, POIDH_CHAIN_ID, POIDH_CONTRACT_ADDRESS } from "@/lib/poidh/abi";
import { parseEthToWei, formatEth } from "@/lib/poidh/vote-state";
import { createBountyFormSchema } from "@/lib/poidh/schemas";

// Owner-only "New bounty" form. The OWNER'S OWN WALLET signs createOpenBounty on Base with
// the reward as the value; Sparkz never holds funds and has no key. poidh refuses contract
// wallets, so connect a normal (EOA) wallet. Once the transaction is sent, the server is
// handed the tx hash, re-reads the receipt on Base and only then saves the link.
// "Check first" simulates the call (an eth_call): nothing is sent and nothing is spent.
const abi = parseAbi(poidhAbi);

export default function CreateBountyForm({ hearthId, ownerFid }: { hearthId: string; ownerFid: number | null }) {
  const viewer = useViewer();
  if (!viewer.ready || !canManageHearth(viewer, ownerFid)) return null;
  return (
    <WalletProviders>
      <Inner hearthId={hearthId} />
    </WalletProviders>
  );
}

function Inner({ hearthId }: { hearthId: string }) {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const { open } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const reader = usePublicClient({ chainId: POIDH_CHAIN_ID });
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eth, setEth] = useState("0.006");
  const [busy, setBusy] = useState<"check" | "sign" | "save" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validated() {
    const wei = parseEthToWei(eth);
    if (wei === null) {
      setError("Enter the reward in ETH, like 0.006.");
      return null;
    }
    const parsed = createBountyFormSchema.safeParse({ name, description, reward_wei: wei.toString() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return null;
    }
    return { ...parsed.data, wei };
  }

  async function ensureWallet(): Promise<boolean> {
    if (!address) {
      open();
      return false;
    }
    if (chainId !== POIDH_CHAIN_ID) await switchChainAsync({ chainId: POIDH_CHAIN_ID });
    return true;
  }

  async function check() {
    setError(null);
    setNote(null);
    const v = validated();
    if (!v) return;
    try {
      if (!(await ensureWallet()) || !address) return;
      setBusy("check");
      await reader!.simulateContract({
        address: POIDH_CONTRACT_ADDRESS,
        abi,
        functionName: "createOpenBounty",
        args: [v.name, v.description],
        value: v.wei,
        account: address,
      });
      setNote(`Looks good: ${formatEth(v.wei)} ETH would post. Nothing was sent.`);
    } catch (e) {
      setError(friendly(e));
    } finally {
      setBusy(null);
    }
  }

  async function post() {
    setError(null);
    setNote(null);
    const v = validated();
    if (!v) return;
    try {
      if (!(await ensureWallet())) return;
      setBusy("sign");
      const hash = await writeContractAsync({
        chainId: POIDH_CHAIN_ID,
        address: POIDH_CONTRACT_ADDRESS,
        abi,
        functionName: "createOpenBounty",
        args: [v.name, v.description],
        value: v.wei,
      });
      setBusy("save");
      setNote("Sent. Waiting for Base to confirm...");
      await reader!.waitForTransactionReceipt({ hash });
      const res = await fetch("/api/hearth-bounties", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hearth_id: hearthId, tx_hash: hash }),
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !json.ok) {
        setError(`The bounty is on Base (${hash}) but Sparkz could not link it: ${json.error ?? "try again"}.`);
        return;
      }
      setNote("Bounty posted and linked to this Hearth.");
      setShow(false);
      router.refresh();
    } catch (e) {
      setError(friendly(e));
    } finally {
      setBusy(null);
    }
  }

  if (!show) {
    return (
      <button type="button" onClick={() => setShow(true)} className="mb-4 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent">
        New bounty
      </button>
    );
  }
  return (
    <div className="glass mb-4 space-y-3 p-4 text-sm">
      <div className="font-medium">New bounty</div>
      <input
        className="w-full rounded-lg border border-border bg-card px-3 py-2"
        placeholder="Name (what you need done)"
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="h-32 w-full rounded-lg border border-border bg-card px-3 py-2"
        placeholder="Describe the work, what counts as done, and the rights you want."
        maxLength={4000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label className="block text-xs text-muted">
        Reward in ETH (on Base)
        <input
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          inputMode="decimal"
          value={eth}
          onChange={(e) => setEth(e.target.value)}
        />
      </label>
      <p className="text-xs text-muted">
        Your own wallet signs this and pays the reward plus gas. Use a regular wallet, not a smart-contract wallet.
        poidh takes 2.5% when a claim is accepted. Sparkz never holds the funds.
      </p>
      {note && <p className="text-xs text-accent">{note}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={busy !== null} onClick={check} className="rounded-lg border border-border px-3 py-2 disabled:opacity-50">
          {busy === "check" ? "Checking..." : "Check first (sends nothing)"}
        </button>
        <button type="button" disabled={busy !== null} onClick={post} className="rounded-lg bg-accent px-3 py-2 font-medium text-black disabled:opacity-50">
          {busy === "sign" ? "Confirm in wallet..." : busy === "save" ? "Linking..." : address ? "Post bounty" : "Connect wallet"}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => setShow(false)} className="ml-auto px-2 text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}

function friendly(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/User rejected|denied/i.test(m)) return "You cancelled in your wallet.";
  if (/ContractsCannotCreateBounties/.test(m)) return "poidh refuses smart-contract wallets. Use a regular wallet.";
  if (/MinimumBountyNotMet/.test(m)) return "The reward is below the poidh minimum.";
  if (/insufficient funds/i.test(m)) return "Not enough ETH on Base for the reward plus gas.";
  return "That did not go through. Nothing is posted unless your wallet confirms it.";
}
