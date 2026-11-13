"use client";

import { setViewAs, useViewer, VIEW_AS_LABELS, type ViewAs } from "@/lib/view-as";

// The "viewing as X" bar. Shown on every page while an admin is viewing as someone
// else, with a one-tap exit. Renders nothing otherwise. UI only: see lib/view-as.ts.
export function ViewAsBar() {
  const { viewAs, realAdmin } = useViewer();
  if (!realAdmin || viewAs === "self") return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex min-h-11 items-center justify-between gap-3 bg-accent px-4 text-sm font-medium text-black"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <span>
        Viewing as {VIEW_AS_LABELS[viewAs]}. Your actions still run as you.
      </span>
      <button
        type="button"
        onClick={() => setViewAs("self")}
        className="min-h-11 shrink-0 rounded-md px-3 underline active:opacity-70"
      >
        Exit
      </button>
    </div>
  );
}

const ORDER: ViewAs[] = ["self", "member", "user", "guest"];

// The switcher, for the Me page. Visible only to a real admin session, even while
// viewing as Guest, so the way back is always there.
export function ViewAsSwitcher() {
  const { viewAs, realAdmin } = useViewer();
  if (!realAdmin) return null;
  return (
    <section className="glass mt-6 p-2">
      <h2 className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-accent">
        View as
      </h2>
      <p className="px-3 pb-2 text-xs text-muted">
        See Sparkz the way someone else does. Changes what you see only; nothing you do
        runs as them.
      </p>
      <div className="grid grid-cols-2 gap-2 px-1 pb-1">
        {ORDER.map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={viewAs === mode}
            onClick={() => setViewAs(mode)}
            className={`min-h-11 rounded-lg border px-3 text-sm active:opacity-70 ${
              viewAs === mode
                ? "border-accent bg-accent/15 text-foreground"
                : "border-border text-muted"
            }`}
          >
            {VIEW_AS_LABELS[mode]}
          </button>
        ))}
      </div>
    </section>
  );
}
