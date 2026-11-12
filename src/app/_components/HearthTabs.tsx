"use client";

import { useSyncExternalStore, type ReactNode } from "react";

// Segmented control for the lower half of a Hearth page: one section visible at a
// time instead of one long scroll. Pattern credit (design brief D2): Partiful's event
// page keeps comments, photos and guests on one page; Bandcamp's filtered collection
// views. A Sparks tab joins these once Sparks exist as their own object.
//
// Every pane is rendered on the server and the inactive ones only get `hidden`, so
// the content is still in the HTML. The chosen tab lives in the URL hash
// (#tab-receipts), which survives a reload and can be linked to. The hash names do
// not match any element id, so choosing a tab never scrolls the page.
export type HearthPane = { id: string; label: string; count?: number; content: ReactNode };

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

// The last tab chosen on this page. Other hashes (the action row's Boost link is
// #boost) must not reset the tabs to the first one, so a hash that is not a
// #tab- value keeps whatever was chosen before. Keyed by path so a different
// Hearth starts on its first tab.
let last = { path: "", tab: "" };

function readTab() {
  const { hash, pathname } = window.location;
  if (hash.startsWith("#tab-")) last = { path: pathname, tab: hash.slice(5) };
  return last.path === pathname ? last.tab : "";
}
const serverTab = () => "";

export default function HearthTabs({ panes }: { panes: HearthPane[] }) {
  const chosen = useSyncExternalStore(subscribe, readTab, serverTab);
  const active = panes.some((p) => p.id === chosen) ? chosen : panes[0]?.id;

  if (panes.length === 0) return null;

  const choose = (id: string) => {
    if (id === active) return;
    history.replaceState(null, "", `#tab-${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Hearth sections"
        className="mb-4 flex gap-1 rounded-xl border border-border bg-card p-1"
      >
        {panes.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`hearth-tab-${p.id}`}
              aria-selected={on}
              aria-controls={`hearth-pane-${p.id}`}
              onClick={() => choose(p.id)}
              className={`min-h-11 flex-1 rounded-lg px-2 text-sm transition-colors active:opacity-70 ${
                on ? "bg-background font-medium text-foreground" : "text-muted"
              }`}
            >
              {p.label}
              {typeof p.count === "number" && (
                <span className="ml-1 text-xs text-muted">{p.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {panes.map((p) => (
        <div
          key={p.id}
          role="tabpanel"
          id={`hearth-pane-${p.id}`}
          aria-labelledby={`hearth-tab-${p.id}`}
          hidden={p.id !== active}
        >
          {p.content}
        </div>
      ))}
    </div>
  );
}
