import { McpServer, WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { canonicalOrigin } from "@/lib/origin";
import { ZAO_TOOLS, type ZaoTool } from "./registry";

// The ZAO MCP endpoint core: POST https://trysparkz.com/mcp (streamable HTTP, stateless,
// plain JSON responses). Read only and public data only. It registers exactly the entries
// in ZAO_TOOLS, adds no tool of its own, holds no session and reads no secret or env var
// beyond the canonical origin the site already uses. Input is Zod-validated by the SDK
// against each tool's own schema; any thrown error becomes one fixed sanitized message.

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = 60; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per client IP, per server instance (best effort)
const SERVER_INFO = { name: "zao-sparkz", version: "1.0.0" };
const FAILED = "That request could not be completed. Try again later.";

const hits = new Map<string, number[]>();

export function resetMcpRateLimit(): void {
  hits.clear();
}

function limited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  return xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function rpcError(status: number, code: number, message: string, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });
}

function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser agents send none
  if (origin === canonicalOrigin()) return true;
  try {
    const h = new URL(origin).hostname;
    return h === "localhost" || h === "127.0.0.1";
  } catch {
    return false;
  }
}

function buildServer(tools: readonly ZaoTool[]): McpServer {
  const server = new McpServer(SERVER_INFO);
  for (const t of tools) {
    server.registerTool(
      t.name,
      {
        title: t.title,
        description: t.description,
        inputSchema: t.input as never,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      },
      (async (args: unknown) => {
        try {
          return await t.run(args);
        } catch (err) {
          console.error("zao-mcp tool failed", t.name, err);
          return { isError: true, content: [{ type: "text", text: FAILED }] };
        }
      }) as never,
    );
  }
  return server;
}

export async function handleMcpRequest(
  req: Request,
  tools: readonly ZaoTool[] = ZAO_TOOLS,
  now: number = Date.now(),
): Promise<Response> {
  if (req.method !== "POST") {
    return rpcError(405, -32000, "Method not allowed. POST JSON-RPC to this endpoint.", { allow: "POST" });
  }
  if (!originAllowed(req)) return rpcError(403, -32000, "Origin not allowed.");
  if (limited(clientIp(req), now)) return rpcError(429, -32000, "Too many requests. Try again in a minute.", { "retry-after": "60" });
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return rpcError(413, -32000, "Request too large.");
  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      maxRequestBodySize: MAX_BODY_BYTES,
    });
    const server = buildServer(tools);
    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (err) {
    console.error("zao-mcp request failed", err);
    return rpcError(500, -32603, FAILED);
  }
}
