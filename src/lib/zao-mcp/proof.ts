import { z } from "zod";
import { canonicalOrigin } from "@/lib/origin";
import { sha256Hex } from "./canonical";
import { RECEIPTS } from "./receipts-data";
import { ALLOWLIST, AUDIENCE, ISSUER, type Approval } from "./allowlist";

// open_contribution_proof, the first ZAO MCP tool (ORD-700 plan, ORD-721 build). Read
// only. It opens ONE allowlisted contribution receipt by its id and the sha256 of its exact
// bytes, and fails closed on anything else: an unknown id, a changed digest, an entry not on
// the allowlist, the wrong issuer, audience or scope, or an expired approval. The viewer
// page /proof/<id>/<sha256> and /raw use the same lookup, so chat and browser serve the same
// bytes.

export type ToolResult = {
  isError?: boolean;
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
};

export const openContributionProofInput = z
  .object({
    // Lowercase slug only, so an id can never carry a path ("../") or a URL.
    contribution_id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
    receipt_sha256: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

type Receipt = {
  id: string;
  type: string;
  label?: string;
  hearth?: string;
  what?: string;
  when?: string;
  source?: { url?: string };
  evidence_status?: string;
  settlement?: string;
  supersedes?: string | null;
};

const ETH_ADDRESS = /0x[0-9a-fA-F]{40}/;
const CLOSED =
  "That record is not open: no approved receipt matches this id and digest, or its approval has expired.";

function approvalFor(id: string, sha: string, now: number, allowlist: readonly Approval[]): Approval | null {
  const a = allowlist.find((x) => x.contribution_id === id && x.sha256 === sha);
  if (!a) return null;
  if (a.issuer !== ISSUER || a.audience !== AUDIENCE || a.scope !== "read") return null;
  const exp = Date.parse(a.expires_at);
  if (!Number.isFinite(exp) || now >= exp) return null;
  return a;
}

// The one lookup every surface uses. Null means closed, for any reason.
export function getApprovedReceipt(
  id: string,
  sha: string,
  now: number = Date.now(),
  receipts: Readonly<Record<string, string>> = RECEIPTS,
  allowlist: readonly Approval[] = ALLOWLIST,
): { bytes: string; receipt: Receipt } | null {
  const input = openContributionProofInput.safeParse({ contribution_id: id, receipt_sha256: sha });
  if (!input.success) return null;
  if (!approvalFor(id, sha, now, allowlist)) return null;
  const bytes = receipts[`${id}/${sha}`];
  if (typeof bytes !== "string") return null;
  if (sha256Hex(bytes) !== sha) return null; // the stored bytes changed: closed
  let receipt: Receipt;
  try {
    receipt = JSON.parse(bytes) as Receipt;
  } catch {
    return null;
  }
  if (receipt.id !== id) return null;
  // A receipt never carries a wallet address. If one ever slipped in, keep it closed.
  if (ETH_ADDRESS.test(bytes)) return null;
  return { bytes, receipt };
}

export function viewerUrl(id: string, sha: string): string {
  return `${canonicalOrigin()}/proof/${id}/${sha}`;
}

export function openContributionProof(args: unknown, now: number = Date.now()): ToolResult {
  const input = openContributionProofInput.safeParse(args);
  if (!input.success) {
    return { isError: true, content: [{ type: "text", text: CLOSED }], structuredContent: { error: "closed" } };
  }
  const { contribution_id: id, receipt_sha256: sha } = input.data;
  const found = getApprovedReceipt(id, sha, now);
  if (!found) {
    return { isError: true, content: [{ type: "text", text: CLOSED }], structuredContent: { error: "closed" } };
  }
  const r = found.receipt;
  const url = viewerUrl(id, sha);
  const record = {
    record_id: r.id,
    type: r.type,
    label: r.label ?? null,
    hearth: r.hearth ?? null,
    what: r.what ?? null,
    date: r.when ?? null,
    source_link: r.source?.url ?? null,
    digest: sha,
    // Reported as recorded: never upgraded to verified here.
    evidence_status: r.evidence_status ?? "SOURCE_REPORTED",
    settlement: r.settlement ?? "NOT_EVALUATED",
    // No signed source-side readback exists yet, so two-sided parity is not claimed.
    parity: "NOT_CHECKED",
    supersedes: r.supersedes ?? null,
    viewer_url: url,
    raw_url: `${url}/raw`,
  };
  const lines = [
    r.label === "fixture proof" ? "FIXTURE PROOF (not a real contribution)." : null,
    `${r.what ?? r.id}`,
    `Hearth: ${r.hearth ?? "-"}. Date: ${r.when ?? "-"}. Evidence: ${record.evidence_status}. Settlement: ${record.settlement}.`,
    `Source: ${record.source_link ?? "-"}`,
    `sha256: ${sha}`,
    `Open this exact record: ${url}`,
  ].filter((l): l is string => l !== null);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: record };
}
