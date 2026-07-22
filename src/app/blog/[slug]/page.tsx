import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, listArticles } from "@/lib/articles";

export const dynamic = "force-static";

export function generateStaticParams() {
  return listArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article" };
  const image = `https://trysparkz.com/api/og?title=${encodeURIComponent(a.title)}&subtitle=${encodeURIComponent(a.subtitle)}`;
  return {
    title: a.title,
    description: a.subtitle,
    openGraph: {
      title: a.title,
      description: a.subtitle,
      type: "article",
      images: [{ url: image, width: 1200, height: 800 }],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.subtitle, images: [image] },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/blog" className="text-xs text-muted hover:text-foreground">
        &lt;- Blog
      </Link>
      <header className="mt-4 mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {a.title}
        </h1>
        {a.subtitle && <p className="mt-3 text-lg text-muted">{a.subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{a.author}</span>
          <span className="opacity-40">-</span>
          <span>{a.date}</span>
          {a.tags.map((t) => (
            <span key={t} className="rounded-full border border-border px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </header>

      <article className="article" dangerouslySetInnerHTML={{ __html: a.html }} />

      <footer className="mt-12 border-t border-border pt-6">
        <Link href="/blog" className="btn-spark inline-block rounded-md px-4 py-2 text-sm">
          More articles
        </Link>
      </footer>
    </main>
  );
}
