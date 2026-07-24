import type { NextRequest } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import {
  getMediaKitProvider,
  mediaKitMode,
  DEFAULT_ANCHOR,
  MAX_SCRIPT_CHARS,
  type SegmentRequest,
  type SegmentJob,
} from "@/lib/adapters/media-kit";
import {
  mediaKitKey,
  usableCachedSegment,
  writeCachedSegment,
  toStored,
  type StoredSegment,
} from "@/lib/adapters/media-kit/capsule-cache";
import type { Capsule } from "@/lib/supabase/types";

// POST /api/capsules/media-kit - render a Capsule (or an ad-hoc script) into an
// AI-anchor video segment through the Baraza TV media kit. Operator test surface for
// the partnership: with no Baraza env set it runs against the offline stub
// (deterministic, no spend), and flips to the live Baraza renderer when
// BARAZA_API_URL is configured.
//
// Cost control: when a Capsule is rendered, the result is cached on the Capsule
// (`metadata.mediaKit`, no migration) keyed by (anchor, script). A repeat request
// returns the stored segment for free instead of paying HeyGen again; an in-flight
// render is reused so a retry mid-render does not double-bill. Pass `refresh: true`
// to force a new render.
//
// Operator-only (requireAdmin): triggers external render cost + service-client reads.
//
// Body: { capsuleId?, script?, anchor?, brand?, format?, refresh? }
//   - Provide `script` OR `capsuleId` (script wins; capsuleId derives a default read
//     and enables caching/persistence).
//
// GET /api/capsules/media-kit?jobId=...[&capsuleId=...] - poll a render job. When
// capsuleId is given and the job is ready, the cached record is updated to ready.

// Kept in lockstep with BarazaAnchor in the media-kit contract (types.ts).
const anchorEnum = z.enum(["amina", "jabari"]);

const bodySchema = z
  .object({
    capsuleId: z.string().uuid().optional(),
    script: z.string().min(1).max(MAX_SCRIPT_CHARS).optional(),
    anchor: anchorEnum.optional(),
    brand: z.string().max(80).optional(),
    format: z.enum(["vertical", "landscape"]).optional(),
    refresh: z.boolean().optional(),
  })
  .refine((b) => Boolean(b.capsuleId || b.script), {
    message: "provide either capsuleId or script",
  });

// Build a default anchor read from a Capsule when no explicit script is given.
function scriptFromCapsule(c: Pick<Capsule, "name" | "bio">): string {
  const line = c.bio?.trim() || `${c.name} is a new spark on Sparkz.`;
  const read = `${c.name}. ${line} Back it, boost it, or start your own spark on Sparkz.`;
  return read.slice(0, MAX_SCRIPT_CHARS);
}

function jobFromStored(s: StoredSegment): SegmentJob {
  return {
    jobId: s.jobId,
    status: s.status,
    videoUrl: s.videoUrl,
    provider: s.provider as SegmentJob["provider"],
    anchor: s.anchor,
    createdAt: s.renderedAt,
  };
}

export async function POST(req: NextRequest) {
  try {
    const authFail = requireAdmin(req);
    if (authFail) return authFail;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    const anchor = input.anchor ?? DEFAULT_ANCHOR;
    let script = input.script?.trim() ?? "";
    let brand = input.brand;
    let sourceRef: string | undefined;

    // Capsule path: derive the read (if no explicit script), and use the Capsule as
    // the cache + persistence home.
    let capsule: Capsule | null = null;
    if (input.capsuleId) {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from("capsules")
        .select("id, slug, name, bio, metadata")
        .eq("id", input.capsuleId)
        .single();
      if (error || !data) return badRequest("capsule not found");
      capsule = data as Capsule;
      if (!script) script = scriptFromCapsule(capsule);
      brand = brand ?? capsule.name;
      sourceRef = `capsule:${capsule.slug}`;
    }

    if (!script) return badRequest("empty script");

    // Cache check (Capsule renders only).
    if (capsule && !input.refresh) {
      const key = mediaKitKey(script, anchor);
      const cached = usableCachedSegment(capsule.metadata, key, Date.now());
      if (cached) {
        return ok({ mode: mediaKitMode(), cached: true, job: jobFromStored(cached) });
      }
    }

    const request: SegmentRequest = {
      script,
      anchor,
      brand,
      format: input.format ?? "vertical",
      sourceRef,
    };

    const job = await getMediaKitProvider().renderSegment(request);

    // Persist onto the Capsule so it is cached + retrievable.
    if (capsule) {
      const key = mediaKitKey(script, anchor);
      const nextMetadata = writeCachedSegment(
        capsule.metadata,
        toStored(job, key, script.length),
      );
      const supabase = getServiceClient();
      const { error } = await supabase
        .from("capsules")
        .update({ metadata: nextMetadata })
        .eq("id", capsule.id);
      if (error) console.error("[capsules/media-kit] persist failed:", error.message);
    }

    return ok({ mode: mediaKitMode(), cached: false, job });
  } catch (err) {
    return serverError(err, "capsules/media-kit:POST");
  }
}

export async function GET(req: NextRequest) {
  try {
    const authFail = requireAdmin(req);
    if (authFail) return authFail;

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId")?.trim();
    const capsuleId = url.searchParams.get("capsuleId")?.trim();
    if (!jobId) return badRequest("jobId is required");

    const job = await getMediaKitProvider().getSegment(jobId);

    // If this job belongs to a Capsule and has resolved to ready, update the cached
    // record so future POSTs hit the cache instead of re-rendering.
    if (capsuleId && job.status === "ready" && job.videoUrl) {
      const supabase = getServiceClient();
      const { data } = await supabase
        .from("capsules")
        .select("id, metadata")
        .eq("id", capsuleId)
        .single();
      const capsule = data as Pick<Capsule, "id" | "metadata"> | null;
      if (capsule) {
        // Find the stored key for this jobId and refresh it.
        const store = (capsule.metadata?.mediaKit as { segments?: Record<string, StoredSegment> } | undefined)?.segments ?? {};
        const entry = Object.values(store).find((s) => s.jobId === jobId);
        if (entry && entry.status !== "ready") {
          const next = writeCachedSegment(capsule.metadata, { ...entry, status: "ready", videoUrl: job.videoUrl });
          await supabase.from("capsules").update({ metadata: next }).eq("id", capsuleId);
        }
      }
    }

    return ok({ mode: mediaKitMode(), job });
  } catch (err) {
    return serverError(err, "capsules/media-kit:GET");
  }
}
