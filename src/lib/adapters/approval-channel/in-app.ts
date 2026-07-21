import {
  type ApprovalChannel,
  type ApprovalRequest,
  registerApprovalChannel,
} from "./index";

// In-app channel. The admin UI polls for drafted signals, so "notification" is
// the UI itself - notify is a no-op that just records the request server-side.
// Always enabled; it is the baseline surface that never depends on an external
// service being configured.

export class InAppChannel implements ApprovalChannel {
  readonly id = "in_app";
  readonly enabled = true;

  async notify(req: ApprovalRequest): Promise<void> {
    // The drafted signal is already persisted; the admin UI surfaces it. Nothing
    // to push. Logged server-side for traceability.
    console.log(
      `[approval:in_app] signal ${req.signalId} (${req.capsuleName}) ready with ${req.drafts.length} drafts`,
    );
  }
}

registerApprovalChannel(new InAppChannel());
