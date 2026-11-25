import { cookies } from "next/headers";
import { readSessionClaims, SESSION_COOKIE } from "@/lib/session";
import { blockedOwners } from "@/lib/blocks-server";

// Server components (Home, a Hearth page) have no NextRequest; they read the session
// cookie through next/headers. Same answer as blockedOwners(sessionClaims(req)).
export async function viewerBlockedOwners(): Promise<Set<string>> {
  const jar = await cookies();
  return blockedOwners(readSessionClaims(jar.get(SESSION_COOKIE)?.value));
}
