import {
  type ApprovalChannel,
  type ApprovalRequest,
  registerApprovalChannel,
} from "./index";

// Discord channel. Wired but DARK until DISCORD_WEBHOOK_URL is set (enabled is
// gated on the env var). When live, it posts the signal + the 3 drafts + a click
// -through approve link to a Discord channel, so Zaal gets pinged wherever he is
// and approves via the in-app UI. Inline Discord buttons (interactions endpoint)
// are a later upgrade - a webhook post is the redundant m1 surface.

export class DiscordChannel implements ApprovalChannel {
  readonly id = "discord";

  get enabled(): boolean {
    return Boolean(process.env.DISCORD_WEBHOOK_URL);
  }

  async notify(req: ApprovalRequest): Promise<void> {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) return; // dark

    const draftLines = req.drafts
      .map((d, i) => `**Draft ${d.rank ?? i + 1}**\n${d.text}`)
      .join("\n\n");

    const content = [
      `**Signal flagged for ${req.capsuleName}**`,
      `> ${req.signalText}`,
      "",
      draftLines,
      "",
      `Approve one: ${req.approveUrl}`,
    ].join("\n");

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Discord caps content at 2000 chars.
      body: JSON.stringify({ content: content.slice(0, 2000) }),
    });

    if (!res.ok) {
      throw new Error(`Discord webhook failed: ${res.status}`);
    }
  }
}

registerApprovalChannel(new DiscordChannel());
