import { BOOSTR_TRIGGER_WORDS, BOOSTR_URL, type BoostrStats } from "@/lib/boostr";
import { httpsHref } from "@/lib/safe-href";

// "Turn on ZAO auto-likes" (Zaal, 19 Nov 2026: the Zoostr Hearth's main ask). A link into
// the Boostr mini app, the trigger words, and live totals plus the crew when Boostr's API
// answered. When it did not, only the button shows: never a zero or a stale number.
export default function BoostrPanel({ stats }: { stats: BoostrStats | null }) {
  return (
    <section className="glass mb-8 p-4">
      <h2 className="mb-1 text-sm font-medium">Turn on ZAO auto-likes</h2>
      <p className="mb-3 text-xs text-muted">
        Switch it on once in Boostr, and it likes casts that say{" "}
        {BOOSTR_TRIGGER_WORDS.map((w, i) => (
          <span key={w}>
            <span className="font-mono text-foreground">{w}</span>
            {i < BOOSTR_TRIGGER_WORDS.length - 1 ? ", " : ""}
          </span>
        ))}
        .
      </p>
      <a
        href={BOOSTR_URL}
        target="_blank"
        rel="noreferrer"
        className="btn-spark inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-semibold"
      >
        Turn on auto-likes
      </a>

      {stats && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="likes given" value={stats.totalLikesGenerated} />
            <Stat label="casts liked" value={stats.totalCastsLiked} />
            <Stat label="active crew" value={stats.activeContributors} />
          </div>
          {stats.crew.length > 0 && (
            <ol className="mt-4 space-y-1.5 text-sm">
              {stats.crew.map((c, i) => (
                <li key={c.fid} className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs text-muted">{i + 1}</span>
                  {httpsHref(c.pfp) ? (
                    <span
                      className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${httpsHref(c.pfp)})` }}
                    />
                  ) : (
                    <span className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
                  )}
                  <span className="min-w-0 flex-1 truncate">@{c.username}</span>
                  <span className="shrink-0 text-xs text-muted">{c.likes.toLocaleString()} likes</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      <p className="mt-4 text-[11px] text-muted">
        Auto-likes by{" "}
        <a href={BOOSTR_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">
          Boostr
        </a>
        , built by cashlessman.eth. Totals cover all five words together.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <div className="stat-num text-lg font-semibold">{value.toLocaleString()}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
