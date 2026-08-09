// A static schematic of what a Hearth IS - no live data, no invented numbers. It shows
// the three things a Hearth accumulates (identity, backers, receipts) as labeled
// structure, plus the two real actions (Boost / Collect). Honest by construction: it
// never claims metrics. The real, live Hearths are in the ecosystem section + at
// /c/[slug].
export default function HeroHearthPreview() {
  return (
    <div className="relative w-full max-w-sm" aria-hidden>
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(232,198,106,0.35), transparent 70%)",
        }}
      />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_-32px_rgba(232,198,106,0.4)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            A Hearth holds
          </span>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            not a coin
          </span>
        </div>

        {/* the three things a Hearth accumulates - labels, not numbers */}
        <div className="space-y-2.5">
          <Row title="Identity" desc="Your project's home - name, story, links." />
          <Row title="Backers" desc="The people in your corner. No wallet needed." />
          <Row title="Receipts" desc="Proof of what your work earned, on-chain." />
        </div>

        {/* the real actions */}
        <div className="mt-5 flex items-center gap-2">
          <div className="btn-spark flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold">
            Boost
          </div>
          <div className="rounded-lg border border-border px-4 py-2 text-sm text-muted">
            Collect
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">
          No wallet. No coin. Just backing.
        </p>
      </div>
    </div>
  );
}

function Row({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: "linear-gradient(135deg, #ffd700, #b8860b)" }}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
    </div>
  );
}
