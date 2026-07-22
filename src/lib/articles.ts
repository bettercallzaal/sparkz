import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Articles live as markdown in content/articles (also the blog source). We read them
// at build time and render a small, known subset (headings, lists, hr, bold/italic,
// code, links) to HTML - zero markdown dependency, because the content is ours and
// the app stays lean.

const DIR = join(process.cwd(), "content", "articles");

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  author: string;
  html: string;
}

export function listArticles(): Article[] {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md");
  return files
    .map((f) => parseArticle(f.replace(/\.md$/, ""), readFileSync(join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | null {
  try {
    return parseArticle(slug, readFileSync(join(DIR, `${slug}.md`), "utf8"));
  } catch {
    return null;
  }
}

function parseArticle(slug: string, raw: string): Article {
  const { meta, body } = splitFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    subtitle: meta.subtitle ?? "",
    date: meta.date ?? "",
    author: meta.author ?? "Sparkz",
    tags: parseList(meta.tags),
    html: renderMarkdown(body),
  };
}

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}

function parseList(v?: string): string[] {
  if (!v) return [];
  return v
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Inline: code, links, bold, italic. Input is already HTML-escaped.
function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((i) => `<li>${inline(i)}</li>`).join("");
      out.push(`<${list.type}>${items}</${list.type}>`);
      list = null;
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushPara();
      flushList();
      continue;
    }
    const heading = t.match(/^(#{1,4})\s+(.*)$/);
    const ul = t.match(/^[-*]\s+(.*)$/);
    const ol = t.match(/^\d+\.\s+(.*)$/);

    if (heading) {
      flushPara();
      flushList();
      const level = Math.min(heading[1].length + 1, 6); // '#' -> h2
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (t === "---") {
      flushPara();
      flushList();
      out.push("<hr />");
    } else if (ul) {
      flushPara();
      if (list?.type !== "ul") flushList();
      list ??= { type: "ul", items: [] };
      list.items.push(ul[1]);
    } else if (ol) {
      flushPara();
      if (list?.type !== "ol") flushList();
      list ??= { type: "ol", items: [] };
      list.items.push(ol[1]);
    } else {
      flushList();
      para.push(t);
    }
  }
  flushPara();
  flushList();
  return out.join("\n");
}
