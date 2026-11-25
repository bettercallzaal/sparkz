import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient } from "@/lib/db/fake-client";
import { loadBountiesTab } from "./hearth-bounties";

const HEARTH = "11111111-1111-4111-8111-111111111111";

beforeEach(() => setServiceClientForTests(null));

test("table missing (migration 0010 not applied): bounties are not enabled, no items", async () => {
  // A Postgres 42P01 error comes back as { error } from the query builder.
  const missing = {
    from: () => {
      const q: Record<string, unknown> = {};
      for (const m of ["select", "eq", "order", "limit"]) q[m] = () => q;
      q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: { code: "42P01", message: "relation does not exist" } }).then(ok);
      return q;
    },
  };
  setServiceClientForTests(missing);
  assert.deepEqual(await loadBountiesTab(HEARTH), { enabled: false, items: [] });
});

test("a query that throws is also not enabled", async () => {
  setServiceClientForTests({ from: () => { throw new Error("db down"); } });
  assert.deepEqual(await loadBountiesTab(HEARTH), { enabled: false, items: [] });
});

test("table present and empty: enabled with no items", async () => {
  setServiceClientForTests(fakeClient({ hearth_bounties: [] }));
  assert.deepEqual(await loadBountiesTab(HEARTH), { enabled: true, items: [] });
});
