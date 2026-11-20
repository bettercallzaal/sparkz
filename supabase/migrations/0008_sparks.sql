-- Sparks: an event on a Hearth (Zaal, 18-19 Nov 2026: "the Hearth is a fireplace and each
-- Spark is a log tossed on it"; "go for it" on the plan, vault
-- notes/sparkz-sparks-table-plan-2026-11-19.md). A launch moment, a token, an NFT drop, a
-- bounty or an event. Sparkz does not mint: a token or NFT made elsewhere is referenced by
-- an https link and an optional chain_ref.
--
-- Additive: no existing table or row changes. hearths.status keeps its values; the UI
-- label changes separately. Kinds and statuses are text + check (not an enum), so a new
-- one is a one-line migration, the same pattern as 0001.
--
-- RLS on, no anon policies: reads and writes go through validated server routes
-- (/api/sparks), like every other table.

create table if not exists sparks (
  id              uuid primary key default gen_random_uuid(),
  hearth_id       uuid not null references hearths(id) on delete cascade,
  kind            text not null check (kind in ('moment','token','nft','bounty','event')),
  title           text not null check (char_length(title) between 1 and 120),
  body            text check (body is null or char_length(body) <= 2000),
  status          text not null default 'planned'
                    check (status in ('planned','live','ended','cancelled')),
  goal_metric     text check (goal_metric is null or goal_metric in ('backers','boosts','receipts')),
  goal_target     integer,
  starts_at       timestamptz,
  ends_at         timestamptz,
  link            text check (link is null or link like 'https://%'),
  chain_ref       jsonb not null default '{}'::jsonb,
  receipt_id      uuid references meme_receipts(id) on delete set null,
  created_by_fid  bigint,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint sparks_goal_pair check (
    (goal_metric is null and goal_target is null)
    or (goal_metric is not null and goal_target is not null and goal_target > 0)
  ),
  constraint sparks_dates check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index if not exists sparks_hearth_created_idx on sparks(hearth_id, created_at desc);

alter table sparks enable row level security;

-- updated_at follows every change, through the same set_updated_at() as the other tables (0001).
drop trigger if exists sparks_set_updated_at on sparks;
create trigger sparks_set_updated_at before update on sparks
  for each row execute function set_updated_at();

-- Tell the Supabase API layer (PostgREST) to reload its schema cache so the new table is
-- visible at once, as 0005 does. On Neon nothing listens and the notify is a no-op.
notify pgrst, 'reload schema';
