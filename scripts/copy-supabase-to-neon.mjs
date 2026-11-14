// Copy Sparkz data from the old Supabase project to the new Neon database (Zaal, 14 Nov
// 2026: "we can copy them because we wanna add lots more info and context about all zao
// projects"). Run it by hand, once, after the Database workflow has created the tables on
// Neon. It only READS from Supabase.
//
//   vercel env pull --environment=production .env.copy     (Supabase keys + the Neon DATABASE_URL_UNPOOLED)
//   node --env-file=.env.copy scripts/copy-supabase-to-neon.mjs                          (dry run: reads and counts)
//   node --env-file=.env.copy scripts/copy-supabase-to-neon.mjs --apply                  (copy rows)
//   node --env-file=.env.copy scripts/copy-supabase-to-neon.mjs --apply --with-images    (also move pictures to Blob)
//   rm .env.copy                                              (it holds production secrets)
//
// Safe to re-run: every row keeps its id and is inserted with ON CONFLICT (id) DO NOTHING,
// so a row already on Neon is never overwritten. Tables go parents first, so every
// foreign key resolves. Without --apply it is a dry run: it reads and counts, and writes
// nothing anywhere. It refuses to write to any host that is not Neon (*.neon.tech).
//
// --with-images: any Supabase Storage public URL found inside a Hearth's metadata or
// economic_config (pictures, logos) is downloaded, uploaded to the public Blob store
// sparkz-blob under the same path, and the copied row points at the Blob URL instead.
// Needs Blob credentials: BLOB_STORE_ID plus the short-lived VERCEL_OIDC_TOKEN that
// `vercel env pull` writes (sparkz-blob is connected over OIDC), or a BLOB_READ_WRITE_TOKEN.
// The OIDC token expires after some hours, so pull the env right before the run.

import { createClient } from "@supabase/supabase-js";
import { neon } from "@neondatabase/serverless";
import { blobAuth, copyTargetUrl, neonHost, parseCopyArgs } from "./lib/copy-options.mjs";

const { apply, withImages: WITH_IMAGES } = parseCopyArgs(process.argv.slice(2));
const DRY_RUN = !apply;

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const neonUrl = copyTargetUrl(process.env);

if (!supaUrl || !supaKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (the OLD database to read from).");
  process.exit(1);
}
if (!DRY_RUN && !neonUrl) {
  console.error("Missing the Neon database to write to: DATABASE_URL_UNPOOLED (from vercel env pull), or SPARKZ_DATABASE_URL.");
  process.exit(1);
}
if (neonUrl && !neonHost(neonUrl)) {
  console.error("Refusing: the target database is not on Neon (*.neon.tech). Check DATABASE_URL_UNPOOLED / SPARKZ_DATABASE_URL.");
  process.exit(1);
}
if (WITH_IMAGES && !DRY_RUN && !blobAuth(process.env)) {
  console.error(
    "--with-images needs Blob credentials: BLOB_STORE_ID with VERCEL_OIDC_TOKEN (re-run vercel env pull; the OIDC token is short-lived), or BLOB_READ_WRITE_TOKEN.",
  );
  process.exit(1);
}

// Parents before children (foreign keys in supabase/migrations). meme_receipts points at
// itself (parent_meme_id), so it is read oldest first.
const TABLES = [
  "hearths",
  "hearth_backers",
  "signals",
  "signal_drafts",
  "meme_receipts",
  "hearth_spokes",
  "team_signups",
  "waitlist",
];
const PAGE = 500;

