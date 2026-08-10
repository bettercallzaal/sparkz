import type { Hearth } from "@/lib/supabase/types";

// The integrations shown on a Hearth's public page - derived from what the Hearth
// stores (economic_config + metadata). Extracted so the public page AND the owner
// settings page agree on the exact list + stable ids. Each integration has an `id`
// the owner can hide/show; visibility is stored per-Hearth in
// metadata.hidden_integrations (an array of ids). Default: everything visible.

export interface Integration {
  id: string;
  label: string;
  sub: string;
  connected: boolean;
  value: string;
  href?: string;
}

function short(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

export function hearthIntegrations(
  hearth: Pick<Hearth, "type" | "economic_config" | "metadata">,
  emailCount = 0,
): Integration[] {
  const econ = (hearth.economic_config ?? {}) as {
    empire_address?: string;
    empire_id?: string | number;
    token_address?: string;
    agent?: unknown;
  };
  const fc = (hearth.metadata as { farcaster?: { fid?: number | null; username?: string | null; channel?: string | null } })
    .farcaster;

  return [
    {
      id: "empire",
      label: "Treasury",
      sub: "Empire Builder",
      connected: Boolean(econ.empire_address || econ.empire_id),
      value: econ.empire_address ? short(econ.empire_address) : econ.empire_id ? "linked" : "not deployed",
      href: econ.empire_id ? `https://www.empirebuilder.world/empire/${econ.empire_id}` : undefined,
    },
    {
      id: "farcaster",
      label: "Farcaster",
      sub: "Distribution",
      connected: Boolean(fc?.channel || fc?.username || fc?.fid),
      value: fc?.channel ? `/${fc.channel}` : fc?.username ? `@${fc.username}` : fc?.fid ? `fid ${fc.fid}` : "not linked",
      href: fc?.channel
        ? `https://farcaster.xyz/~/channel/${fc.channel}`
        : fc?.username
          ? `https://farcaster.xyz/${fc.username}`
          : undefined,
    },
    {
      id: "email",
      label: "Email list",
      sub: "Community",
      connected: emailCount > 0,
      value: `${emailCount} on list`,
    },
    {
      id: "token",
      label: "Token",
      sub: "Clanker",
      connected: Boolean(econ.token_address),
      value: econ.token_address ? short(econ.token_address) : "spark (no coin)",
    },
    {
      id: "agent",
      label: "Agent",
      sub: "ElizaOS",
      connected: Boolean(econ.agent),
      value: econ.agent ? "configured" : "scaffold",
    },
    { id: "bounties", label: "Bounties", sub: "POIDH", connected: false, value: "soon" },
  ];
}

/** The integration ids the owner has hidden from the public page (default: none). */
export function hiddenIntegrations(hearth: Pick<Hearth, "metadata">): string[] {
  const raw = (hearth.metadata as { hidden_integrations?: unknown }).hidden_integrations;
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}
