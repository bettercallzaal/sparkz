import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "empire-logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
// Raster images only. SVG is intentionally excluded: it can carry embedded script,
// and this bucket is PUBLIC, so an uploaded SVG is a stored-XSS / phishing hosting
// vector. The object key extension is derived from this validated MIME map - never
// from the caller-supplied filename (which could smuggle a "/" into the key).
const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
    const ext = EXT_BY_MIME[file.type];
    if (!ext) return badRequest("unsupported image type (png, jpeg, webp, gif)");

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
