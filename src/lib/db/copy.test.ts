import { test } from "node:test";
import assert from "node:assert/strict";
import { COPY_TABLES, copySupabaseToNeon, insertStatement, replaceUrls, slugClashes, storageUrls } from "./copy";

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
