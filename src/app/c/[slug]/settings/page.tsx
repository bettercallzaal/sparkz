import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import VisibilitySettings from "@/app/_components/VisibilitySettings";
import LinkFarcasterForm, { type FarcasterLink } from "@/app/_components/LinkFarcasterForm";
import LinkEmpireForm from "@/app/_components/LinkEmpireForm";
import EditHearthForm, { type HearthDetails } from "@/app/_components/EditHearthForm";
import SleepHearthButton from "@/app/_components/SleepHearthButton";
import OwnerBackers from "@/app/_components/OwnerBackers";

export const dynamic = "force-dynamic";

// Owner settings for a Hearth: control which integrations show on the public page.
// Gated at the API layer: the Hearth's owner (verified Farcaster session) or the operator.
export default async function HearthSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("hearths")
    .select("id, slug, name, bio, status, owner_fid, metadata, economic_config")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();
  // Only the two empire fields reach the client form, not the whole economic_config.
  const econ = (data.economic_config ?? {}) as {
    empire_id?: string | null;
    empire_address?: string | null;
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <Link href={`/c/${data.slug}`} className="text-sm text-muted hover:text-foreground">
        &lt;- {data.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Manage {data.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Choose which integrations show on {data.name}&apos;s public page. Toggle one to
        Hidden and it disappears from the Hearth; toggle it Visible to bring it back.
      </p>
      <EditHearthForm
        hearthId={data.id}
        ownerFid={data.owner_fid ?? null}
        current={{ name: data.name, bio: data.bio ?? null, ...pickDetails(data.metadata) }}
      />
      <div className="mt-6">
        <VisibilitySettings hearthId={data.id} slug={data.slug} name={data.name} />
      </div>
      <LinkFarcasterForm
        hearthId={data.id}
        current={((data.metadata ?? {}) as { farcaster?: FarcasterLink }).farcaster ?? null}
      />
      <LinkEmpireForm
        hearthId={data.id}
        current={{ empire_id: econ.empire_id ?? null, empire_address: econ.empire_address ?? null }}
      />
      <OwnerBackers hearthId={data.id} ownerFid={data.owner_fid ?? null} />
      <SleepHearthButton hearthId={data.id} ownerFid={data.owner_fid ?? null} status={data.status} />
    </main>
  );
}

// Only the editable display fields go to the client form.
function pickDetails(metadata: unknown): Omit<HearthDetails, "name" | "bio"> {
  const m = (metadata ?? {}) as Record<string, unknown>;
  return {
    about: typeof m.about === "string" ? m.about : undefined,
    image: typeof m.image === "string" ? m.image : undefined,
    tags: Array.isArray(m.tags) ? m.tags.filter((t): t is string => typeof t === "string") : undefined,
    links: m.links && typeof m.links === "object" ? (m.links as HearthDetails["links"]) : undefined,
  };
}
