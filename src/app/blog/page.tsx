import Link from "next/link";
import Flame from "@/app/_components/Flame";
import { listArticles } from "@/lib/articles";

export const dynamic = "force-static";

export const metadata = {
  title: "Blog",
  description: "Short pieces on the thesis and the stack - the Capsule, Farcaster, and the graduation rail.",
  openGraph: {
    title: "Sparkz Blog",
    description: "The thesis and the stack.",
    images: [{ url: "/api/og?title=Blog&subtitle=The%20thesis%20and%20the%20stack.", width: 1200, height: 800 }],
  },
};

export default function BlogIndex() {
  const articles = listArticles();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        <Flame className="h-7 w-7 flame-live" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-sm text-muted">The thesis and the stack.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="glass glass-hover block p-5">
              <div className="text-lg font-semibold tracking-tight">{a.title}</div>
              {a.subtitle && <p className="mt-1 text-sm text-muted">{a.subtitle}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{a.date}</span>
                {a.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full border border-border px-2 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
