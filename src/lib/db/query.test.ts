import { test } from "node:test";
import assert from "node:assert/strict";
import { columnRef, createQueryClient, type Exec, type Row } from "./query";
import { normaliseRow } from "./neon";
import { PUBLIC_REVIEW_FILTER } from "../sanitize";

// A fake database: records every statement and answers with canned rows.
function fake(answer: (text: string) => Row[] = () => []) {
  const calls: { text: string; params: unknown[] }[] = [];
  const exec: Exec = async (text, params) => {
    calls.push({ text, params });
    const rows = answer(text);
    return { rows, rowCount: rows.length };
  };
  return { db: createQueryClient(exec), calls };
}

test("column refs quote names and turn JSON paths into ->> with a quoted key", () => {
  assert.equal(columnRef("slug"), '"slug"');
  assert.equal(columnRef("metadata->>review"), `"metadata"->>'review'`);
  assert.equal(columnRef("economic_config->>empire_id"), `"economic_config"->>'empire_id'`);
  for (const bad of ["slug; drop table x", "Slug", "metadata->>re'view", "a b", ""]) {
    assert.throws(() => columnRef(bad), /bad/, bad);
  }
});

test("select with filters, order and limit becomes one parameterised statement", () => {
  const { db } = fake();
  const q = db
    .from("hearths")
    .select("id, slug, name")
    .eq("owner_fid", 19640)
    .neq("status", "dormant")
    .gte("created_at", "2026-11-01T00:00:00.000Z")
    .order("created_at", { ascending: false })
    .limit(5);
  const { text, params } = q.toSQL();
  assert.equal(
    text,
    `SELECT "id", "slug", "name" FROM "hearths" WHERE "owner_fid" = $1 AND "status" <> $2 AND "created_at" >= $3 ORDER BY "created_at" DESC LIMIT 5`,
  );
  assert.deepEqual(params, [19640, "dormant", "2026-11-01T00:00:00.000Z"]);
});

test("toSQL is pure: calling it twice gives the same statement", () => {
  const { db } = fake();
  const q = db.from("hearths").update({ owner_fid: 1 }).eq("slug", "zabal").is("owner_fid", null);
  assert.deepEqual(q.toSQL(), q.toSQL());
});

test("the public review filter becomes an OR on the JSON path", () => {
  const { db } = fake();
  const { text, params } = db.from("hearths").select("*").or(PUBLIC_REVIEW_FILTER).toSQL();
  assert.equal(text, `SELECT * FROM "hearths" WHERE ("metadata"->>'review' IS NULL OR "metadata"->>'review' = $1)`);
  assert.deepEqual(params, ["approved"]);
});

test("is, in, not, like and filter map to the Postgres forms", () => {
  const { db } = fake();
  const { text, params } = db
    .from("meme_drafts")
    .select("draft_text")
    .is("owner_fid", null)
    .in("hearth_id", ["a", "b"])
    .not("reject_reason", "is", null)
    .like("backer_id", "%@%")
    .filter("metadata->>ip_hash", "eq", "h1")
    .toSQL();
  assert.equal(
    text,
    `SELECT "draft_text" FROM "meme_drafts" WHERE "owner_fid" IS NULL AND "hearth_id" IN ($1, $2) AND "reject_reason" IS NOT NULL AND "backer_id" LIKE $3 AND "metadata"->>'ip_hash' = $4`,
  );
  assert.deepEqual(params, ["a", "b", "%@%", "h1"]);
});

test("in() with an empty list matches nothing instead of erroring", () => {
  const { db } = fake();
  assert.equal(db.from("hearths").select("id").in("id", []).toSQL().text, `SELECT "id" FROM "hearths" WHERE FALSE`);
});

test("count with head runs one count query and returns no rows", async () => {
  const { db, calls } = fake(() => [{ count: 7 }]);
  const res = await db.from("hearth_backers").select("id", { count: "exact", head: true }).eq("hearth_id", "x");
  assert.deepEqual(res, { data: null, error: null, count: 7 });
  assert.equal(calls[0].text, `SELECT count(*)::int AS count FROM "hearth_backers" WHERE "hearth_id" = $1`);
});

