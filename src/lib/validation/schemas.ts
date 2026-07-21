import { z } from "zod";

// Zod schemas for every API input (safeParse in the routes). Keep the enums in
// lockstep with the CHECK constraints in 0001_capsule_foundation.sql.

export const capsuleTypeEnum = z.enum(["creator", "culture", "oss", "meme"]);
export const capsuleStatusEnum = z.enum(["spark", "tokenized", "dormant"]);
export const backerKindEnum = z.enum(["wallet", "fid", "user"]);
export const backingKindEnum = z.enum(["collectable", "backing", "boost"]);

export const createCapsuleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case (a-z, 0-9, -)"),
  type: capsuleTypeEnum,
  name: z.string().min(1).max(120),
  bio: z.string().max(2000).optional(),
  owner_wallet: z.string().max(64).optional(),
  owner_fid: z.number().int().positive().optional(),
  status: capsuleStatusEnum.optional(),
  economic_config: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const flagSignalSchema = z.object({
  capsule_id: z.string().uuid(),
  text: z.string().min(1).max(1000),
  why_it_matched: z.string().max(1000).optional(),
  flagged_by: z.string().max(120).optional(),
  source: z.string().max(60).optional(), // defaults to 'human'
  source_meta: z.record(z.string(), z.unknown()).optional(),
});

export const approveDraftSchema = z.object({
  signal_id: z.string().uuid(),
  draft_id: z.string().uuid(),
  approver: z.string().max(120).optional(),
  approved_via: z.string().max(60).optional(), // discord | in_app | telegram
  lessons: z.string().max(2000).optional(),
});

export const linkEmpireSchema = z.object({
  capsule_id: z.string().uuid(),
  empire_id: z.string().min(2).max(120), // 0x..., fid..., c-..., or slug
});

export const boostSchema = z.object({
  capsule_id: z.string().uuid(),
  backer: z.string().min(1).max(200), // email or handle
});

export const joinWaitlistSchema = z.object({
  email: z.string().email().max(200),
  ref: z.string().max(120).optional(),
  interest: z.string().max(60).optional(),
});

export const importRepoSchema = z.object({
  ref: z.string().min(3).max(200), // "owner/repo" or a github URL
});

export const auditGateSchema = z.object({
  capsule_id: z.string().uuid(),
  gates: z
    .object({
      earn: z.enum(["pass", "fail", "unknown"]),
      measurable: z.enum(["pass", "fail", "unknown"]),
      proprietary_data: z.enum(["pass", "fail", "unknown"]),
      testable_30d: z.enum(["pass", "fail", "unknown"]),
    })
    .partial()
    .optional(),
  security_reviewed: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const createBackingSchema = z.object({
  capsule_id: z.string().uuid(),
  backer_kind: backerKindEnum,
  backer_id: z.string().min(1).max(200),
  kind: backingKindEnum,
  amount_or_qty: z.number().nonnegative(),
  unit: z.string().max(40).optional(),
  provider: z.string().max(40).optional(), // defaults to 'ledger'
});
