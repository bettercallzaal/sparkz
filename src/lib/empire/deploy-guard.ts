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
