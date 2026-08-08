import { type ApprovalChannel, type ApprovalRequest } from "./index";

// Telegram approval channel. Zaal works from Telegram, so approval should reach him
// there - the flag -> draft -> approve loop's human step becomes a phone tap wherever
// he is. Posts the signal + the 3 drafts + the approve link via the Bot API.
//
// DARK until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are both set (same gating pattern
// as the Discord channel). Inline approve buttons (a bot webhook that calls
// /api/signals/approve) are a later upgrade; a message with the link is the redundant
// surface today.

export class TelegramChannel implements ApprovalChannel {
  readonly id = "telegram";

  get enabled(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  }

  async notify(req: ApprovalRequest): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return; // dark

    const draftLines = req.drafts
      .map((d, i) => `${d.rank ?? i + 1}. ${d.text}`)
      .join("\n\n");

    const text = [
      `Signal flagged for ${req.hearthName}`,
      req.signalText,
      "",
      draftLines,
      "",
      `Approve one: ${req.approveUrl}`,
    ]
      .join("\n")
      // Telegram caps a message at 4096 chars.
      .slice(0, 4096);

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Plain text (no parse_mode) so draft punctuation never breaks Markdown parsing.
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Telegram sendMessage failed: ${res.status} ${body.slice(0, 200)}`);
    }
  }
}

// Singleton - registered into the seam by the built-in plugin.
export const telegramChannel = new TelegramChannel();
