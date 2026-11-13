import { test } from "node:test";
import assert from "node:assert/strict";
import { updateHearthSchema } from "./schemas";

const id = "00000000-0000-4000-8000-000000000000";

test("a normal edit passes", () => {
  const r = updateHearthSchema.safeParse({
    hearth_id: id,
    name: "ZABAL",
    bio: "Culture coin community",
    image: "https://example.com/a.png",
    tags: ["music", "live"],
    links: { website: "https://zabal.art", x: "" },
  });
  assert.equal(r.success, true);
});

test("javascript:, data: and http: links are refused", () => {
  for (const bad of ["javascript:alert(1)", "data:text/html,hi", "http://example.com"]) {
    const r = updateHearthSchema.safeParse({ hearth_id: id, links: { website: bad } });
    assert.equal(r.success, false, bad);
  }
});

test("a non-https picture is refused", () => {
  assert.equal(updateHearthSchema.safeParse({ hearth_id: id, image: "http://x.y/a.png" }).success, false);
});

test("more than 8 tags is refused", () => {
  const tags = Array.from({ length: 9 }, (_, i) => `t${i}`);
  assert.equal(updateHearthSchema.safeParse({ hearth_id: id, tags }).success, false);
});

test("an empty name is refused, an empty string clears other fields", () => {
  assert.equal(updateHearthSchema.safeParse({ hearth_id: id, name: "  " }).success, false);
  assert.equal(updateHearthSchema.safeParse({ hearth_id: id, image: "", about: "" }).success, true);
});

test("unknown fields like review or owner_fid are stripped, never applied", () => {
  const r = updateHearthSchema.safeParse({ hearth_id: id, review: "approved", owner_fid: 1 });
  assert.equal(r.success, true);
  assert.equal("review" in (r.data as object), false);
  assert.equal("owner_fid" in (r.data as object), false);
});
