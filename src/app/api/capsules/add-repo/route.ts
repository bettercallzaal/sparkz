import type { NextRequest } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { Capsule } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// POST /api/capsules/add-repo - operator-only. Add a project by its GitHub repo:
// paste a repo URL, we pull the real repo metadata (description, homepage, stars,
// language, topics) and open an OSS Capsule pre-filled with it. The rest of the
// project's info + integrations get layered on after. No invented data - every field
// comes from GitHub or is left empty.
const schema = z.object({ repo_url: z.string().trim().min(1).max(300) });

// Accept a full github URL or "owner/repo" shorthand.
function parseRepo(input: string): { owner: string; repo: string } | null {
  const s = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const parts = s.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo] = parts;
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
  return { owner, repo };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

interface GhRepo {
  name?: string;
  description?: string | null;
  homepage?: string | null;
  html_url?: string;
  language?: string | null;
  topics?: string[];
  stargazers_count?: number;
  default_branch?: string;
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);
    const target = parseRepo(parsed.data.repo_url);
    if (!target) return badRequest("Enter a GitHub repo URL or owner/repo.");

    const supabase = getServiceClient();

    // Do not duplicate: if this repo already has a Capsule, return it so the operator
    // can enrich/un-hide the existing one instead of creating a second row.
    const canonicalRepo = `https://github.com/${target.owner}/${target.repo}`;
    const { data: existing } = await supabase
      .from("capsules")
      .select("*")
      .eq("metadata->>repo_owner", target.owner)
      .eq("metadata->>repo_name", target.repo)
      .maybeSingle();
    if (existing) {
      return ok({ ...(existing as Capsule), already: true }, 200);
    }

    // Pull real repo metadata from GitHub. Uses GITHUB_TOKEN if present (higher rate
    // limit); unauthenticated works fine for occasional operator adds.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "sparkz",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const ghRes = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, {
      headers,
    });
    if (ghRes.status === 404) return badRequest("Repo not found (or it is private).");
    if (ghRes.status === 403) return badRequest("GitHub rate limit hit - try again shortly.");
    if (!ghRes.ok) return badRequest(`GitHub error (${ghRes.status}).`);
    const gh = (await ghRes.json()) as GhRepo;

    const repoName = gh.name ?? target.repo;
    const base = slugify(repoName);
    if (!base) return badRequest("Could not derive a slug from that repo name.");
    const slug = await uniqueSlug(supabase, base);

    const tags = [gh.language, ...(Array.isArray(gh.topics) ? gh.topics : [])]
      .filter((t): t is string => Boolean(t))
      .slice(0, 8);
    const links: Record<string, string> = { github: gh.html_url ?? canonicalRepo };
    if (gh.homepage && /^https?:\/\//i.test(gh.homepage)) links.website = gh.homepage;

    const { data, error } = await supabase
      .from("capsules")
      .insert({
        slug,
        type: "oss",
        name: repoName,
        bio: gh.description ?? null,
        status: "spark",
        owner_fid: null,
        metadata: {
          review: "approved",
          entry_point: "oss",
          repo_url: gh.html_url ?? canonicalRepo,
          repo_owner: target.owner,
          repo_name: repoName,
          default_branch: gh.default_branch ?? "main",
          stars: gh.stargazers_count ?? 0,
          links,
          tags,
          ...(gh.description ? { about: gh.description } : {}),
        },
        economic_config: {},
      })
      .select("*")
      .single();
    if (error) throw error;
    return ok(data as Capsule, 201);
  } catch (err) {
    return serverError(err, "add-repo.POST");
  }
}

async function uniqueSlug(
  supabase: ReturnType<typeof getServiceClient>,
  base: string,
): Promise<string> {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const { data } = await supabase
      .from("capsules")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
