import { test } from "node:test";
import assert from "node:assert/strict";
import { COPY_TABLES, copySupabaseToNeon, insertStatement, replaceUrls, runCopy, slugClashes, storageUrls, type CopyDeps } from "./copy";

const PIC = "https://abc.supabase.co/storage/v1/object/public/empire-logos/x.png";

test("tables go parents first: hearths before everything that points at it", () => {
  assert.equal(COPY_TABLES[0], "hearths");
  assert.ok(COPY_TABLES.indexOf("signals") < COPY_TABLES.indexOf("signal_drafts"));
  assert.ok(COPY_TABLES.indexOf("signal_drafts") < COPY_TABLES.indexOf("meme_receipts"));
});

test("picture URLs are found anywhere in the JSON and swapped for their new ones", () => {
  const meta = { picture: PIC, links: [{ logo: PIC }], name: "zabal" };
  assert.deepEqual([...storageUrls(meta)], [PIC]);
  const moved = replaceUrls(meta, new Map([[PIC, "https://x.public.blob.vercel-storage.com/empire-logos/x.png"]]));
  assert.deepEqual(moved, {
    picture: "https://x.public.blob.vercel-storage.com/empire-logos/x.png",
    links: [{ logo: "https://x.public.blob.vercel-storage.com/empire-logos/x.png" }],
    name: "zabal",
  });
});

test("each row is inserted with its id kept and never overwritten", () => {
  const { text, params } = insertStatement("hearths", { id: "u1", slug: "zabal", metadata: { zao: true }, owner_fid: 19640 });
  assert.equal(
    text,
    `INSERT INTO "hearths" ("id", "slug", "metadata", "owner_fid") VALUES ($1, $2, $3, $4) ON CONFLICT ("id") DO NOTHING RETURNING "id"`,
  );
  assert.deepEqual(params, ["u1", "zabal", '{"zao":true}', 19640]);
  assert.throws(() => insertStatement("hearths", { 'id"; drop table x; --': 1 }), /bad identifier/);
});

test("a slug already on Neon under another id is a clash; the same id is not", () => {
  const source = [{ id: "a", slug: "zabal" }, { id: "b", slug: "zao-devz" }];
  assert.deepEqual(slugClashes(source, [{ id: "a", slug: "zabal" }]), []);
  assert.deepEqual(slugClashes(source, [{ id: "new", slug: "zao-devz" }]), ["zao-devz"]);
});

test("with no keys in the environment it stops before touching any database", async () => {
  const saved = { ...process.env };
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL_UNPOOLED", "DATABASE_URL", "STORAGE_DATABASE_URL"]) {
    delete process.env[k];
  }
  try {
    const r = await copySupabaseToNeon({ apply: true, withImages: true });
    assert.match(r.stopped ?? "", /Supabase keys are not set/);
    assert.deepEqual(r.tables, []);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-not-a-key";
    process.env.DATABASE_URL = "postgresql://u:p@db.abc.supabase.co/postgres"; // not Neon
    const r2 = await copySupabaseToNeon({ apply: true, withImages: false });
    assert.match(r2.stopped ?? "", /not on \*\.neon\.tech/);
    assert.equal(r2.target, null);
  } finally {
    process.env = saved;
  }
});

// Fake outside world: Supabase tables in memory, every Neon write and Blob upload recorded.
function fakeDeps(opts: { failRead?: string; neonHearths?: { id: string; slug: string }[] } = {}) {
  const inserts: string[] = [];
  const uploads: string[] = [];
  const tables: Record<string, Record<string, unknown>[]> = {
    hearths: [{ id: "h1", slug: "zabal", metadata: { picture: PIC }, economic_config: {} }],
    hearth_backers: [{ id: "b1", hearth_id: "h1" }],
  };
  const deps: CopyDeps = {
    readTable: async (t) => {
      if (t === opts.failRead) throw new Error(`read ${t}: boom`);
      return tables[t] ?? [];
    },
    neonQuery: async (text) => {
      if (text.startsWith("SELECT")) return opts.neonHearths ?? [];
      inserts.push(text.slice(0, 40));
      return [{ id: "x" }];
    },
    moveImage: async (url) => {
      uploads.push(url);
      return "https://x.public.blob.vercel-storage.com/p.png";
    },
  };
  return { deps, inserts, uploads };
}

test("a real copy with one failing table read writes nothing at all", async () => {
  const f = fakeDeps({ failRead: "signals" });
  const r = await runCopy({ apply: true, withImages: true }, "ep-x.neon.tech", f.deps);
  assert.deepEqual(f.inserts, []);
  assert.deepEqual(f.uploads, []);
  assert.match(r.stopped ?? "", /could not be read\. Nothing was written/);
  assert.match(r.errors[0], /read signals: boom/);
});

test("a failing hearths read also stops the copy (no slug check possible)", async () => {
  const f = fakeDeps({ failRead: "hearths" });
  const r = await runCopy({ apply: true, withImages: false }, "ep-x.neon.tech", f.deps);
  assert.deepEqual(f.inserts, []);
  assert.ok(r.stopped);
});

test("a slug clash stops a real copy before any write", async () => {
  const f = fakeDeps({ neonHearths: [{ id: "other", slug: "zabal" }] });
  const r = await runCopy({ apply: true, withImages: true }, "ep-x.neon.tech", f.deps);
  assert.deepEqual(f.inserts, []);
  assert.deepEqual(f.uploads, []);
  assert.match(r.stopped ?? "", /already on Neon under a different id/);
});

test("a clean real copy moves the picture and inserts every row", async () => {
  const f = fakeDeps();
  const r = await runCopy({ apply: true, withImages: true }, "ep-x.neon.tech", f.deps);
  assert.equal(r.stopped, null);
  assert.deepEqual(f.uploads, [PIC]);
  assert.equal(f.inserts.length, 2);
  assert.deepEqual(r.images, { found: 1, moved: 1 });
  assert.equal(r.tables.find((t) => t.table === "hearths")?.inserted, 1);
});

test("a dry run reads and counts but never writes or uploads", async () => {
  const f = fakeDeps();
  const r = await runCopy({ apply: false, withImages: true }, "ep-x.neon.tech", f.deps);
  assert.deepEqual(f.inserts, []);
  assert.deepEqual(f.uploads, []);
  assert.equal(r.tables.find((t) => t.table === "hearths")?.read, 1);
  assert.deepEqual(r.images, { found: 1, moved: 0 });
});
