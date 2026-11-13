// "Put to sleep" / "Light it again" for a Hearth: the dormant status in the Hearth
// lifecycle ("lit -> dormant. A dormant Hearth can be lit again any time", /hearth).
// Sleeping remembers the status it had (spark or tokenized) in metadata.previous_status
// so waking restores it. Pure, so it is unit-tested; /api/capsules/update applies it.
export type HearthStatus = "spark" | "tokenized" | "dormant";

export function sleepTransition(
  status: HearthStatus,
  metadata: Record<string, unknown>,
  asleep: boolean,
): { status: HearthStatus; metadata: Record<string, unknown> } | null {
  const meta = { ...metadata };
  if (asleep) {
    if (status === "dormant") return null; // already asleep: nothing to change
    meta.previous_status = status;
    return { status: "dormant", metadata: meta };
  }
  if (status !== "dormant") return null; // already awake
  const prev = meta.previous_status;
  delete meta.previous_status;
  return { status: prev === "tokenized" ? "tokenized" : "spark", metadata: meta };
}
