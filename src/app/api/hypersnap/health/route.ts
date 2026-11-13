import { ok } from "@/lib/http";
import { getNodeInfo, nodeUrl } from "@/lib/hypersnap";

export const dynamic = "force-dynamic";

// GET /api/hypersnap/health - which node Sparkz reads from and whether it answers.
// Public and read-only: version, message and FID counts, shard heights. Nothing of ours.
export async function GET() {
  const info = await getNodeInfo();
  return ok({ node: nodeUrl(), up: info !== null, info });
}
