import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule, CapsuleBacker, MemeReceipt } from "@/lib/supabase/types";
import type { OssCapsuleMetadata } from "@/lib/brand-audit/types";
import BoostForm from "@/app/_components/BoostForm";
import Avatar from "@/app/_components/Avatar";
import CopyButton from "@/app/_components/CopyButton";
import OwnerBadge from "@/app/_components/OwnerBadge";
import GraduationPanel from "@/app/_components/GraduationPanel";
import { maskBacker } from "@/lib/sanitize";
import ShareButton from "@/app/_components/ShareButton";
import Flame from "@/app/_components/Flame";
import SparkLit from "@/app/_components/SparkLit";

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
      const image = `https://trysparkz.com/api/og?slug=${encodeURIComponent(slug)}`;
      const embed = JSON.stringify({
        version: "1",
        imageUrl: image,
        button: {
          title: `Open ${c.name}`,
          action: {
            type: "launch_miniapp",
            name: "Sparkz",
            url: `https://trysparkz.com/c/${slug}`,
            splashImageUrl: "https://trysparkz.com/api/icon",
            splashBackgroundColor: "#0a0a0a",
          },
        },
      });
      return {
        title: c.name,
        description: desc,
        openGraph: {
          title: `${c.name} - Sparkz`,
          description: desc,
          type: "website",
          images: [{ url: image, width: 1200, height: 800 }],
        },
        twitter: { card: "summary_large_image", title: `${c.name} - Sparkz`, description: desc, images: [image] },
        other: { "fc:miniapp": embed, "fc:frame": embed },
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

function IntegrationCard({
  label,
  sub,
  value,
  connected,
  href,
}: {
  label: string;
  sub: string;
  value: string;
  connected: boolean;
  href?: string;
}) {
  const inner = (
    <div className={`glass glass-hover h-full p-3 ${connected ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-zinc-600"}`}
        />
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">{sub}</div>
      <div
        className={`mt-2 truncate font-mono text-xs ${connected ? "text-foreground" : "text-muted"}`}
      >
        {value}
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {inner}
    </a>
  ) : (
    inner
  );
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
  const fc = (capsule.metadata as { farcaster?: { fid?: number | null; username?: string | null; channel?: string | null } }).farcaster;
  const econ = (capsule.economic_config ?? {}) as {
    empire_address?: string | null;
    empire_id?: string | null;
    token_address?: string | null;
    agent?: string | null;
  };
  const emailCount = new Set(
    backers.filter((b) => b.backer_id.includes("@")).map((b) => b.backer_id),
  ).size;
  const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
  const meta = capsule.metadata as {
    image?: string;
    review?: string;
    about?: string;
    tags?: string[];
    links?: {
      website?: string;
      github?: string;
      docs?: string;
      x?: string;
      farcaster?: string;
      discord?: string;
    };
  };
  const image = meta.image ?? null;
  const pending = meta.review === "pending";
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const links = meta.links ?? {};
  const linkRow: { label: string; href: string }[] = [
    links.website ? { label: "Website", href: links.website } : null,
    links.github ? { label: "GitHub", href: links.github } : null,
    links.docs ? { label: "Docs", href: links.docs } : null,
    links.x ? { label: "X", href: links.x } : null,
    links.farcaster ? { label: "Farcaster", href: links.farcaster } : null,
    links.discord ? { label: "Discord", href: links.discord } : null,
  ].filter((l): l is { label: string; href: string } => l !== null);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <SparkLit />
      <Link href="/explore" className="text-sm text-muted hover:text-foreground">
        &larr; Explore
      </Link>

      {pending && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent-3/40 bg-accent-3/10 p-3 text-sm">
          <Flame className="h-5 w-5 shrink-0" />
          <span>
            This spark is <span className="font-semibold">pending review</span>. It is
            live for you to share, but stays out of Explore until an operator approves it.
          </span>
        </div>
      )}

      <header className="mb-6 mt-4">
        <div className="flex items-start gap-4">
          <Avatar name={capsule.name} image={image} className="h-16 w-16 text-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{capsule.name}</h1>
              <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                {capsule.type}
              </span>
              <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                {capsule.status}
              </span>
              <OwnerBadge ownerFid={capsule.owner_fid} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyButton
              value={`https://trysparkz.com/c/${capsule.slug}`}
              label="Capsule link copied"
              className="h-8 w-8"
            />
            <ShareButton
              path={`/c/${capsule.slug}`}
              text={`Backing ${capsule.name} on Sparkz - a spark, not a coin.`}
              channel={fc?.channel ?? undefined}
            />
          </div>
        </div>
        {capsule.bio && <p className="mt-3 text-sm text-muted">{capsule.bio}</p>}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
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
        {fc && (fc.username || fc.channel || fc.fid) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {fc.username && (
              <a
                href={`https://farcaster.xyz/${fc.username}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent hover:border-accent"
              >
                @{fc.username}
              </a>
            )}
            {fc.channel && (
              <a
                href={`https://farcaster.xyz/~/channel/${fc.channel}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent hover:border-accent"
              >
                /{fc.channel}
              </a>
            )}
            {fc.fid && !fc.username && (
              <span className="rounded-full border border-border px-2 py-0.5 text-muted">
                fid {fc.fid}
              </span>
            )}
          </div>
        )}
        {linkRow.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {linkRow.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-accent hover:text-foreground"
              >
                {l.label} -&gt;
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="Backers" value={backers.length} />
        <Stat label="Boosts" value={boostCount} />
        <Stat label="Receipts" value={receipts.length} />
      </div>

      {meta.about && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium">About</h2>
          <div className="card-solid p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
              {meta.about}
            </p>
          </div>
        </section>
      )}

      {/* Integrations - the Spark as a hub. Connected first, available ones dimmed. */}
      {(() => {
        const integrations = [
          {
            label: "Farcaster",
            sub: "Distribution",
            connected: Boolean(fc?.channel || fc?.username || fc?.fid),
            value: fc?.channel ? `/${fc.channel}` : fc?.username ? `@${fc.username}` : fc?.fid ? `fid ${fc.fid}` : "not linked",
            href: fc?.channel ? `https://farcaster.xyz/~/channel/${fc.channel}` : fc?.username ? `https://farcaster.xyz/${fc.username}` : undefined,
          },
          {
            label: "Treasury",
            sub: "Empire Builder",
            connected: Boolean(econ.empire_address || econ.empire_id),
            value: econ.empire_address ? short(econ.empire_address) : econ.empire_id ? "linked" : "not deployed",
            href: econ.empire_id ? `https://www.empirebuilder.world/empire/${econ.empire_id}` : undefined,
          },
          {
            label: "Email list",
            sub: "Community",
            connected: emailCount > 0,
            value: `${emailCount} on list`,
          },
          {
            label: "Token",
            sub: "Clanker",
            connected: Boolean(econ.token_address),
            value: econ.token_address ? short(econ.token_address) : "spark (no coin)",
          },
          {
            label: "Agent",
            sub: "ElizaOS",
            connected: Boolean(econ.agent),
            value: econ.agent ? "configured" : "scaffold",
          },
          { label: "Bounties", sub: "POIDH", connected: false, value: "soon" },
        ].sort((a, b) => Number(b.connected) - Number(a.connected));
        const liveCount = integrations.filter((i) => i.connected).length;
        return (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Integrations</h2>
              <span className="text-xs text-muted">{liveCount} live</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {integrations.map((i) => (
                <IntegrationCard key={i.label} {...i} />
              ))}
            </div>
          </section>
        );
      })()}

      {/* Boost engine: free public support signal (not a payment). */}
      <section className="glass mb-8 p-4">
        <h2 className="mb-1 text-sm font-medium">Boost {capsule.name}</h2>
        <p className="mb-3 text-xs text-muted">
          Back the work with a free boost. Dollar backing opens with fiat/BYOK soon.
        </p>
        <BoostForm capsuleId={capsule.id} />
      </section>

      {capsule.status === "spark" && <GraduationPanel />}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium">Meme Receipts</h2>
        {receipts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">
            No receipts yet. When a moment lands, the Meme Engine writes one here - the
            proof of what it matched and what it earned.
          </p>
        ) : (
          <ul className="space-y-2">
            {receipts.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-2/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent-2">
                    Meme Receipt
                  </span>
                  {r.published_at && (
                    <span className="text-xs text-muted">
                      {new Date(r.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {r.why_it_matched && (
                  <p className="mt-2 text-sm leading-relaxed">{r.why_it_matched}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  <span>
                    <span className="spark-text stat-num font-semibold">{r.reach}</span> reach
                  </span>
                  <span>
                    <span className="spark-text stat-num font-semibold">{r.referrals}</span> referrals
                  </span>
                  <span>
                    <span className="spark-text stat-num font-semibold">{r.backing_generated}</span> backing
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Backers</h2>
        {backers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">
            No backers yet. Be the first - boost above, no wallet or coin needed.
          </p>
        ) : (
          <ul className="space-y-2">
            {backers.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-3" />
                  {maskBacker(b.backer_id)}
                </span>
                <span className="text-xs uppercase tracking-wide text-muted">{b.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
