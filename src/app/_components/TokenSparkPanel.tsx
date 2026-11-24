import {
  buildTokenSparkRows,
  clankerUrl,
  readTokenSparkChain,
  type RowSource,
  type TokenSparkMeta,
} from "@/lib/token-spark";

const SOURCE_LABEL: Record<RowSource, string> = {
  chain: "read from Base",
  planned: "planned",
  pending: "not read from chain yet",
};

// The token Spark on a Hearth page: the token as read on Base, a Clanker link, and how a
// Spark of any kind is activated. Server component; a failed read shows "not read from
// chain yet" for that part and never an error or a made-up number.
export default async function TokenSparkPanel({ meta }: { meta: TokenSparkMeta }) {
  let chain;
  try {
    chain = await readTokenSparkChain(meta);
  } catch (e) {
    console.error("token spark read failed", e instanceof Error ? e.message : "unknown");
    chain = { token: null, vault: null, rewards: null };
  }
  const rows = buildTokenSparkRows(meta, chain);

  return (
    <section id="token-spark" className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Token Spark</h2>
        <a
          href={clankerUrl(meta.token_address)}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted hover:text-accent"
        >
          View on Clanker -&gt;
        </a>
      </div>
      <div className="card-solid divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-muted">{r.label}</span>
            <span className="min-w-0 text-right">
              {r.href ? (
                <a href={r.href} target="_blank" rel="noreferrer" className="font-mono text-xs hover:text-accent">
                  {r.value}
                </a>
              ) : (
                <span className={r.source === "chain" ? "font-mono text-xs" : "text-xs text-muted"}>{r.value}</span>
              )}
              <span className="block text-[10px] uppercase tracking-wide text-muted">{SOURCE_LABEL[r.source]}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="glass mt-4 p-4">
        <h3 className="text-sm font-medium">How a Spark is activated</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>Every project starts as a Hearth with status spark.</li>
          <li>
            Its creator chooses a Spark kind when they decide to, and the choice is saved on the
            Hearth as <span className="font-mono text-xs">metadata.spark.kind</span>.
          </li>
          <li>The Hearth page then shows that kind&apos;s section, like this one for a token.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          Token is the first kind built. Any Hearth can activate any kind, an NFT drop, an event
          or something new, in whatever order its creator picks. This page leaves that open.
        </p>
      </div>
    </section>
  );
}
