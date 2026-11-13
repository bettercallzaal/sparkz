import { test } from "node:test";
import assert from "node:assert/strict";
import { groupBackings } from "./my-backings";

test("one entry per Hearth, kinds merged, newest first", () => {
  const out = groupBackings([
    { hearth_id: "a", kind: "boost", created_at: "2026-11-01T00:00:00Z" },
    { hearth_id: "b", kind: "boost", created_at: "2026-11-05T00:00:00Z" },
    { hearth_id: "a", kind: "backing", created_at: "2026-11-09T00:00:00Z" },
    { hearth_id: "a", kind: "boost", created_at: "2026-11-02T00:00:00Z" },
  ]);
  assert.deepEqual(out, [
    { hearth_id: "a", kinds: ["boost", "backing"], last_at: "2026-11-09T00:00:00Z" },
    { hearth_id: "b", kinds: ["boost"], last_at: "2026-11-05T00:00:00Z" },
  ]);
});

test("no rows, no entries", () => {
  assert.deepEqual(groupBackings([]), []);
});
