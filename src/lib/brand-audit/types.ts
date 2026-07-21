// Brand-audit / OSS-repo Capsule support. Each audited ZAO repo is a Capsule
// candidate (type='oss'); the audit is the Spark-readiness pass. This data lives
// in capsules.metadata (jsonb) so an oss Capsule is just a different type + config,
// never a new schema. CoCConcertZ is the first intended Spark.

// The 4 anti-failure gates (ARCHITECTURE / V1-SCOPE). An audit scores each.
export type GateKey = "earn" | "measurable" | "proprietary_data" | "testable_30d";

export const GATE_LABELS: Record<GateKey, string> = {
  earn: "Helps someone earn, participate, or distribute?",
  measurable: "Can we measure whether it worked?",
  proprietary_data: "Strengthens the Capsule's proprietary data?",
  testable_30d: "Testable with a real project in 30 days?",
};

export type GateVerdict = "pass" | "fail" | "unknown";

export interface RepoContributor {
  login: string;
  contributions: number;
  url?: string;
}

export interface AuditResult {
  gates: Record<GateKey, GateVerdict>;
  // Security pass reuses SECURITY.md - recorded so the audit carries it.
  security_reviewed: boolean;
  notes?: string;
  audited_at?: string; // set by the server at write time
}

// The shape stored in capsules.metadata for an oss Capsule.
export interface OssCapsuleMetadata {
  entry_point: "oss";
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  default_branch?: string;
  stars?: number;
  contributors: RepoContributor[];
  audit_result: AuditResult;
  [key: string]: unknown;
}

export function emptyAudit(): AuditResult {
  return {
    gates: {
      earn: "unknown",
      measurable: "unknown",
      proprietary_data: "unknown",
      testable_30d: "unknown",
    },
    security_reviewed: false,
  };
}
