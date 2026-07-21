import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { joinWaitlistSchema } from "@/lib/validation/schemas";
import { ok, serverError, zodError } from "@/lib/http";

// POST /api/waitlist - public "Join Sparkz" capture. Intentionally NOT admin-gated
// (anyone can join). A single validated insert-only op; duplicate emails resolve
// to a friendly success (no enumeration leak). Reads are not exposed here.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = joinWaitlistSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const email = parsed.data.email.trim().toLowerCase();
    const supabase = getServiceClient();
    const { error } = await supabase.from("waitlist").insert({
      email,
      ref: parsed.data.ref ?? null,
      interest: parsed.data.interest ?? null,
    });

    // Unique-violation = already joined; treat as success, don't leak which.
    if (error && error.code !== "23505") throw error;

    return ok({ joined: true }, 201);
  } catch (err) {
    return serverError(err, "waitlist.POST");
  }
}
