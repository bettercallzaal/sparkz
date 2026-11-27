import { handleMcpRequest } from "@/lib/zao-mcp/server";

// POST /mcp - the ZAO MCP endpoint (streamable HTTP, stateless). Read only, public data only.
// Tools: list_zao_projects, open_contribution_proof. See src/lib/zao-mcp/server.ts.
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

export async function GET(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

export async function DELETE(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}
