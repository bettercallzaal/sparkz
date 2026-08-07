// A static, illustrative Capsule card for the landing hero. NOT live data - it is a
// product preview (like an app-store screenshot) so a first-time visitor immediately
// sees what a Sparkz Capsule is: identity, backers, boosts, receipts, a boost action.
// Kept purely presentational; the real thing lives at /c/[slug].
export default function HeroCapsulePreview() {
  return (
    <div className="relative w-full max-w-sm" aria-hidden>
      {/* soft gold glow behind the card */}
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(232,198,106,0.35), transparent 70%)",
        }}
      />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_-32px_rgba(232,198,106,0.4)]">
        {/* label so it reads as a preview, never as real activity */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            A Capsule
          </span>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            preview
          </span>
        </div>

        {/* identity */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-background"
            style={{ background: "linear-gradient(135deg, #ffd700, #b8860b)" }}
          >
            M
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Midnight Sessions</span>
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                spark
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">
              Late-night beats, backed by the people who listen.
            </p>
          </div>
        </div>

        {/* the numbers that compound */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { n: "128", l: "backers" },
            { n: "342", l: "boosts" },
            { n: "17", l: "receipts" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border/70 bg-background/40 py-2">
              <div className="spark-text text-lg font-bold leading-none">{s.n}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">{s.l}</div>
            </div>
          ))}
        </div>

        {/* latest receipt line */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-background/40 px-3 py-2">
          <Flame />
          <span className="min-w-0 flex-1 truncate text-xs text-muted">
            Receipt #17 - &ldquo;first 100 backers&rdquo; minted
          </span>
          <span className="text-[10px] uppercase tracking-wide text-accent">on-chain</span>
        </div>

        {/* the action */}
        <div className="mt-4 flex items-center gap-2">
          <div className="btn-spark flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold">
            Boost
          </div>
          <div className="rounded-lg border border-border px-4 py-2 text-sm text-muted">
            Collect
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">No wallet. No coin. Just backing.</p>
      </div>
    </div>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <path
        d="M12 3c1 3-1 4-2 6-1 1.8-.4 4 1.6 4.6 1.8.5 3.4-.7 3.4-2.6 0-1-.3-1.7-.6-2.4 1.7 1 2.8 2.7 2.8 4.6A5.6 5.6 0 0 1 12 21a5.6 5.6 0 0 1-5.6-5.6c0-4 3.4-5.6 5.6-12.4Z"
        fill="var(--accent)"
      />
    </svg>
  );
}
