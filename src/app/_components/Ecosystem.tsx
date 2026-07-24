import Avatar from "./Avatar";
import { appUrl } from "@/lib/origins";
import type { Capsule, CapsuleType } from "@/lib/supabase/types";

const TYPE_LABEL: Record<CapsuleType, string> = {
  creator: "Creators",
  culture: "Culture",
  oss: "Open source",
  meme: "Meme",
};
const TYPE_ORDER: CapsuleType[] = ["creator", "culture", "oss", "meme"];

export default function Ecosystem({ capsules }: { capsules: Capsule[] }) {
  if (capsules.length === 0) {
    return (
      <p className="text-sm text-muted">Capsules are spinning up. Check back soon.</p>
    );
  }
  const byType = (t: CapsuleType) => capsules.filter((c) => c.type === t);

  return (
    <div className="space-y-6">
      {TYPE_ORDER.filter((t) => byType(t).length > 0).map((t) => (
        <div key={t}>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted">
            {TYPE_LABEL[t]}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {byType(t).map((c) => (
              <li key={c.id}>
                <a
                  href={appUrl(`/c/${c.slug}`)}
                  className="flex h-full items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
                >
                  <Avatar
                    name={c.name}
                    image={(c.metadata as { image?: string })?.image ?? null}
                    className="h-9 w-9 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="shrink-0 rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        {c.status}
                      </span>
                    </div>
                    {c.bio && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{c.bio}</p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
