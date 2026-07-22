// Typed client for the Sparkz operator API. Every write path is admin-gated, so we
// send the operator token as the x-sparkz-admin-token header. Responses use the
// { ok, data } / { ok, error } envelope from src/lib/http.ts.

export interface Capsule {
  id: string;
  slug: string;
  name: string;
  type: string;
  status: string;
  bio: string | null;
  metadata: Record<string, unknown>;
  economic_config: Record<string, unknown>;
}

export interface Draft {
  id: string;
  signal_id: string;
  draft_text: string;
  rank: number | null;
  chosen: boolean;
}

export interface Signal {
  id: string;
  capsule_id: string;
  text: string;
  why_it_matched: string | null;
  status: "flagged" | "drafted" | "approved" | "published" | "rejected";
  drafts?: Draft[];
}

export interface Receipt {
  id: string;
  capsule_id: string;
  signal_id: string | null;
}

export class SparkzError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SparkzError";
  }
}

export class SparkzClient {
  constructor(
    private readonly base: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await this.fetchImpl(`${this.base}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-sparkz-admin-token": this.token,
        ...(init?.headers ?? {}),
      },
    });
    const body = (await res.json().catch(() => null)) as
      | { ok: true; data: T }
      | { ok: false; error: string }
      | null;
    if (!res.ok || !body || body.ok === false) {
      const msg = body && "error" in body ? body.error : `HTTP ${res.status}`;
      throw new SparkzError(msg, res.status);
    }
    return body.data;
  }

  async getCapsuleBySlug(slug: string): Promise<Capsule> {
    const all = await this.call<Capsule[]>("/api/capsules");
    const found = all.find((c) => c.slug === slug);
    if (!found) throw new SparkzError(`Capsule not found: ${slug}`, 404);
    return found;
  }

  listSignals(capsuleId: string): Promise<Signal[]> {
    return this.call<Signal[]>(`/api/signals?capsule_id=${encodeURIComponent(capsuleId)}`);
  }

  flagSignal(input: {
    capsule_id: string;
    text: string;
    why_it_matched?: string;
    source?: string;
    flagged_by?: string;
  }): Promise<{ signal: Signal; drafts: Draft[] }> {
    return this.call("/api/signals", { method: "POST", body: JSON.stringify(input) });
  }

  approveDraft(input: {
    signal_id: string;
    draft_id: string;
    approver?: string;
    approved_via?: string;
    lessons?: string;
  }): Promise<{ signal: Signal; receipt: Receipt }> {
    return this.call("/api/signals/approve", { method: "POST", body: JSON.stringify(input) });
  }

  listReceipts(capsuleId: string): Promise<Receipt[]> {
    return this.call<Receipt[]>(`/api/receipts?capsule_id=${encodeURIComponent(capsuleId)}`);
  }
}

// The Farcaster channel a Capsule casts into, from its metadata (set via
// /api/capsules/link-farcaster). null when the Capsule has no Farcaster home yet.
export function capsuleChannel(capsule: Capsule): string | null {
  const fc = capsule.metadata?.farcaster as { channel?: string } | undefined;
  return fc?.channel ?? null;
}
