import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { nodeUrl } from "@/lib/hypersnap";
import { clientIpHash } from "@/lib/rate-limit";
import { memoryLimitHit } from "@/lib/memory-limit";

export const dynamic = "force-dynamic";

// POST /api/hypersnap/submit: public, no session, relay only. A signed protocol message
// (bytes) from the browser, forwarded to the node's /v1/submitMessage. The browser signs; this route only relays, so the node
// URL stays server-side and the browser needs no CORS from the node. Sparkz never sees a
// key: the message carries a signature and a public key, nothing else. Capped per IP (in
// memory, per server instance) and at 8 KB (a KEY_ADD is about 600 bytes, a long cast
// under 2 KB). The node's own error text is logged here, never returned to the caller.
const MAX_BYTES = 8 * 1024;
const SUBMIT_LIMIT = 20;
const SUBMIT_WINDOW_MS = 60 * 1000;
const NODE_SUBMIT_TIMEOUT_MS = 10_000;

export async function POST(req: NextRequest) {
  try {
    if (memoryLimitHit(`hypersnap-submit:${clientIpHash(req)}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
      return tooManyRequests("too many submissions, try again in a minute");
    }
    if (!(req.headers.get("content-type") ?? "").startsWith("application/octet-stream")) {
      return badRequest("send the signed message as application/octet-stream");
    }
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) return badRequest(`message must be 1 to ${MAX_BYTES} bytes`);

    const res = await fetch(`${nodeUrl()}/v1/submitMessage`, {
      method: "POST",
      headers: { "content-type": "application/octet-stream", accept: "application/json" },
      body: bytes,
      cache: "no-store",
      signal: AbortSignal.timeout(NODE_SUBMIT_TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[sparkz:hypersnap.submit.POST] node answered ${res.status}`, text.slice(0, 500));
      return NextResponse.json(
        { ok: false, error: res.status >= 500 ? "The Hypersnap node is not answering. Try again in a minute." : "The Hypersnap node did not accept this message." },
        { status: res.status >= 500 ? 502 : 400 },
      );
    }
    let json: unknown = null;
    try { json = JSON.parse(text); } catch { json = null; }
    return NextResponse.json({ ok: true, data: json });
  } catch (err) {
    return serverError(err, "hypersnap.submit.POST");
  }
}
