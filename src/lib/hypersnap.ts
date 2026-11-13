// Reads from a Hypersnap (or Snapchain) node over its HTTP API. No API key, no hosted
// service in between: the node is the source (ZAOresearch 2485, "Sparkz as a Hypersnap
// client", PR 1 of 3). Writes (signed messages) come in PR 2.
//
// HYPERSNAP_NODE_URL picks the node; the default is Quilibrium's public read node.
// Every read is cached by Next's fetch cache for CACHE_SECONDS, so a Hearth page does
// not hit the node on every view. A node that is down returns null, never throws into
// a page: callers show what they have without it. A node that accepts the connection and
// never answers is cut off after NODE_TIMEOUT_MS, so a Hearth page cannot hang on it.

export const DEFAULT_NODE_URL = "https://haatz.quilibrium.com";
export const CACHE_SECONDS = 300;
export const NODE_TIMEOUT_MS = 2000;

export function nodeUrl(): string {
  const raw = (process.env.HYPERSNAP_NODE_URL ?? "").trim();
  return (raw || DEFAULT_NODE_URL).replace(/\/+$/, "");
}

// --- the shapes the node returns (the parts Sparkz reads) ---

export type NodeMessage<T = Record<string, unknown>> = {
  hash: string;
  data: { type: string; fid: number; timestamp: number; network: string } & T;
};

type UserDataBody = { userDataBody: { type: string; value: string } };
type CastAddBody = {
  castAddBody: {
    text: string;
    parentUrl?: string | null;
    parentCastId?: { fid: number; hash: string } | null;
    embeds?: { url?: string; castId?: { fid: number; hash: string } }[];
    mentions?: number[];
  };
};

export type HypersnapProfile = {
  fid: number;
  username: string | null;
  display: string | null;
  pfp: string | null;
  bio: string | null;
  url: string | null;
  twitter: string | null;
  address: string | null; // primary Ethereum address the user set, if any
};

export type HypersnapCast = {
  hash: string;
  fid: number;
  text: string;
  timestamp: number; // seconds since the Farcaster epoch (1 Jan 2021)
  at: string; // ISO time
  parentUrl: string | null;
  parentCast: { fid: number; hash: string } | null;
  embeds: string[];
};

export type NodeInfo = {
  version: string;
  messages: number;
  fids: number;
  shards: { id: number; height: number; delay: number }[];
};

// The Farcaster epoch: timestamps on the network count seconds from 1 Jan 2021 UTC.
export const FARCASTER_EPOCH_MS = Date.UTC(2021, 0, 1);
export const toIso = (farcasterSeconds: number) =>
  new Date(FARCASTER_EPOCH_MS + farcasterSeconds * 1000).toISOString();

// --- pure parsing, tested without a network ---

const USER_DATA_FIELDS: Record<string, keyof Omit<HypersnapProfile, "fid">> = {
  USER_DATA_TYPE_USERNAME: "username",
  USER_DATA_TYPE_DISPLAY: "display",
  USER_DATA_TYPE_PFP: "pfp",
  USER_DATA_TYPE_BIO: "bio",
  USER_DATA_TYPE_URL: "url",
  USER_DATA_TYPE_TWITTER: "twitter",
  USER_DATA_PRIMARY_ADDRESS_ETHEREUM: "address",
};

export function parseProfile(fid: number, messages: NodeMessage<UserDataBody>[]): HypersnapProfile {
  const p: HypersnapProfile = { fid, username: null, display: null, pfp: null, bio: null, url: null, twitter: null, address: null };
  for (const m of messages ?? []) {
    const body = m?.data?.userDataBody;
    if (!body) continue;
    const field = USER_DATA_FIELDS[body.type];
    if (!field) continue;
    const value = String(body.value ?? "").trim();
    if (!value) continue;
    if ((field === "pfp" || field === "url") && !/^https?:\/\//i.test(value)) continue;
    p[field] = value;
  }
  return p;
}

export function parseCast(m: NodeMessage<CastAddBody>): HypersnapCast | null {
  const b = m?.data?.castAddBody;
  if (!b || m.data.type !== "MESSAGE_TYPE_CAST_ADD") return null;
  return {
    hash: m.hash,
    fid: m.data.fid,
    text: b.text ?? "",
    timestamp: m.data.timestamp,
    at: toIso(m.data.timestamp),
    parentUrl: b.parentUrl ?? null,
    parentCast: b.parentCastId ?? null,
    embeds: (b.embeds ?? []).map((e) => e.url ?? "").filter(Boolean),
  };
}

export function parseInfo(raw: {
  version?: string;
  dbStats?: { numMessages?: number; numFidRegistrations?: number };
  shardInfos?: { shardId: number; maxHeight: number; blockDelay?: number }[];
}): NodeInfo {
  return {
    version: String(raw?.version ?? "unknown"),
    messages: Number(raw?.dbStats?.numMessages ?? 0),
    fids: Number(raw?.dbStats?.numFidRegistrations ?? 0),
    shards: (raw?.shardInfos ?? []).map((s) => ({ id: s.shardId, height: s.maxHeight, delay: s.blockDelay ?? 0 })),
  };
}

// --- the node ---

async function nodeGet<T>(path: string, params: Record<string, string | number>, fresh = false): Promise<T | null> {
  const u = new URL(nodeUrl() + path);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  try {
    const res = await fetch(u, {
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: CACHE_SECONDS } }),
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(NODE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[sparkz:hypersnap] ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getNodeInfo(): Promise<NodeInfo | null> {
  const raw = await nodeGet<Parameters<typeof parseInfo>[0]>("/v1/info", {});
  return raw ? parseInfo(raw) : null;
}

export async function getProfile(fid: number): Promise<HypersnapProfile | null> {
  if (!Number.isInteger(fid) || fid <= 0) return null;
  const raw = await nodeGet<{ messages: NodeMessage<UserDataBody>[] }>("/v1/userDataByFid", { fid });
  if (!raw) return null;
  const p = parseProfile(fid, raw.messages ?? []);
  return p.username || p.display || p.pfp ? p : null;
}

export async function getFidByName(name: string): Promise<number | null> {
  const clean = name.replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,15}$/.test(clean)) return null;
  // Native Hypersnap accounts have fids from 2^32 up and the node sends those as JSON
  // strings, so coerce before checking. They fit in a JS number.
  const raw = await nodeGet<{ fid?: number | string }>("/v1/userNameProofByName", { name: clean });
  const fid = Number(raw?.fid);
  return Number.isSafeInteger(fid) && fid > 0 ? fid : null;
}

// Does the node list this Ed25519 public key (0x + 64 hex) as an active signer for the fid.
// Read fresh: the browser asks right after a KEY_ADD. A node that is down reads as not listed.
export async function signerListed(fid: number, signer: string): Promise<boolean> {
  if (!Number.isSafeInteger(fid) || fid <= 0 || !/^0x[0-9a-f]{64}$/i.test(signer)) return false;
  // the node answers { signer: { key, fid, source, addedAt, ... } } for a live key, an error otherwise
  const raw = await nodeGet<{ signer?: { key?: string; fid?: number | string; removedAt?: number } }>("/v1/signer", { fid, signer }, true);
  const s = raw?.signer;
  return Boolean(s?.key && s.key.toLowerCase() === signer.toLowerCase() && Number(s.fid) === fid && !s.removedAt);
}
