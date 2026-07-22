import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createSparkSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import type { Capsule } from "@/lib/supabase/types";

// POST /api/capsules/create-spark - PUBLIC, self-serve spark creation for /start.
// Deliberately narrow and constrained: a visitor may only set name/bio/type/email.
// The server owns the slug, forces status='spark', and marks the row self_serve so
// operator surfaces can tell community-made sparks apart. No operator token, no
// economic_config, no arbitrary metadata. A honeypot absorbs simple bots.
//
// Note: this has no durable rate limit (that needs a KV/Redis the app doesn't run
// yet). It relies on the honeypot + tight validation. Add IP rate limiting before
// this sees real traffic.
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

    const supabase = getServiceClient();

    const base = slugify(input.name);
    if (!base) return badRequest("Please use a name with some letters or numbers.");
    const slug = await uniqueSlug(supabase, base);

    const { data: capsule, error } = await supabase
      .from("capsules")
      .insert({
        slug,
        type: input.type,
        name: input.name.trim(),
        bio: input.bio?.trim() || null,
        status: "spark",
        metadata: { self_serve: true, owner_email: input.email },
      })
      .select("id, slug")
      .single();
    if (error) throw error;
    const created = capsule as Pick<Capsule, "id" | "slug">;

    // Seed the owner as the first backer so a fresh spark is not empty.
    await supabase.from("capsule_backers").insert({
      capsule_id: created.id,
      backer_kind: "user",
      backer_id: input.email,
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
