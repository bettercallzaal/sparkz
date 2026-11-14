import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { dbBackend, getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/http";
import { requireAdmin, requireHearthOwner } from "@/lib/auth";
import { sniffImage } from "@/lib/image-sniff";

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

// POST /api/upload - multipart form with a single `file`. Uploads to public storage
// (server-side) and returns the public URL:
//   SPARKZ_DB=neon -> the public Vercel Blob store sparkz-blob (BLOB_READ_WRITE_TOKEN),
//                     under the same empire-logos/ prefix;
//   unset          -> the public Supabase bucket empire-logos, as before.
// Who may upload:
//   - an admin, with no hearth_id (the empire launcher logo);
//   - the owner of a Hearth (or an admin), with a `hearth_id` field: the Hearth's
//     picture, from the Manage page. requireHearthOwner checks the verified session.
// The file's first bytes must match an accepted image type (lib/image-sniff.ts); the
// browser-declared File.type alone is not trusted.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData().catch(() => null);
    const hearthId = form?.get("hearth_id");
    if (typeof hearthId === "string" && hearthId) {
      if (!/^[0-9a-f-]{36}$/i.test(hearthId)) return badRequest("bad hearth_id");
      const denied = await requireHearthOwner(req, hearthId);
      if (denied) return denied;
    } else {
      const denied = requireAdmin(req);
      if (denied) return denied;
    }

    const file = form?.get("file");
    if (!(file instanceof File)) return badRequest("no file");
    if (file.size > MAX_BYTES) return badRequest("file too large (max 2MB)");
    const ext = EXT_BY_MIME[file.type];
    if (!ext) return badRequest("unsupported image type (png, jpeg, webp, gif)");
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (sniffImage(head) !== file.type) return badRequest("the file is not a valid image of that type");

    const key = `${crypto.randomUUID()}.${ext}`;

    if (dbBackend() === "neon") {
      // A random key and addRandomSuffix off: the name is ours, never the caller's, and an
      // existing blob is never overwritten (put refuses by default).
      const blob = await put(`${BUCKET}/${key}`, file, { access: "public", contentType: file.type, addRandomSuffix: false });
      return ok({ url: blob.url }, 201);
    }

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
