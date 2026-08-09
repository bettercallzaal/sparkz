import { NextResponse } from "next/server";
import { z } from "zod";
import { getAudiusCatalog } from "@/lib/plugins/community/audius";

// GET /api/audius?handle=<audius-handle>
// The first live API spoke: returns an artist's REAL public Audius catalog. No key needed
// (Audius public API). Fail-soft - a bad handle or an Audius outage returns found:false,
// never a 500 that would break the caller.
const Query = z.object({
  handle: z.string().trim().min(1).max(64),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = Query.safeParse({ handle: url.searchParams.get("handle") ?? "" });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "handle is required" }, { status: 400 });
    }
    const catalog = await getAudiusCatalog(parsed.data.handle);
    return NextResponse.json({ ok: true, data: catalog });
  } catch (err) {
    console.error("[sparkz:api/audius]", err);
    return NextResponse.json({ ok: false, error: "audius lookup failed" }, { status: 500 });
  }
}
