import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { neonHost } from "../../../scripts/lib/copy-options.mjs";

// One-time copy of every Sparkz table from the old Supabase project to Neon, run INSIDE
// Vercel from /admin/move (Zaal, 14 Nov 2026: "can we do it an easier way, i dont like this
// way of secrets"). The live app already holds the Supabase keys, the Neon URL and Blob
// access, so nobody handles a secret. Same rules as scripts/copy-supabase-to-neon.mjs:
//   - Supabase is only READ;
//   - every row keeps its id and is inserted ON CONFLICT ("id") DO NOTHING, so a re-run
//     never overwrites; parents go first, so every foreign key resolves;
//   - dry run unless apply is true; the target must be on Neon (*.neon.tech);
//   - it stops before writing if Neon already holds a Hearth slug under a different id
//     (the seed ran first).
// Remove this file, its route and its page once the move is done.

export const COPY_TABLES = [
  "hearths",
  "hearth_backers",
  "signals",
  "signal_drafts",
  "meme_receipts",
  "hearth_spokes",
  "team_signups",
  "waitlist",
] as const;

const PAGE = 500;
const STORAGE_MARK = "/storage/v1/object/public/";

type Row = Record<string, unknown>;

export interface CopyReport {
  mode: "dry-run" | "apply";
  target: string | null;
  tables: { table: string; read: number; inserted: number | null }[];
  images: { found: number; moved: number } | null;
  stopped: string | null;
  errors: string[];
}

/** Every Supabase Storage public URL inside a JSON value. */
export function storageUrls(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof value === "string") {
    if (value.includes(STORAGE_MARK)) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => storageUrls(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => storageUrls(v, out));
  }
  return out;
}

/** The same JSON value with each mapped URL swapped for its new one. */
export function replaceUrls(value: unknown, map: ReadonlyMap<string, string>): unknown {
  if (typeof value === "string") return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replaceUrls(v, map));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceUrls(v, map)]));
  }
  return value;
}

const IDENT = /^[a-z_][a-z0-9_]*$/;

/** The INSERT for one row. Objects are JSON-encoded (every such column is jsonb). */
export function insertStatement(table: string, row: Row): { text: string; params: unknown[] } {
  const cols = Object.keys(row);
  for (const c of [table, ...cols]) if (!IDENT.test(c)) throw new Error(`bad identifier ${c}`);
  const text =
    `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) ` +
    `VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}) ON CONFLICT ("id") DO NOTHING RETURNING "id"`;
  const params = cols.map((c) => {
    const v = row[c];
    return v !== null && typeof v === "object" ? JSON.stringify(v) : v;
  });
  return { text, params };
}

/** Hearth slugs on Neon held under a different id than on Supabase. */
export function slugClashes(source: Row[], onNeon: Row[]): string[] {
  const neonIdBySlug = new Map(onNeon.map((r) => [r.slug, r.id]));
  return source.filter((r) => neonIdBySlug.has(r.slug) && neonIdBySlug.get(r.slug) !== r.id).map((r) => String(r.slug));
}

async function readAll(supabase: SupabaseClient, table: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`read ${table}: ${error.message}`);
    rows.push(...(data as Row[]));
    if (data.length < PAGE) return rows;
  }
}

