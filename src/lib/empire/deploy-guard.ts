// Who may run an Empire deploy for a Hearth. A deploy is a live Base mainnet
// action paid on the operator's EMPIRE_API_KEY, so an owner (non-operator) gets
// at most ONE, and only for a Hearth that has passed review. The operator is not
// limited here. Pure, so it is unit-tested (deploy-guard.test.ts).

export type DeployRefusal = { status: 403 | 409; error: string } | null;

export function ownerDeployRefusal(
  hearth: { metadata?: unknown; economic_config?: unknown },
  isOperator: boolean,
): DeployRefusal {
  if (isOperator) return null;
  const meta = (hearth.metadata ?? {}) as { self_serve?: unknown; review?: unknown };
  if (meta.self_serve === true && meta.review !== "approved") {
    return { status: 403, error: "This Hearth is still in review" };
  }
  const econ = (hearth.economic_config ?? {}) as { empire_id?: unknown; empire_address?: unknown };
  if (econ.empire_id || econ.empire_address) {
    return { status: 409, error: "This Hearth already has an empire" };
  }
  return null;
}

// Token launch (graduation). Same review rule as above, but a Hearth that already runs a
// TOKENLESS empire may launch one token: that is the point of graduating. A Hearth that
// already has a token is refused, operator or not, so a second token is never deployed
// for it by mistake.
export function tokenLaunchRefusal(
  hearth: { metadata?: unknown; economic_config?: unknown },
  isOperator: boolean,
): DeployRefusal {
  const econ = (hearth.economic_config ?? {}) as {
    empire_id?: unknown;
    empire_address?: unknown;
    empire_mode?: unknown;
    token_address?: unknown;
    empire_token_type?: unknown;
  };
  const linkedType = typeof econ.empire_token_type === "string" ? econ.empire_token_type : "";
  const linkedIsToken =
    (linkedType !== "" && !linkedType.includes("tokenless")) ||
    (typeof econ.empire_id === "string" && /^0x[0-9a-fA-F]{40}$/.test(econ.empire_id));
  if (econ.token_address || econ.empire_mode === "token" || linkedIsToken) {
    return { status: 409, error: "This Hearth already has a token" };
  }
  if (isOperator) return null;
  const meta = (hearth.metadata ?? {}) as { self_serve?: unknown; review?: unknown };
  if (meta.self_serve === true && meta.review !== "approved") {
    return { status: 403, error: "This Hearth is still in review" };
  }
  return null;
}

// A deploy tx already sent for this Hearth and not yet registered. While it is set, no
// new token config is handed out, so a retry finishes THAT coin instead of making a
// second one. Cleared when register-token records the token.
export function pendingDeployTx(hearth: { economic_config?: unknown }): string | null {
  const econ = (hearth.economic_config ?? {}) as { pending_deploy_tx?: unknown; token_address?: unknown };
  if (econ.token_address) return null;
  return typeof econ.pending_deploy_tx === "string" && /^0x[0-9a-fA-F]{64}$/.test(econ.pending_deploy_tx)
    ? econ.pending_deploy_tx
    : null;
}

// One-launch lock, taken when the config is requested (review round 2, item 3), not only
// once a tx is sent. Held by the wallet that asked; the same wallet may refresh its
// preview, another wallet waits until the lock is stale. Pure, so it is unit-tested.
export const LAUNCH_LOCK_MS = 10 * 60 * 1000;
export function launchLockRefusal(
  hearth: { economic_config?: unknown },
  wallet: string,
  now: number,
): DeployRefusal {
  const econ = (hearth.economic_config ?? {}) as { token_launch_lock_at?: unknown; token_launch_lock_by?: unknown };
  const at = typeof econ.token_launch_lock_at === "string" ? Date.parse(econ.token_launch_lock_at) : NaN;
  const by = typeof econ.token_launch_lock_by === "string" ? econ.token_launch_lock_by.toLowerCase() : "";
  if (!Number.isFinite(at) || now - at >= LAUNCH_LOCK_MS || by === wallet.toLowerCase()) return null;
  return { status: 409, error: "Another wallet is preparing a launch for this Hearth. Try again in 10 minutes." };
}
