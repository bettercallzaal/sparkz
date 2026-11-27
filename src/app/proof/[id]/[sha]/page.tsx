import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReceipt, viewerUrl } from "@/lib/zao-mcp/proof";

// /proof/<id>/<sha256> - one contribution receipt, one exact revision. It reads the same
// bytes as open_contribution_proof in chat and /raw here; the digest is in the URL, so the
// link never moves to a newer record. A closed record is a 404.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contribution proof - Sparkz", robots: { index: false } };

export default async function ProofPage({ params }: { params: Promise<{ id: string; sha: string }> }) {
  const { id, sha } = await params;
  const found = getApprovedReceipt(id, sha);
  if (!found) notFound();
  const r = found.receipt;
  const fixture = r.label === "fixture proof";
  const rows: [string, string][] = [
    ["Record", r.id],
    ["Type", r.type],
    ["Hearth", r.hearth ?? "-"],
    ["Date", r.when ?? "-"],
    ["Evidence", r.evidence_status ?? "SOURCE_REPORTED"],
    ["Settlement", r.settlement ?? "NOT_EVALUATED"],
    ["Two-sided check", "NOT_CHECKED"],
    ["sha256", sha],
  ];
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      {fixture && (
        <p className="rounded-lg border border-accent/50 px-3 py-2 text-sm text-accent">
          Fixture proof: a sample record for testing. It is not a real contribution.
        </p>
      )}
      <header className="space-y-2">
        <h1 className="text-2xl font-medium">Contribution proof</h1>
        <p className="text-muted">{r.what ?? r.id}</p>
      </header>
      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="break-all font-mono">{v}</dd>
          </div>
        ))}
        {r.source?.url && (
          <div className="contents">
            <dt className="text-muted">Source</dt>
            <dd className="break-all">
              <a href={r.source.url} className="text-accent-3 hover:underline" rel="noopener noreferrer" target="_blank">
                {r.source.url}
              </a>
            </dd>
          </div>
        )}
      </dl>
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted">The exact receipt bytes</h2>
        <pre className="overflow-x-auto rounded-lg border border-white/10 p-3 text-xs">{found.bytes}</pre>
        <p className="text-xs text-muted">
          <Link href={`/proof/${id}/${sha}/raw`} className="text-accent-3 hover:underline">
            Raw bytes
          </Link>{" "}
          (sha256 of these bytes is the digest above). This page: {viewerUrl(id, sha)}
        </p>
      </section>
    </main>
  );
}
