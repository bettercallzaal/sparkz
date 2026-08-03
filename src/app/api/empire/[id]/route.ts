import type { NextRequest } from "next/server";
import {
  resolveEmpire,
  listEmpireLeaderboards,
  getLeaderboard,
  getEmpireRewards,
  getBoosters,
} from "@/lib/empire/client";
import { ok, badRequest, serverError } from "@/lib/http";

// GET /api/empire/{id} - the full public read bundle for an Empire (empirebuilder.world):
// resolve + leaderboards + the top leaderboard's ranked entries + rewards + boosters, in
// one call. {id} is a base_token (0x...), fid<number>, or a custom slug. Public data (the
// Empire API is public); this is a cached-friendly proxy so the UI can render a Capsule's
// Empire leaderboard + reward flow (Zoostr: the boost leaderboard + 50% fees to it).
export const revalidate = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return badRequest("empire id is required");

    const empire = await resolveEmpire(id);
    if (!empire) return badRequest(`empire not found: ${id}`);

    // Fetch the read surface in parallel; a partial failure on any one shouldn't sink
    // the bundle, so each degrades to null and is reported as-is.
    const [boardsRaw, rewards, boosters] = await Promise.all([
      listEmpireLeaderboards(id).catch(() => null),
      getEmpireRewards(id).catch(() => null),
      getBoosters(id).catch(() => null),
    ]);

    // Pull the first leaderboard's ranked entries (the one the UI shows by default).
    const boards =
      (boardsRaw as { leaderboards?: { id: string }[] } | null)?.leaderboards ?? [];
    const topBoardId = boards[0]?.id ?? null;
    const entries = topBoardId
      ? await getLeaderboard(topBoardId).catch(() => null)
      : null;

    return ok({
      empire,
      leaderboards: boards,
      leaderboard: entries, // ranked entries for boards[0]
      rewards,
      boosters,
    });
  } catch (err) {
    return serverError(err, "empire.read.GET");
  }
}
