// Which receipts the ZAO MCP may open (v1: an allowlist file in the repo, Zaal's pick; not
// signed approvals). Merging a change to this file is the approval, and git history is the
// record of who approved what. An entry must match on every field, or the record stays
// closed. Real submissions are added only after Zaal clears each one in his own words.
export type Approval = {
  contribution_id: string;
  sha256: string;
  issuer: "sparkz";
  audience: "zao-mcp";
  scope: "read";
  expires_at: string; // ISO time; after it the record is closed again
};

export const ISSUER = "sparkz";
export const AUDIENCE = "zao-mcp";

export const ALLOWLIST: readonly Approval[] = [
  {
    contribution_id: "fixture-zoostr-logo-0",
    sha256: "1861f86b7f500b10f4d944362f1f0090752b56751083b5cbd85623be0b682b6e",
    issuer: "sparkz",
    audience: "zao-mcp",
    scope: "read",
    expires_at: "2027-02-28T23:59:59Z",
  },
];
