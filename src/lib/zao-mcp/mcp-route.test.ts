import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { POST, GET } from "@/app/mcp/route";
import { resetMcpRateLimit, handleMcpRequest } from "./server";
import { ZAO_TOOLS } from "./registry";
import { listZaoProjects } from "./projects";
import type { Hearth } from "@/lib/supabase/types";

const ID = "fixture-zoostr-logo-0";
const SHA = "1861f86b7f500b10f4d944362f1f0090752b56751083b5cbd85623be0b682b6e";
const ENDPOINT = "http://localhost/mcp";

// list_zao_projects reads the live database in production; here it reads two fixed Hearths.
const FIXTURE = [
  { slug: "zao-os", name: "ZAO OS", type: "creator", status: "active", bio: "The ZAO app." },
  { slug: "sparkz", name: "Sparkz", type: "creator", status: "active", bio: "Crediting contribution." },
] as unknown as Hearth[];
const TOOLS = ZAO_TOOLS.map((t) => (t.name === "list_zao_projects" ? { ...t, run: () => listZaoProjects(async () => FIXTURE) } : t));

// A real MCP client whose network is the route handler itself, in process.
async function connect(): Promise<Client> {
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    return req.method === "POST" ? handleMcpRequest(req, TOOLS) : GET(req);
  }) as typeof fetch;
  const client = new Client({ name: "smoke", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(ENDPOINT), { fetch: fetchImpl }));
  return client;
}

beforeEach(() => resetMcpRateLimit());

test("an MCP client lists exactly the two read-only tools", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["list_zao_projects", "open_contribution_proof"]);
  for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true);
  await client.close();
});

test("list_zao_projects returns the public projects", async () => {
  const client = await connect();
  const res = await client.callTool({ name: "list_zao_projects", arguments: {} });
  assert.ok(!res.isError);
  const projects = (res.structuredContent as { projects: { slug: string }[] }).projects;
  assert.deepEqual(projects.map((p) => p.slug), ["sparkz", "zao-os"]);
  await client.close();
});

test("open_contribution_proof opens the fixture receipt and closes on a bad digest", async () => {
  const client = await connect();
  const ok = await client.callTool({ name: "open_contribution_proof", arguments: { contribution_id: ID, receipt_sha256: SHA } });
  assert.ok(!ok.isError);
  assert.equal((ok.structuredContent as { digest: string }).digest, SHA);
  const bad = await client.callTool({ name: "open_contribution_proof", arguments: { contribution_id: ID, receipt_sha256: "0".repeat(64) } });
  assert.equal(bad.isError, true);
  await client.close();
});

test("a failing tool returns one sanitized message, never the raw error", async () => {
  const boom = TOOLS.map((t) =>
    t.name === "list_zao_projects"
      ? { ...t, run: () => { throw new Error("db password hunter2"); } }
      : t,
  );
  const res = await handleMcpRequest(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_zao_projects", arguments: {} } }),
    }),
    boom,
  );
  assert.ok(!(await res.text()).includes("hunter2"));
});

test("the route refuses GET, a foreign Origin, and a flood", async () => {
  assert.equal((await GET(new Request(ENDPOINT))).status, 405);
  const post = (headers: Record<string, string> = {}) =>
    POST(new Request(ENDPOINT, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: "{}" }));
  assert.equal((await post({ origin: "https://evil.example" })).status, 403);
  resetMcpRateLimit();
  let last = 0;
  for (let i = 0; i < 61; i++) last = (await post({ "x-forwarded-for": "9.9.9.9" })).status;
  assert.equal(last, 429);
});
