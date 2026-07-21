// ApprovalChannel seam. The flag -> 3-drafts -> approve loop needs a human to pick
// one draft, and Zaal wants that reachable from wherever he is - redundancy is the
// point. The ApprovalRouter fans an approval request to ALL enabled channels at
// once; the human approves through any one; first-approve-wins is enforced at the
// DB layer (the approve transition is idempotent - a second approval no-ops).
//
// m1 channels: in_app (always on) + discord (wired but dark until DISCORD_WEBHOOK_URL
// is set). Telegram and others drop in behind the same interface later.

export interface ApprovalDraft {
  id: string;
  rank: number | null;
  text: string;
}

export interface ApprovalRequest {
  signalId: string;
  capsuleId: string;
  capsuleName: string;
  signalText: string;
  drafts: ApprovalDraft[];
  approveUrl: string;
}

export interface ApprovalChannel {
  readonly id: string;
  readonly enabled: boolean;
  notify(req: ApprovalRequest): Promise<void>;
}

const channels: ApprovalChannel[] = [];

export function registerApprovalChannel(channel: ApprovalChannel): void {
  channels.push(channel);
}

export function listApprovalChannels(): ApprovalChannel[] {
  return [...channels];
}

// Fan out to every enabled channel. A single channel failure must not sink the
// others (redundancy), so failures are collected, not thrown.
export async function routeApproval(
  req: ApprovalRequest,
): Promise<{ notified: string[]; failed: { id: string; error: string }[] }> {
  const enabled = channels.filter((c) => c.enabled);
  const notified: string[] = [];
  const failed: { id: string; error: string }[] = [];

  await Promise.all(
    enabled.map(async (c) => {
      try {
        await c.notify(req);
        notified.push(c.id);
      } catch (err) {
        failed.push({
          id: c.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  return { notified, failed };
}
