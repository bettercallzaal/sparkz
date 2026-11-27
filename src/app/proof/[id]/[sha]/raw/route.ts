import { getApprovedReceipt } from "@/lib/zao-mcp/proof";

// GET /proof/<id>/<sha256>/raw - the exact canonical receipt bytes, the same bytes
// open_contribution_proof reads. The digest is in the path, so this URL always means one
// revision; there is no "latest". A closed record (unknown, changed, not allowlisted or
// expired) is a 404.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; sha: string }> }) {
  const { id, sha } = await params;
  const found = getApprovedReceipt(id, sha);
  if (!found) return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(found.bytes, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-content-sha256": sha,
      // Short: an approval can expire, so caches must not outlive it by much.
      "cache-control": "public, max-age=300",
    },
  });
}
