// What the Hearth status pill says. The column keeps 'spark' (migration 0001); since Sparks
// became events on a Hearth (migration 0008), calling every Hearth "spark" contradicted the
// Sparks list on the same page. Display only.
const LABELS: Record<string, string> = { spark: "lit", tokenized: "tokenized", dormant: "dormant" };

export function hearthStatusLabel(status: string | null | undefined): string {
  if (!status) return "";
  return LABELS[status] ?? status;
}
