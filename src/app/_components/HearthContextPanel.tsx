import {
  STAGE_LABEL,
  hasContext,
  type HearthContext,
  type Stage,
} from "@/lib/hearth-context";

export function StagePill({ stage }: { stage: Stage }) {
  return (
    <span className="shrink-0 rounded-full border border-accent/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
      {STAGE_LABEL[stage]}
    </span>
  );
}

// "Where it is" on a Hearth page: the stage, what is done, and what it needs help with.
// Renders nothing until the owner fills one of them in on the Manage page.
export default function HearthContextPanel({
  context,
}: {
  context: HearthContext;
}) {
  if (!hasContext(context)) return null;
  return (
    <section className="glass mb-8 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Where it is</h2>
        {context.stage && <StagePill stage={context.stage} />}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {context.needs.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Needs help with
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {context.needs.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
        {context.done.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Done so far
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
              {context.done.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
