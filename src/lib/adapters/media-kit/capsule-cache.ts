import { createHash } from "node:crypto";
import type { BarazaAnchor, SegmentJob } from "./types";

// A Capsule's media kit lives in `capsule.metadata.mediaKit` - it rides the existing
// jsonb column, so no migration. Rendered segments are cached by a key over
// (anchor, script) so the same read is never paid for twice (HeyGen bills per
// render). Two wins in one:
//   1. Cheaper: a completed segment is returned free on a repeat request; an
//      in-flight ("queued") segment is reused so a retry during a ~30s render does
//      not kick off (and pay for) a second job.
//   2. The Capsule accumulates its own media - which is the point, the Sparkz moat
//      is accumulating Capsule data (CLAUDE.md).
// Pure functions over a metadata object; the route owns persistence.

/** How long an in-flight (queued) render is reused before we re-render. */
export const QUEUED_TTL_MS = 10 * 60 * 1000;

export interface StoredSegment {
  key: string;
  jobId: string;
  status: SegmentJob["status"];
  videoUrl: string | null;
  anchor: BarazaAnchor;
  provider: string;
  scriptChars: number;
  renderedAt: string; // ISO
}

export interface MediaKitStore {
  segments: Record<string, StoredSegment>;
}

/** Stable cache key for a (anchor, script) pair. */
export function mediaKitKey(script: string, anchor: string): string {
  return createHash("sha256")
    .update(`${anchor}\n${script.trim()}`)
    .digest("hex")
    .slice(0, 16);
}

function getStore(metadata: Record<string, unknown> | null | undefined): MediaKitStore {
  const mk = metadata?.mediaKit as MediaKitStore | undefined;
  if (mk && typeof mk === "object" && mk.segments) {
    return { segments: { ...mk.segments } };
  }
  return { segments: {} };
}

export function toStored(job: SegmentJob, key: string, scriptChars: number): StoredSegment {
  return {
    key,
    jobId: job.jobId,
    status: job.status,
    videoUrl: job.videoUrl,
    anchor: job.anchor,
    provider: job.provider,
    scriptChars,
    renderedAt: job.createdAt,
  };
}

/**
 * A cached segment that can be served instead of re-rendering:
 *   - status 'ready'  -> always usable (the render is done).
 *   - status 'queued' -> usable only while fresh (an in-flight render; reusing it
 *     avoids a duplicate paid job). Stale queued segments re-render.
 * Anything else (failed / missing) -> null, re-render.
 */
export function usableCachedSegment(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
  nowMs: number,
): StoredSegment | null {
  const seg = getStore(metadata).segments[key];
  if (!seg) return null;
  if (seg.status === "ready" && seg.videoUrl) return seg;
  if (seg.status === "queued") {
    const age = nowMs - Date.parse(seg.renderedAt);
    if (Number.isFinite(age) && age >= 0 && age < QUEUED_TTL_MS) return seg;
  }
  return null;
}

/** Merge a segment into a copy of metadata (immutable). Caller persists the result. */
export function writeCachedSegment(
  metadata: Record<string, unknown> | null | undefined,
  seg: StoredSegment,
): Record<string, unknown> {
  const store = getStore(metadata);
  store.segments[seg.key] = seg;
  return { ...(metadata ?? {}), mediaKit: store };
}

/** Read a Capsule's whole media kit (for a GET / profile surface). */
export function listSegments(metadata: Record<string, unknown> | null | undefined): StoredSegment[] {
  return Object.values(getStore(metadata).segments).sort((a, b) =>
    b.renderedAt.localeCompare(a.renderedAt),
  );
}
