// The Baraza TV "streaming media kit" contract.
//
// This is the shared spec between Sparkz and Baraza TV (Aziz). Sparkz calls it to
// turn a Capsule into an AI-anchor video segment - a promo, a recap, or a spark
// announcement read by one of Baraza TV's anchors. It mirrors the four-tool surface
// from the partnership pitch (render / live / distribute / transcribe); v1 wires the
// one tool a Capsule needs today: renderSegment.
//
// Rendering is asynchronous on Baraza TV's side (HeyGen/Hedra + ElevenLabs), so a
// render is a JOB:
//   renderSegment(req) -> { jobId, status: 'queued' }
//   getSegment(jobId)  -> poll until status === 'ready' with a videoUrl
// The stub provider short-circuits to 'ready' so the whole loop is testable BEFORE
// Baraza TV ships its API. See docs/BARAZA-INTEGRATION.md for the wire spec.

// Baraza TV's two on-air anchors (from the Baraza TV roster): Amina Wanjiru (lead
// anchor) and Jabari Adeyemi (finance/blockchain correspondent).
export type BarazaAnchor = "amina" | "jabari";

export type SegmentFormat = "vertical" | "landscape";

export type SegmentStatus = "queued" | "rendering" | "ready" | "failed";

export interface SegmentRequest {
  /** What the anchor reads aloud. Bounded to keep render cost + time sane. */
  script: string;
  /** Which anchor delivers it. */
  anchor: BarazaAnchor;
  /** Overlay / lower-third label, e.g. the Capsule name or "Sparkz". */
  brand?: string;
  /** Aspect. Default vertical - Farcaster / mobile-first. */
  format?: SegmentFormat;
  /** Caller correlation id, e.g. `capsule:<slug>`. Echoed back for traceability. */
  sourceRef?: string;
}

export interface SegmentJob {
  jobId: string;
  status: SegmentStatus;
  /** Present once status === 'ready'. Null while queued/rendering/failed. */
  videoUrl: string | null;
  provider: "baraza" | "stub";
  anchor: BarazaAnchor;
  createdAt: string;
  /** Populated when status === 'failed'. */
  error?: string;
  /** Provider's raw payload, kept for debugging. Never rendered to end users. */
  raw?: unknown;
}

// The port. Both the live Baraza client and the offline stub implement this, and
// the selector in index.ts picks one based on env. Any future media backend drops
// in behind this same interface.
export interface MediaKitProvider {
  readonly id: "baraza" | "stub";
  renderSegment(req: SegmentRequest): Promise<SegmentJob>;
  getSegment(jobId: string): Promise<SegmentJob>;
}

export const MAX_SCRIPT_CHARS = 1200;
export const DEFAULT_ANCHOR: BarazaAnchor = "amina";
export const BARAZA_ANCHORS: readonly BarazaAnchor[] = ["amina", "jabari"];
