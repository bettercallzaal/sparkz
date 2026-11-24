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
