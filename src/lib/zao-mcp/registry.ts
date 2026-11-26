import { z } from "zod";
import { openContributionProof, openContributionProofInput, type ToolResult } from "./proof";
import { listZaoProjects } from "./projects";

// The ZAO MCP's tools, in one list, so more ZAO read tools can be added later as one file
// plus one entry here. v1 has exactly two, both read only. There is no write tool: no
// posting, payout, wallet, bounty, token or database write.
//
// FOLLOW-UP, after Zaal's typed OK on the dependency @modelcontextprotocol/server (parked
// under rule d2c0d9fa): src/app/mcp/route.ts registers each entry below with the SDK's
// Streamable HTTP transport (WebStandardStreamableHTTPServerTransport), checks Origin, and
// adds nothing else. Until then these are plain modules with tests.
export type ZaoTool = {
  name: string;
  title: string;
  description: string;
  readOnly: true;
  input: z.ZodTypeAny;
  run: (args: unknown) => Promise<ToolResult> | ToolResult;
};

export const ZAO_TOOLS: readonly ZaoTool[] = [
  {
    name: "open_contribution_proof",
    title: "Open a contribution proof",
    description:
      "Open one approved ZAO contribution receipt by its id and the sha256 of its exact bytes. Returns a short summary, the source link, the digest and a link to the same record on trysparkz.com. Read only.",
    readOnly: true,
    input: openContributionProofInput,
    run: (args) => openContributionProof(args),
  },
  {
    name: "list_zao_projects",
    title: "List ZAO projects",
    description:
      "List the public ZAO projects on Sparkz (their Hearths) with a one-line description and a link to each. Read only.",
    readOnly: true,
    input: z.object({}).strict(),
    run: () => listZaoProjects(),
  },
];
