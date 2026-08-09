// Real Audius API client - the first live API spoke. No key or secret required: the
// Audius public API only wants an `app_name` identifier. Flow:
//   1. GET https://api.audius.co            -> list of discovery hosts
//   2. GET {host}/v1/users/handle/{handle}  -> the artist (id, name, track_count)
//   3. GET {host}/v1/users/{id}/tracks      -> their tracks
// Server-side only, fail-soft: any network/parse error returns a "not found" result so a
// broken Audius or a bad handle can never take the hub down.

const APP_NAME = "Sparkz";
const BOOTSTRAP = "https://api.audius.co";
// Known-good fallback host if the bootstrap list can't be fetched.
const FALLBACK_HOST = "https://discoveryprovider.audius.co";

export interface AudiusTrack {
  id: string;
  title: string;
  permalink: string;
  playCount: number;
}

export interface AudiusCatalog {
  found: boolean;
  handle: string;
  name?: string;
  trackCount?: number;
  followerCount?: number;
  profileUrl?: string;
  tracks: AudiusTrack[];
}

async function fetchJson(url: string, timeoutMs = 6000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
      // Audius data is public + slow-changing; let Next cache it briefly.
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`audius ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function discoveryHost(): Promise<string> {
  try {
    const j = (await fetchJson(BOOTSTRAP)) as { data?: string[] };
    const host = j.data?.[0];
    return host && host.startsWith("http") ? host : FALLBACK_HOST;
  } catch {
    return FALLBACK_HOST;
  }
}

/** Fetch an artist's public Audius catalog by handle. Fail-soft: never throws. */
export async function getAudiusCatalog(handle: string, limit = 6): Promise<AudiusCatalog> {
  const clean = handle.trim().replace(/^@/, "");
  const empty: AudiusCatalog = { found: false, handle: clean, tracks: [] };
  if (!clean) return empty;

  try {
    const host = await discoveryHost();
    const userRes = (await fetchJson(
      `${host}/v1/users/handle/${encodeURIComponent(clean)}?app_name=${APP_NAME}`,
    )) as { data?: { id?: string; name?: string; track_count?: number; follower_count?: number } };
    const user = userRes.data;
    if (!user?.id) return empty;

    let tracks: AudiusTrack[] = [];
    try {
      const trackRes = (await fetchJson(
        `${host}/v1/users/${user.id}/tracks?app_name=${APP_NAME}&limit=${limit}`,
      )) as { data?: Array<{ id?: string; title?: string; permalink?: string; play_count?: number }> };
      tracks = (trackRes.data ?? [])
        .filter((t) => t.id && t.title)
        .map((t) => ({
          id: String(t.id),
          title: String(t.title),
          permalink: t.permalink ? `https://audius.co${t.permalink}` : "https://audius.co",
          playCount: Number(t.play_count ?? 0),
        }));
    } catch {
      // Tracks are a nice-to-have; a found artist with no tracks is still "found".
    }

    return {
      found: true,
      handle: clean,
      name: user.name ?? clean,
      trackCount: Number(user.track_count ?? tracks.length),
      followerCount: Number(user.follower_count ?? 0),
      profileUrl: `https://audius.co/${clean}`,
      tracks,
    };
  } catch {
    return empty;
  }
}
