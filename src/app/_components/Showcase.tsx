import Link from "next/link";
import Avatar from "./Avatar";
import type { Hearth, HearthType } from "@/lib/supabase/types";

const TYPE_LABEL: Record<HearthType, string> = {
  creator: "Creator",
  culture: "Culture",
  oss: "Open source",
  meme: "Meme",
};

// The Home page's showcase: the featured ZAO Hearths as large cards, each with one way
// in (open it) and one way to help (back it, which lands on the Hearth's Boost tab).
export default function Showcase({ featured, others }: { featured: Hearth[]; others: number }) {
  if (featured.length === 0) {
    return <p className="text-sm text-muted">Hearths are spinning up. Check back soon.</p>;
  }
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {featured.map((c) => (
          <li key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
            <Link href={`/c/${c.slug}`} className="flex items-center gap-3">
              <Avatar
                name={c.name}
                image={(c.metadata as { image?: string })?.image ?? null}
                className="h-12 w-12 text-lg"
              />
              <div className="min-w-0">
                <div className="text-lg font-semibold leading-tight">{c.name}</div>
                <div className="text-xs uppercase tracking-wide text-muted">
                  {TYPE_LABEL[c.type]}
                </div>
              </div>
            </Link>
            {c.bio && <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{c.bio}</p>}
            <div className="mt-4 flex gap-2">
              <Link href={`/c/${c.slug}`} className="btn-spark rounded-lg px-4 py-2 text-sm">
                Open
              </Link>
              <Link
                href={`/c/${c.slug}#boost`}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent"
              >
                Back it
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {others > 0 && (
        <p className="mt-4 text-sm">
          <Link href="/explore" className="text-accent hover:underline">
            See all {featured.length + others} Hearths -&gt;
          </Link>
        </p>
      )}
    </>
  );
}
