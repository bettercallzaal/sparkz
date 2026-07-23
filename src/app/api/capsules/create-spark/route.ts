import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createSparkSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError, tooManyRequests } from "@/lib/http";
import {
  clientIpHash,
  selfServeCountInWindow,
  SELF_SERVE_LIMIT,
  SELF_SERVE_WINDOW_MS,
} from "@/lib/rate-limit";
import { isAdmin } from "@/lib/auth";
import type { Capsule } from "@/lib/supabase/types";

// POST /api/capsules/create-spark - PUBLIC, self-serve spark creation for /start.
// Deliberately narrow and constrained: a visitor may only set name/bio/type/email.
// The server owns the slug, forces status='spark', and marks the row self_serve so
// operator surfaces can tell community-made sparks apart. No operator token, no
// economic_config, no arbitrary metadata.
//
// Abuse defense, in order: a honeypot absorbs simple bots; a DB-backed per-IP rate
// limit (SELF_SERVE_LIMIT/hour, see lib/rate-limit.ts) stops floods; tight Zod
// validation bounds everything else. IP rotation can still get past the limit, so a
// human-review gate on self-serve sparks is the next layer.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createSparkSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const input = parsed.data;

    // Honeypot tripped: pretend success, create nothing.
    if (input.website && input.website.trim().length > 0) {
      return ok({ slug: null, ignored: true }, 200);
    }

    // The operator is exempt from the rate limit, and their sparks skip review.
    const admin = isAdmin(req);

    // IP rate limit: a handful of sparks per hour per address (operator exempt).
    const ipHash = clientIpHash(req);
    if (!admin) {
      const recent = await selfServeCountInWindow(ipHash, SELF_SERVE_WINDOW_MS);
      if (recent >= SELF_SERVE_LIMIT) {
        return tooManyRequests(
          "You have lit a few sparks recently. Give it an hour and try again.",
        );
      }
    }

    const supabase = getServiceClient();

    const base = slugify(input.name);
    if (!base) return badRequest("Please use a name with some letters or numbers.");
    const slug = await uniqueSlug(supabase, base);

    // Optional Farcaster identity from the signed-in creator. Client-asserted, so it
    // is stored for display/ownership but does NOT by itself grant approval - only
    // the operator (admin) skips the review gate.
    const fc =
      input.owner_fid || input.fc_username || input.fc_channel
        ? {
            fid: input.owner_fid ?? null,
            username: input.fc_username ?? null,
            channel: input.fc_channel ?? null,
          }
        : undefined;

    const { data: capsule, error } = await supabase
      .from("capsules")
      .insert({
        slug,
        type: input.type,
        name: input.name.trim(),
        bio: input.bio?.trim() || null,
        status: "spark",
        owner_fid: input.owner_fid ?? null,
        // Operator-made sparks are approved on the spot; public self-serve sparks are
        // held for review (see loadPublicCapsules, /api/directory, /api/capsules GET).
        metadata: {
          self_serve: !admin,
          owner_email: input.email ?? null,
          ip_hash: ipHash,
          review: admin ? "approved" : "pending",
          ...(fc ? { farcaster: fc } : {}),
        },
      })
      .select("id, slug")
      .single();
    if (error) throw error;
    const created = capsule as Pick<Capsule, "id" | "slug">;

    // Seed the owner as the first backer so a fresh spark is not empty.
    const backerId =
      input.email ?? (input.fc_username ? `@${input.fc_username}` : `fid:${input.owner_fid}`);
    await supabase.from("capsule_backers").insert({
      capsule_id: created.id,
      backer_kind: input.owner_fid ? "fid" : "user",
      backer_id: backerId,
      kind: "boost",
      provider: "ledger",
    });

    return ok({ slug: created.slug }, 201);
  } catch (err) {
    return serverError(err, "create-spark.POST");
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

// Append -2, -3, ... until the slug is free.
async function uniqueSlug(
  supabase: ReturnType<typeof getServiceClient>,
  base: string,
): Promise<string> {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const { data } = await supabase
      .from("capsules")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  // Extremely unlikely fallback.
  return `${base}-${Date.now().toString(36)}`;
}
