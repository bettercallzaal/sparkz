// The Sparkz message the owner wallet signs next to Empire's own message for a tokenless
// deploy. Its own file (no node:crypto) so the browser page can build it too. Checked on
// the server by checkDeployCode (deploy-code.ts).
export function deployCodeMessage(a: { hearthSlug: string; name: string; code: string; issuedAt: string }): string {
  return [
    "Sparkz: confirm this Empire deploy",
    `Hearth: ${a.hearthSlug}`,
    `Empire: ${a.name.trim()}`,
    `Code: ${a.code}`,
    `Issued at: ${a.issuedAt}`,
  ].join("\n");
}