async function moveImage(url: string): Promise<string> {
  const path = url.slice(url.indexOf(STORAGE_MARK) + STORAGE_MARK.length); // bucket/key
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${path}: HTTP ${res.status}`);
  const blob = await put(path, await res.arrayBuffer(), {
    access: "public",
    contentType: res.headers.get("content-type") ?? undefined,
    addRandomSuffix: false,
    allowOverwrite: true, // a re-run uploads the same bytes to the same path
  });
  return blob.url;
}

/** What the copy needs from the outside world; real ones below, fakes in tests. */
export interface CopyDeps {
  readTable: (table: string) => Promise<Row[]>;
  neonQuery: (text: string, params?: unknown[]) => Promise<Row[]>;
  moveImage: (url: string) => Promise<string>;
}

/**
 * Two phases (seat-misc, #380): READ every table and run every check first; only when that
 * phase is clean, and apply is true, WRITE. A failed read, a slug clash or a missing key
 * returns before the first insert or Blob upload, so a real copy can never half-run on a
 * dry run that would have failed. The page's "copy for real" lock is a second wall.
 */
export async function runCopy(opts: { apply: boolean; withImages: boolean }, target: string, deps: CopyDeps): Promise<CopyReport> {
  const report: CopyReport = {
    mode: opts.apply ? "apply" : "dry-run",
    target,
    tables: [],
    images: null,
    stopped: null,
    errors: [],
  };

  // Phase 1: read everything, check everything. Writes nothing.
  const data = new Map<string, Row[]>();
  for (const table of COPY_TABLES) {
    try {
      data.set(table, await deps.readTable(table));
    } catch (err) {
      report.errors.push((err as Error).message);
    }
  }
  const hearths = data.get("hearths");
  if (hearths) {
    const clashes = slugClashes(hearths, await deps.neonQuery(`SELECT "id", "slug" FROM "hearths"`));
    if (clashes.length) {
      report.stopped =
        `${clashes.length} Hearth slug(s) are already on Neon under a different id (${clashes.join(", ")}): ` +
        "the seed ran before the copy. Nothing was written.";
    }
  }
  const urls = new Set<string>();
  if (opts.withImages && hearths) {
    hearths.forEach((r) => {
      storageUrls(r.metadata, urls);
      storageUrls(r.economic_config, urls);
    });
    report.images = { found: urls.size, moved: 0 };
  }
  for (const table of COPY_TABLES) {
    const rows = data.get(table);
    if (rows) report.tables.push({ table, read: rows.length, inserted: null });
  }
  if (report.errors.length && !report.stopped) {
    report.stopped = `${report.errors.length} table(s) could not be read. Nothing was written.`;
  }
  if (!opts.apply || report.stopped) return report;

  // Phase 2: write. Only reached when every read and check above was clean.
  let rowsByTable = data;
  if (opts.withImages && urls.size) {
    const map = new Map<string, string>();
    for (const url of urls) {
      try {
        map.set(url, await deps.moveImage(url));
      } catch (err) {
        report.errors.push(`picture kept on Supabase: ${(err as Error).message}`);
      }
    }
    report.images = { found: urls.size, moved: map.size };
    rowsByTable = new Map(data);
    rowsByTable.set(
      "hearths",
      (data.get("hearths") ?? []).map((r) => ({ ...r, metadata: replaceUrls(r.metadata, map), economic_config: replaceUrls(r.economic_config, map) })),
    );
  }
  report.tables = [];
  for (const table of COPY_TABLES) {
    const rows = rowsByTable.get(table) ?? [];
    let inserted = 0;
    try {
      for (const row of rows) {
        const { text, params } = insertStatement(table, row);
        inserted += (await deps.neonQuery(text, params)).length;
      }
    } catch (err) {
      report.errors.push(`insert ${table}: ${(err as Error).message}`);
    }
    report.tables.push({ table, read: rows.length, inserted });
  }
  return report;
}

export async function copySupabaseToNeon(opts: { apply: boolean; withImages: boolean }): Promise<CopyReport> {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const neonUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.STORAGE_DATABASE_URL;
  const target = neonHost(neonUrl);
  const empty: CopyReport = { mode: opts.apply ? "apply" : "dry-run", target, tables: [], images: null, stopped: null, errors: [] };
  if (!supaUrl || !supaKey) {
    return { ...empty, stopped: "The Supabase keys are not set in this deployment (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)." };
  }
  if (!neonUrl || !target) {
    return { ...empty, stopped: "The Neon database URL is missing or not on *.neon.tech (DATABASE_URL_UNPOOLED / DATABASE_URL)." };
  }
  const supabase = createClient(supaUrl, supaKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const sql = neon(neonUrl);
  return runCopy(opts, target, {
    readTable: (table) => readAll(supabase, table),
    neonQuery: async (text, params) => (await sql.query(text, params ?? [])) as Row[],
    moveImage,
  });
}
