import { z } from "zod";
import { STAGES, MAX_ITEMS, MAX_ITEM_LENGTH } from "@/lib/hearth-context";

// Zod schemas for every API input (safeParse in the routes). Keep the enums in
// lockstep with the CHECK constraints in 0001_hearth_foundation.sql.

export const hearthTypeEnum = z.enum(["creator", "culture", "oss", "meme"]);
export const hearthStatusEnum = z.enum(["spark", "tokenized", "dormant"]);
export const backerKindEnum = z.enum(["wallet", "fid", "user"]);
export const backingKindEnum = z.enum(["collectable", "backing", "boost"]);

// Public self-serve spark creation (/start). Deliberately narrow: a visitor may
// only set a name, an optional one-line bio, a type, and an email. The server owns
// the slug, forces status='spark', and marks the row self_serve - no operator
// powers, no economic_config, no arbitrary metadata. `website` is a honeypot: real
// users never fill it; bots do.
export const createSparkSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(280).optional(),
  type: hearthTypeEnum,
  email: z.string().email().max(200).optional(), // optional when signed in with Farcaster
  website: z.string().max(200).optional(), // honeypot - real users leave it empty
  // Optional Farcaster identity (set when the creator signed in with Farcaster).
  owner_fid: z.number().int().positive().optional(),
  fc_username: z.string().max(64).optional(),
  fc_channel: z.string().max(64).optional(),
}).refine((v) => v.email || v.owner_fid, {
  message: "Provide an email or sign in with Farcaster",
  path: ["email"],
});

export const createHearthSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case (a-z, 0-9, -)"),
  type: hearthTypeEnum,
  name: z.string().min(1).max(120),
  bio: z.string().max(2000).optional(),
  owner_wallet: z.string().max(64).optional(),
  owner_fid: z.number().int().positive().optional(),
  status: hearthStatusEnum.optional(),
  economic_config: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const flagSignalSchema = z.object({
  hearth_id: z.string().uuid(),
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

// Owner or admin edits a Hearth's public details (POST /api/capsules/update). Only
// these fields can change; review status, ownership and economics are not editable
// here. Every URL must be https: the public page renders links as href and the picture
// as an image source, so javascript: and data: URLs are refused.
const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine((u) => u.startsWith("https://"), "must start with https://");
const optionalUrl = z.union([httpsUrl, z.literal("")]).optional();

export const updateHearthSchema = z.object({
  hearth_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(280).optional(),
  about: z.string().trim().max(4000).optional(),
  image: optionalUrl,
  tags: z.array(z.string().trim().min(1).max(24)).max(8).optional(),
  // Project context (lib/hearth-context.ts): stage, what is done, what it needs help with.
  stage: z.union([z.enum(STAGES), z.literal("")]).optional(),
  done: z.array(z.string().trim().max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
  needs: z.array(z.string().trim().max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
  // true puts the Hearth to sleep (dormant), false lights it again (lib/hearth-sleep.ts).
  asleep: z.boolean().optional(),
  links: z
    .object({
      website: optionalUrl,
      github: optionalUrl,
      docs: optionalUrl,
      x: optionalUrl,
      farcaster: optionalUrl,
      discord: optionalUrl,
      bounties: optionalUrl, // a poidh bounty or a page listing them
    })
    .optional(),
});

export const linkFarcasterSchema = z
  .object({
    hearth_id: z.string().uuid(),
    fid: z.number().int().positive().optional(),
    username: z.string().max(64).optional(),
    channel: z.string().max(64).optional(), // channel id, e.g. "zao"
  })
  .refine((d) => d.fid || d.username || d.channel, {
    message: "provide at least one of fid, username, or channel",
  });

export const linkEmpireSchema = z.object({
  hearth_id: z.string().uuid(),
  empire_id: z.string().min(2).max(120), // 0x..., fid..., c-..., or slug
});

export const boostSchema = z.object({
  hearth_id: z.string().uuid(),
  // Email or handle. Optional: a signed-in backer is identified by the session instead.
  backer: z.string().min(1).max(200).optional(),
  // Unverified display hint for a signed-in Farcaster backer, stored in metadata
  // only; the session FID is the backer id and the dedupe key.
  fc_username: z
    .string()
    .regex(/^[a-z0-9][a-z0-9.-]{0,30}$/i)
    .optional(),
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
  hearth_id: z.string().uuid(),
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
  hearth_id: z.string().uuid(),
  backer_kind: backerKindEnum,
  backer_id: z.string().min(1).max(200),
  kind: backingKindEnum,
  amount_or_qty: z.number().nonnegative(),
  unit: z.string().max(40).optional(),
  provider: z.string().max(40).optional(), // defaults to 'ledger'
});

export const deployEmpireSchema = z.object({
  hearth_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  // A personal_sign signature is 65 bytes (132 chars); 1000 leaves room for smart-wallet
  // signatures without accepting an unbounded string.
  signature: z.string().max(1000).regex(/^0x[a-fA-F0-9]+$/),
  // https only, like the Hearth links: bare .url() accepts javascript: and data:.
  logo_uri: httpsUrl.optional(),
  bio: z.string().max(2000).optional(),
  website_url: httpsUrl.optional(),
  twitter_url: httpsUrl.optional(),
  telegram_url: httpsUrl.optional(),
});

// "Join the team" on a Spark: name required, wallet on Base (0x + 40 hex), handle optional.
export const joinTeamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  name: z.string().trim().min(1).max(60),
  wallet: z.string().trim().regex(/^0x[0-9a-fA-F]{40}$/, "wallet must be a 0x address"),
  handle: z.string().trim().max(60).optional(),
  // Where the sign-up came from: "zao" is the /zao page's team list, "apply" is the
  // public "apply to the Sparkz team" form (Zaal, 2026-11-19). Stored in team_signups.source.
  source: z.enum(["zao", "apply"]).optional(),
});

// POST /api/capsules/approve - the admin review decision on a self-serve Hearth.
// The admin pages send "approve" or "reject"; anything else is a 400, not a silent approve.
export const approveHearthSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "reject"]).optional(),
});

