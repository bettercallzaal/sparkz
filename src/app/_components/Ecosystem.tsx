import Link from "next/link";
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
                <Link
                  href={`/c/${c.slug}`}
                  className="block h-full rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {c.status}
                    </span>
                  </div>
                  {c.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{c.bio}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
