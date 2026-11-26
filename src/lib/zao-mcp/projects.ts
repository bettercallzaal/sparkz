import { canonicalOrigin } from "@/lib/origin";
import { loadPublicHearths } from "@/lib/public-hearths";
import type { Hearth } from "@/lib/supabase/types";
import type { ToolResult } from "./proof";

// list_zao_projects: "the info for the ZAO" (Zaal, 26 Nov). The public Hearths and their
// one-line descriptions, read through loadPublicHearths, the same read the public site's
// landing surfaces use. Only public fields go out: name, slug, type, status, the one-line
// bio and the page link. No owner, wallet, email, metadata or economic config.
const ETH_ADDRESS = /0x[0-9a-fA-F]{40}/g;

export type ZaoProject = { slug: string; name: string; type: string; status: string; about: string | null; url: string };

function oneLine(bio: string | null | undefined): string | null {
  const first = (bio ?? "").split(/\r?\n/)[0].replace(ETH_ADDRESS, "").trim();
  if (!first) return null;
  return first.length > 200 ? `${first.slice(0, 197)}...` : first;
}

export async function listZaoProjects(load: () => Promise<Hearth[]> = loadPublicHearths): Promise<ToolResult> {
  const origin = canonicalOrigin();
  const projects: ZaoProject[] = (await load())
    .filter((h) => typeof h.slug === "string" && /^[a-z0-9][a-z0-9-]*$/.test(h.slug))
    .map((h) => ({
      slug: h.slug,
      name: h.name,
      type: h.type,
      status: h.status,
      about: oneLine(h.bio),
      url: `${origin}/c/${h.slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const text = projects.length
    ? projects.map((p) => `- ${p.name} (${p.type}): ${p.about ?? "no description yet"} ${p.url}`).join("\n")
    : "No public ZAO projects to show right now.";
  return { content: [{ type: "text", text }], structuredContent: { projects } };
}
