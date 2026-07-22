import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule, CapsuleBacker, MemeReceipt } from "@/lib/supabase/types";
import type { OssCapsuleMetadata } from "@/lib/brand-audit/types";
import BoostForm from "@/app/_components/BoostForm";
import ShareButton from "@/app/_components/ShareButton";
import Flame from "@/app/_components/Flame";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("capsules")
      .select("name, bio")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      const c = data as Pick<Capsule, "name" | "bio">;
      const desc = c.bio ?? "A Sparkz Capsule - back the work, not a coin.";
      return {
        title: c.name,
        description: desc,
        openGraph: { title: `${c.name} - Sparkz`, description: desc, type: "website" },
      };
    }
  } catch {
    // fall through to default
  }
  return { title: "Capsule" };
}

interface CapsuleView {
  capsule: Capsule;
  receipts: MemeReceipt[];
  backers: CapsuleBacker[];
  boostCount: number;
}

async function load(slug: string): Promise<CapsuleView | null> {
  const supabase = getServiceClient();
  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!capsule) return null;

  const c = capsule as Capsule;
  const [{ data: receipts }, { data: backers }] = await Promise.all([
    supabase
      .from("meme_receipts")
      .select("*")
      .eq("capsule_id", c.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("capsule_backers")
      .select("*")
      .eq("capsule_id", c.id)
      .order("created_at", { ascending: false }),
  ]);

  const backersList = (backers as CapsuleBacker[]) ?? [];
  return {
    capsule: c,
    receipts: (receipts as MemeReceipt[]) ?? [],
    backers: backersList,
    boostCount: backersList.filter((b) => b.kind === "boost").length,
  };
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass p-3 text-center sm:text-left">
      <div className="stat-num spark-text text-2xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const view = await load(slug);
  if (!view) notFound();

  const { capsule, receipts, backers, boostCount } = view;
  const oss = capsule.type === "oss" ? (capsule.metadata as OssCapsuleMetadata) : null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        &larr; Capsules
      </Link>

      <header className="mt-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 shrink-0" />
            <h1 className="text-2xl font-semibold tracking-tight">{capsule.name}</h1>
            <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
              {capsule.type}
            </span>
            <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
              {capsule.status}
            </span>
          </div>
          <ShareButton
            path={`/c/${capsule.slug}`}
            text={`Backing ${capsule.name} on Sparkz - a spark, not a coin.`}
            className="shrink-0"
          />
        </div>
        {capsule.bio && <p className="mt-2 text-sm text-muted">{capsule.bio}</p>}
        {oss && (
          <a
            href={oss.repo_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            {oss.repo_owner}/{oss.repo_name} -&gt;
          </a>
        )}
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="Backers" value={backers.length} />
        <Stat label="Boosts" value={boostCount} />
        <Stat label="Receipts" value={receipts.length} />
      </div>

      {/* Boost engine: free public support signal (not a payment). */}
      <section className="glass mb-8 p-4">
        <h2 className="mb-1 text-sm font-medium">Boost {capsule.name}</h2>
        <p className="mb-3 text-xs text-muted">
          Back the work with a free boost. Dollar backing opens with fiat/BYOK soon.
        </p>
        <BoostForm capsuleId={capsule.id} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium">Meme Receipts</h2>
        {receipts.length === 0 ? (
          <p className="text-sm text-muted">No published receipts yet.</p>
        ) : (
          <ul className="space-y-2">
            {receipts.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-border bg-card p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {r.id.slice(0, 8)}
                  </span>
                  <span className="text-muted">
                    reach {r.reach} - refs {r.referrals} - backing{" "}
                    {r.backing_generated}
                  </span>
                </div>
                {r.why_it_matched && (
                  <p className="mt-1 text-muted">why: {r.why_it_matched}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Backers</h2>
        {backers.length === 0 ? (
          <p className="text-sm text-muted">No backers yet.</p>
        ) : (
          <ul className="space-y-2">
            {backers.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-xs"
              >
                <span>
                  {b.kind} - {b.backer_kind}:{b.backer_id}
                </span>
                <span className="text-muted">
                  {b.amount_or_qty} {b.unit ?? ""} - {b.provider}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
