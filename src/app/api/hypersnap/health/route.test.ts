import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

// GET /api/hypersnap/health: a node answer, a node that does not answer, and a thrown
// error (a malformed HYPERSNAP_NODE_URL makes new URL() throw before the fetch). The
// last must come back as the sanitized 500, never the raw error message.
const realFetch = globalThis.fetch;
const realWarn = console.warn;
const realError = console.error;

afterEach(() => {
  globalThis.fetch = realFetch;
  console.warn = realWarn;
  console.error = realError;
  delete process.env.HYPERSNAP_NODE_URL;
});

test("node answers: 200 with up true and the parsed info", async () => {
  process.env.HYPERSNAP_NODE_URL = "https://node.example";
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ version: "1.2.3", dbStats: { numMessages: 5, numFidRegistrations: 2 } }), {
      status: 200,
    })) as typeof fetch;
  const { GET } = await import("./route");
  const res = await GET();
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.data.up, true);
  assert.equal(body.data.node, "https://node.example");
  assert.equal(body.data.info.version, "1.2.3");
});

test("node does not answer: still 200, up false", async () => {
  process.env.HYPERSNAP_NODE_URL = "https://node.example";
  console.warn = () => {};
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  const { GET } = await import("./route");
  const res = await GET();
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.up, false);
  assert.equal(body.data.info, null);
});

test("a thrown error returns the sanitized 500, not the error text", async () => {
  process.env.HYPERSNAP_NODE_URL = "not a url";
  const logged: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };
  const { GET } = await import("./route");
  const res = await GET();
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false, error: "Internal error" });
  assert.equal(logged.length, 1);
  assert.equal(logged[0][0], "[sparkz:hypersnap.health.GET]");
});