test("insert JSON-encodes objects and returns the row with select().single()", async () => {
  const { db, calls } = fake(() => [{ id: "u1", slug: "zao-devz" }]);
  const res = await db
    .from("hearths")
    .insert({ slug: "zao-devz", metadata: { zao: true }, economic_config: { graduated: false } })
    .select("id, slug")
    .single();
  assert.deepEqual(res, { data: { id: "u1", slug: "zao-devz" }, error: null, count: null });
  assert.equal(
    calls[0].text,
    `INSERT INTO "hearths" ("slug", "metadata", "economic_config") VALUES ($1, $2, $3) RETURNING "id", "slug"`,
  );
  assert.deepEqual(calls[0].params, ["zao-devz", '{"zao":true}', '{"graduated":false}']);
});

test("a mutation without select() returns data null, like supabase-js", async () => {
  const { db } = fake(() => [{ id: "x" }]);
  const res = await db.from("waitlist").insert({ email: "a@b.c" });
  assert.equal(res.data, null);
  assert.equal(res.error, null);
});

test("update numbers SET values before WHERE values", () => {
  const { db } = fake();
  const { text, params } = db
    .from("hearths")
    .update({ owner_fid: 19640, status: "spark" })
    .eq("slug", "zabal")
    .is("owner_fid", null)
    .select("slug")
    .toSQL();
  assert.equal(text, `UPDATE "hearths" SET "owner_fid" = $1, "status" = $2 WHERE "slug" = $3 AND "owner_fid" IS NULL RETURNING "slug"`);
  assert.deepEqual(params, [19640, "spark", "zabal"]);
});

test("upsert updates every non-key column on conflict", () => {
  const { db } = fake();
  const { text } = db
    .from("hearth_plugins")
    .upsert({ hearth_id: "h", plugin_id: "p", enabled: true, config: {} }, { onConflict: "hearth_id,plugin_id" })
    .toSQL();
  assert.equal(
    text,
    `INSERT INTO "hearth_plugins" ("hearth_id", "plugin_id", "enabled", "config") VALUES ($1, $2, $3, $4) ON CONFLICT ("hearth_id", "plugin_id") DO UPDATE SET "enabled" = EXCLUDED."enabled", "config" = EXCLUDED."config"`,
  );
});

test("single and maybeSingle follow supabase-js on 0, 1 and 2 rows", async () => {
  const rowsFor = (n: number) => fake(() => Array.from({ length: n }, (_, i) => ({ id: i })));
  assert.deepEqual((await rowsFor(1).db.from("hearths").select("id").maybeSingle()).data, { id: 0 });
  assert.deepEqual(await rowsFor(0).db.from("hearths").select("id").maybeSingle(), { data: null, error: null, count: null });
  assert.equal((await rowsFor(0).db.from("hearths").select("id").single()).error?.code, "PGRST116");
  assert.equal((await rowsFor(2).db.from("hearths").select("id").maybeSingle()).error?.code, "PGRST116");
});

test("a database error comes back as error, with the Postgres code, not a throw", async () => {
  const exec: Exec = async () => {
    throw Object.assign(new Error("duplicate key value"), { code: "23505" });
  };
  const res = await createQueryClient(exec).from("waitlist").insert({ email: "a@b.c" });
  assert.equal(res.data, null);
  assert.equal(res.error?.code, "23505");
});

test("rows are normalised to the PostgREST shapes: numbers and ISO timestamps", () => {
  const row = normaliseRow(
    { owner_fid: "19640", amount_or_qty: "2.5", created_at: new Date("2026-11-14T12:00:00Z"), slug: "zabal", metadata: { a: 1 } },
    new Set(["owner_fid", "amount_or_qty"]),
  );
  assert.deepEqual(row, { owner_fid: 19640, amount_or_qty: 2.5, created_at: "2026-11-14T12:00:00.000Z", slug: "zabal", metadata: { a: 1 } });
});
