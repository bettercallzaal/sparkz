import type {
  MediaKitProvider,
  SegmentJob,
  SegmentRequest,
  SegmentStatus,
} from "./types";
import { DEFAULT_ANCHOR, MAX_SCRIPT_CHARS } from "./types";

// Live Baraza TV client. Speaks the contract in types.ts over HTTP.
//
// Baraza TV's API is not public yet, so the two endpoint paths below are the ones
// proposed in the partnership spec (docs/BARAZA-INTEGRATION.md). When Aziz ships,
// adjust ONLY these two paths / the field mapping to match what he built - the job
// model and the SegmentJob shape are the negotiated contract and should not move.
//
// Config: BARAZA_API_URL (base), BARAZA_API_KEY (bearer). The selector (index.ts)
// only returns this provider when BARAZA_API_URL is set, so base() assumes it.

function base(): string {
  const url = process.env.BARAZA_API_URL;
  if (!url) throw new Error("BARAZA_API_URL not set");
  return url.replace(/\/+$/, "");
}

function headers(): Record<string, string> {
  const key = process.env.BARAZA_API_KEY;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

// Normalize whatever Baraza reports into our four-state enum. Unknown -> 'rendering'
// (a benign "keep polling") so an upstream vocabulary change never crashes a caller.
function mapStatus(raw: unknown): SegmentStatus {
  const s = String(raw ?? "").toLowerCase();
  if (["ready", "done", "complete", "completed", "succeeded"].includes(s)) return "ready";
  if (["failed", "error", "errored"].includes(s)) return "failed";
  if (["queued", "pending", "accepted"].includes(s)) return "queued";
  return "rendering";
}

function toJob(anchor: SegmentJob["anchor"], data: Record<string, unknown>): SegmentJob {
  const status = mapStatus(data.status);
  return {
    jobId: String(data.jobId ?? data.id ?? ""),
    status,
    videoUrl:
      (data.videoUrl as string) ??
      (data.video_url as string) ??
      (data.url as string) ??
      null,
    provider: "baraza",
    anchor,
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    error: status === "failed" ? String(data.error ?? "render failed") : undefined,
    raw: data,
  };
}

async function renderSegment(req: SegmentRequest): Promise<SegmentJob> {
  if (!req.script?.trim()) throw new Error("script is required");
  if (req.script.length > MAX_SCRIPT_CHARS) {
    throw new Error(`script exceeds ${MAX_SCRIPT_CHARS} characters`);
  }
  const anchor = req.anchor ?? DEFAULT_ANCHOR;
  const res = await fetch(`${base()}/api/render`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      script: req.script,
      anchor,
      brand: req.brand,
      format: req.format ?? "vertical",
      sourceRef: req.sourceRef,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `baraza render ${res.status}: ${(body as { error?: string }).error ?? "failed"}`,
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toJob(anchor, data);
}

async function getSegment(jobId: string): Promise<SegmentJob> {
  const res = await fetch(`${base()}/api/render/${encodeURIComponent(jobId)}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `baraza getSegment ${res.status}: ${(body as { error?: string }).error ?? "failed"}`,
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return toJob((data.anchor as SegmentJob["anchor"]) ?? DEFAULT_ANCHOR, data);
}

export const barazaProvider: MediaKitProvider = {
  id: "baraza",
  renderSegment,
  getSegment,
};
