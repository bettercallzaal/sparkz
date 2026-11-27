// Smoke: connect an MCP client to a running endpoint and call tools/list, list_zao_projects
// and open_contribution_proof. Usage: node --experimental-strip-types scripts/smoke-mcp.ts [url]
// Default url is http://localhost:3000/mcp (run `npm run dev` first). Exits 1 on any failure.
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const url = process.argv[2] ?? "http://localhost:3000/mcp";
const ID = "fixture-zoostr-logo-0";
const SHA = "1861f86b7f500b10f4d944362f1f0090752b56751083b5cbd85623be0b682b6e";

const client = new Client({ name: "sparkz-smoke", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(url)));
const names = (await client.listTools()).tools.map((t) => t.name).sort();
console.log("tools/list:", names.join(", "));
if (names.join() !== "list_zao_projects,open_contribution_proof") throw new Error("unexpected tool list");
const projects = await client.callTool({ name: "list_zao_projects", arguments: {} });
if (projects.isError) throw new Error("list_zao_projects failed");
console.log("list_zao_projects:", (projects.structuredContent as { projects: unknown[] }).projects.length, "projects");
const proof = await client.callTool({ name: "open_contribution_proof", arguments: { contribution_id: ID, receipt_sha256: SHA } });
if (proof.isError) throw new Error("open_contribution_proof failed");
console.log("open_contribution_proof: ok", (proof.structuredContent as { viewer_url: string }).viewer_url);
await client.close();
console.log("SMOKE PASS");
