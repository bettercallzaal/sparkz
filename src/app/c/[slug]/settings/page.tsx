import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import VisibilitySettings from "@/app/_components/VisibilitySettings";

export const dynamic = "force-dynamic";

// Owner settings for a Hearth: control which integrations show on the public page.
// Admin-gated at the API layer (the operator session); per-creator FID auth is next.
export default async function HearthSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("hearths")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <Link href={`/c/${data.slug}`} className="text-sm text-muted hover:text-foreground">
        &lt;- {data.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Manage integrations</h1>
      <p className="mt-2 text-sm text-muted">
        Choose which integrations show on {data.name}&apos;s public page. Toggle one to
        Hidden and it disappears from the Hearth; toggle it Visible to bring it back.
      </p>
      <div className="mt-6">
        <VisibilitySettings hearthId={data.id} slug={data.slug} name={data.name} />
      </div>
    </main>
  );
}
