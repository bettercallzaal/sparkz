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
} from "@/lib/adapters/media-kit";
import type { Capsule } from "@/lib/supabase/types";

// POST /api/capsules/media-kit - render a Capsule (or an ad-hoc script) into an
// AI-anchor video segment through the Baraza TV media kit. This is the operator test
// surface for the partnership: with no Baraza env set it runs against the offline
// stub (deterministic, no spend), and it flips to the live Baraza renderer the moment
// BARAZA_API_URL is configured.
//
// Operator-only (requireAdmin): it triggers external render cost and reads via the
// service client. Per-creator auth lands with real user accounts later.
//
// Body: { capsuleId?, script?, anchor?, brand?, format? }
//   - Provide `script` OR `capsuleId` (script wins; capsuleId derives a default read).
//
// GET /api/capsules/media-kit?jobId=... - poll a render job to completion.

// Kept in lockstep with BarazaAnchor in the media-kit contract (types.ts).
const anchorEnum = z.enum(["amina", "jabari"]);

const bodySchema = z
  .object({
    capsuleId: z.string().uuid().optional(),
    script: z.string().min(1).max(MAX_SCRIPT_CHARS).optional(),
    anchor: anchorEnum.optional(),
    brand: z.string().max(80).optional(),
    format: z.enum(["vertical", "landscape"]).optional(),
  })
  .refine((b) => Boolean(b.capsuleId || b.script), {
    message: "provide either capsuleId or script",
  });

// Build a default anchor read from a Capsule when no explicit script is given.
function scriptFromCapsule(c: Capsule): string {
  const line = c.bio?.trim() || `${c.name} is a new spark on Sparkz.`;
  const read = `${c.name}. ${line} Back it, boost it, or start your own spark on Sparkz.`;
  return read.slice(0, MAX_SCRIPT_CHARS);
}

export async function POST(req: NextRequest) {
  try {
    const authFail = requireAdmin(req);
    if (authFail) return authFail;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    let script = input.script?.trim() ?? "";
    let brand = input.brand;
    let sourceRef: string | undefined;

    if (!script && input.capsuleId) {
      const supabase = getServiceClient();
      const { data: capsule, error } = await supabase
        .from("capsules")
        .select("id, slug, name, bio")
        .eq("id", input.capsuleId)
        .single();
      if (error || !capsule) return badRequest("capsule not found");
      const c = capsule as Capsule;
      script = scriptFromCapsule(c);
      brand = brand ?? c.name;
      sourceRef = `capsule:${c.slug}`;
    }

    if (!script) return badRequest("empty script");

    const request: SegmentRequest = {
      script,
      anchor: input.anchor ?? DEFAULT_ANCHOR,
      brand,
      format: input.format ?? "vertical",
      sourceRef,
    };

    const job = await getMediaKitProvider().renderSegment(request);
    return ok({ mode: mediaKitMode(), request: { ...request, script }, job });
  } catch (err) {
    return serverError(err, "capsules/media-kit:POST");
  }
}

export async function GET(req: NextRequest) {
  try {
    const authFail = requireAdmin(req);
    if (authFail) return authFail;

    const jobId = new URL(req.url).searchParams.get("jobId")?.trim();
    if (!jobId) return badRequest("jobId is required");

    const job = await getMediaKitProvider().getSegment(jobId);
    return ok({ mode: mediaKitMode(), job });
  } catch (err) {
    return serverError(err, "capsules/media-kit:GET");
  }
}