// Sparks: an event on a Hearth (migration 0008). The database checks the same rules; these
// give the caller a readable 400 instead of a constraint error.
export const SPARK_KINDS = ["moment", "token", "nft", "bounty", "event"] as const;
export const SPARK_STATUSES = ["planned", "live", "ended", "cancelled"] as const;
export const SPARK_GOAL_METRICS = ["backers", "boosts", "receipts"] as const;

const sparkFields = {
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(SPARK_STATUSES).optional(),
  goal_metric: z.enum(SPARK_GOAL_METRICS).nullable().optional(),
  goal_target: z.number().int().positive().max(1_000_000).nullable().optional(),
  starts_at: z.string().datetime({ offset: true }).nullable().optional(),
  ends_at: z.string().datetime({ offset: true }).nullable().optional(),
  link: httpsUrl.nullable().optional(),
  chain_ref: z
    .object({
      chain_id: z.number().int().positive().optional(),
      contract: z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),
      tx: z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),
    })
    .strict()
    .optional(),
  receipt_id: z.string().uuid().nullable().optional(),
};

type SparkShape = {
  goal_metric?: string | null;
  goal_target?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

// A goal is a metric and a target together, or neither; an end date comes after the start.
function sparkRulesOk(v: SparkShape): boolean {
  const hasMetric = v.goal_metric != null;
  const hasTarget = v.goal_target != null;
  if (hasMetric !== hasTarget) return false;
  if (v.starts_at && v.ends_at && Date.parse(v.ends_at) <= Date.parse(v.starts_at)) return false;
  return true;
}
const SPARK_RULES_MESSAGE = "a goal needs both a metric and a target, and ends_at must be after starts_at";

export const lightSparkSchema = z
  .object({
    hearth_id: z.string().uuid(),
    kind: z.enum(SPARK_KINDS),
    ...sparkFields,
  })
  .strict()
  .refine(sparkRulesOk, SPARK_RULES_MESSAGE);

export const editSparkSchema = z
  .object({
    id: z.string().uuid(),
    kind: z.enum(SPARK_KINDS).optional(),
    ...sparkFields,
    title: sparkFields.title.optional(),
  })
  .strict()
  .refine(sparkRulesOk, SPARK_RULES_MESSAGE);
