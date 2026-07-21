import Link from "next/link";
import { getServiceClient } from "@/lib/supabase/server";
import type { Capsule } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

async function loadCapsules(): Promise<{ capsules: Capsule[]; error: string | null }> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { capsules: (data as Capsule[]) ?? [], error: null };
  } catch (err) {
    return { capsules: [], error: err instanceof Error ? err.message : "unknown" };
  }
}

const TYPE_LABEL: Record<string, string> = {
  creator: "CREATOR",
  culture: "CULTURE",
  oss: "OSS REPO",
  meme: "MEME",
};

export default async function Home() {
  const { capsules, error } = await loadCapsules();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Sparkz</h1>
        <p className="mt-1 text-sm text-muted">
          Every project is a Capsule, not a coin. Back the album, not buy a coin.
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Capsules
        </h2>
        <div className="flex gap-2">
          <Link
            href="/audit"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent"
          >
            Brand Audit
          </Link>
          <Link
            href="/admin"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white"
          >
            Open Meme Engine
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
          Database not connected yet. Set{" "}
          <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
          <code className="text-foreground">.env.local</code>, apply the migration,
          then seed Zoostr.
        </div>
      )}

      {!error && capsules.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
          No Capsules yet. Seed Zoostr with{" "}
          <code className="text-foreground">npm run seed:zoostr</code>.
        </div>
      )}

      <ul className="space-y-3">
        {capsules.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin?capsule=${c.id}`}
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.name}</span>
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted">
                  {TYPE_LABEL[c.type] ?? c.type.toUpperCase()}
                </span>
              </div>
              {c.bio && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{c.bio}</p>
              )}
              <p className="mt-2 text-xs text-muted">
                {c.slug} - {c.status}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