const supabase = createClient(supaUrl, supaKey, { auth: { persistSession: false, autoRefreshToken: false } });
const sql = neonUrl ? neon(neonUrl) : null;

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`read ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

const STORAGE_MARK = "/storage/v1/object/public/";

function storageUrls(value, out = new Set()) {
  if (typeof value === "string" && value.includes(STORAGE_MARK)) out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => storageUrls(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => storageUrls(v, out));
  return out;
}

function replaceUrls(value, map) {
  if (typeof value === "string") return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replaceUrls(v, map));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceUrls(v, map)]));
  }
  return value;
}

async function moveImage(url) {
  const path = url.slice(url.indexOf(STORAGE_MARK) + STORAGE_MARK.length); // bucket/key
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`);
  const { put } = await import("@vercel/blob");
  const blob = await put(path, await res.arrayBuffer(), {
    access: "public",
    contentType: res.headers.get("content-type") ?? undefined,
    addRandomSuffix: false,
    allowOverwrite: true, // a re-run uploads the same bytes to the same path
  });
  return blob.url;
}

const ident = (name) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`bad column name ${name}`);
  return `"${name}"`;
};
const param = (v) => (v !== null && typeof v === "object" ? JSON.stringify(v) : v);

async function insertRows(table, rows) {
  let inserted = 0;
  for (const row of rows) {
    const cols = Object.keys(row);
    const text =
      `INSERT INTO ${ident(table)} (${cols.map(ident).join(", ")}) ` +
      `VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}) ON CONFLICT ("id") DO NOTHING RETURNING "id"`;
    const result = await sql.query(text, cols.map((c) => param(row[c])));
    inserted += result.length;
  }
  return inserted;
}

console.log(
  DRY_RUN
    ? "DRY RUN (add --apply to copy): reads Supabase, writes nothing."
    : `COPY: Supabase -> Neon host ${neonHost(neonUrl)} (existing ids are kept, never overwritten).`,
);

let failed = false;
for (const table of TABLES) {
  let rows;
  try {
    rows = await readAll(table);
  } catch (err) {
    console.error(`  ${table}: ${err.message}`);
    failed = true;
    continue;
  }

  if (table === "hearths" && WITH_IMAGES) {
    const urls = new Set();
    rows.forEach((r) => { storageUrls(r.metadata, urls); storageUrls(r.economic_config, urls); });
    console.log(`  hearths: ${urls.size} picture URL(s) in Supabase Storage`);
    if (!DRY_RUN && urls.size) {
      const map = new Map();
      for (const url of urls) {
        try {
          map.set(url, await moveImage(url));
        } catch (err) {
          console.error(`    keep old URL (move failed): ${err.message}`);
          failed = true;
        }
      }
      rows = rows.map((r) => ({ ...r, metadata: replaceUrls(r.metadata, map), economic_config: replaceUrls(r.economic_config, map) }));
      console.log(`    moved ${map.size} of ${urls.size} to Blob`);
    }
  }

  if (table === "hearths" && sql) {
    // The seed must run AFTER this copy. If it ran first, Neon holds the ZAO Hearths under
    // new ids, the old rows would be skipped on their unique slug, and every backing that
    // points at an old id would fail its foreign key. Stop before writing anything.
    const onNeon = await sql.query(`SELECT "id", "slug" FROM "hearths"`);
    const neonIdBySlug = new Map(onNeon.map((r) => [r.slug, r.id]));
    const clashes = rows.filter((r) => neonIdBySlug.has(r.slug) && neonIdBySlug.get(r.slug) !== r.id);
    if (clashes.length) {
      console.error(
        `  STOP: ${clashes.length} Hearth slug(s) already on Neon under a different id (${clashes.map((r) => r.slug).join(", ")}).\n` +
          "  The seed ran before the copy. On a fresh Neon this means: clear the hearths table on Neon, then copy, then seed.",
      );
      process.exit(1);
    }
  }

  if (DRY_RUN) {
    console.log(`  ${table}: ${rows.length} row(s) would be copied`);
    continue;
  }
  try {
    const n = await insertRows(table, rows);
    console.log(`  ${table}: ${rows.length} read, ${n} inserted, ${rows.length - n} already on Neon`);
  } catch (err) {
    console.error(`  ${table}: insert failed: ${err.message}`);
    failed = true;
  }
}

if (failed) {
  console.error("Finished WITH ERRORS (above). Fix and re-run: copied rows are skipped.");
  process.exit(1);
}
console.log("Done.");
