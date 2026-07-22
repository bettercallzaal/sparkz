import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "empire-logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

// POST /api/upload - multipart form with a single `file`. Uploads to the public
// empire-logos bucket (server-side, service role) and returns the public URL.
// Admin-gated. Used for the empire launcher logo.
export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return badRequest("no file");
    if (file.size > MAX_BYTES) return badRequest("file too large (max 2MB)");
    if (!ALLOWED.includes(file.type)) return badRequest("unsupported image type");

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const key = `${crypto.randomUUID()}.${ext}`;

    const supabase = getServiceClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
    return ok({ url: data.publicUrl }, 201);
  } catch (err) {
    return serverError(err, "upload.POST");
  }
}
