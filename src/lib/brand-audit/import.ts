import { getServiceClient } from "@/lib/supabase/server";
import { fetchRepo } from "./github";
import { emptyAudit, type AuditResult, type OssCapsuleMetadata } from "./types";
import type { Capsule } from "@/lib/supabase/types";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "repo"
  );
}

// Import (or re-scan) a GitHub repo as an `oss` Capsule candidate. Refreshes repo
// facts + contributors; PRESERVES any existing audit verdicts so a re-scan never
// wipes human gate decisions.
export async function importRepoAsCapsule(
  owner: string,
  repo: string,
): Promise<Capsule> {
  const info = await fetchRepo(owner, repo);
  const supabase = getServiceClient();
  const slug = slugify(info.name);

  const { data: existing } = await supabase
    .from("capsules")
    .select("metadata")
    .eq("slug", slug)
    .maybeSingle();

  const priorAudit = (existing?.metadata as OssCapsuleMetadata | undefined)
    ?.audit_result as AuditResult | undefined;

  const metadata: OssCapsuleMetadata = {
    entry_point: "oss",
    repo_url: info.url,
    repo_owner: info.owner,
    repo_name: info.name,
    default_branch: info.defaultBranch,
    stars: info.stars,
    contributors: info.contributors,
    audit_result: priorAudit ?? emptyAudit(),
  };

  const { data, error } = await supabase
    .from("capsules")
    .upsert(
      {
        slug,
        type: "oss",
        name: info.name,
        bio: info.description ?? null,
        status: "spark",
        metadata,
      },
      { onConflict: "slug" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as Capsule;
}
