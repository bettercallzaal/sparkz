-- Sparkz Milestone 1: the Capsule foundation.
-- Every project is a Capsule (not a coin). This lays the moat: capsules +
-- backers + signals + the 3 AI drafts + Meme Receipts. Types via CHECK (not pg
-- enum) so a new type/status/provider is a plain migration, not an enum surgery.
-- RLS is ON for every table with NO anon policies: all writes/reads go through
-- the server with the service-role key (which bypasses RLS). Granular public
-- read policies get added per-surface as the UI needs them.

create extension if not exists "pgcrypto";

-- updated_at auto-touch --------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- capsules ---------------------------------------------------------------------
-- One table, all 4 entry points. `metadata` holds type-specific fields with no
-- schema churn: oss -> {repo_url, contributors, audit_result}; culture -> scene
-- fields; meme -> lineage. `economic_config` holds the coin knobs (1/1/98,
-- 0xSplits addr, Clanker/Empire refs) once/if a Capsule graduates.
create table capsules (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  type            text not null check (type in ('creator','culture','oss','meme')),
  name            text not null,
  bio             text,
  owner_wallet    text,          -- one owner can run MANY capsules (no 1:1)
  owner_fid       bigint,
  status          text not null default 'spark'
                    check (status in ('spark','tokenized','dormant')),
  economic_config jsonb not null default '{}'::jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index capsules_owner_wallet_idx on capsules(owner_wallet);
create index capsules_owner_fid_idx    on capsules(owner_fid);
create index capsules_type_idx         on capsules(type);
create trigger capsules_set_updated_at before update on capsules
  for each row execute function set_updated_at();

-- capsule_backers --------------------------------------------------------------
-- Pre-token "spark" backing. Provider-agnostic so value can settle off-chain
-- (provider='ledger', chain null) OR on-chain (clanker/bankr/privy/empire...)
-- into the SAME table -> the moat stays unified regardless of where it settles.
create table capsule_backers (
  id            uuid primary key default gen_random_uuid(),
  capsule_id    uuid not null references capsules(id) on delete cascade,
  backer_kind   text not null check (backer_kind in ('wallet','fid','user')),
  backer_id     text not null,
  kind          text not null check (kind in ('collectable','backing','boost')),
  amount_or_qty numeric not null default 0,
  unit          text,                       -- 'USD','credits', token symbol...
  provider      text not null default 'ledger',  -- ledger|clanker|bankr|privy|empire...
  provider_ref  text,                       -- txhash / external id
  chain         text,                       -- null for off-chain ledger
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index capsule_backers_capsule_idx  on capsule_backers(capsule_id);
create index capsule_backers_provider_idx on capsule_backers(provider);
create trigger capsule_backers_set_updated_at before update on capsule_backers
  for each row execute function set_updated_at();

-- signals ----------------------------------------------------------------------
-- A flagged cultural moment. `source` is free text (+ source_meta), NOT a 2-value
-- enum, so the SignalSource adapter can add human/zol/farcaster/alpha_radar
-- without a migration. `approved_via` records WHICH channel approved (discord,
-- in_app, telegram) for the redundant multi-channel ApprovalRouter.
create table signals (
  id            uuid primary key default gen_random_uuid(),
  capsule_id    uuid not null references capsules(id) on delete cascade,
  source        text not null default 'human',   -- human|zol|farcaster|alpha_radar...
  source_meta   jsonb not null default '{}'::jsonb,
  text          text not null,
  why_it_matched text,
  status        text not null default 'flagged'
                  check (status in ('flagged','drafted','approved','published','rejected')),
  flagged_by    text,
  approver      text,
  approved_via  text,                            -- discord|in_app|telegram...
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index signals_capsule_idx on signals(capsule_id);
create index signals_status_idx  on signals(status);
create trigger signals_set_updated_at before update on signals
  for each row execute function set_updated_at();

-- signal_drafts ----------------------------------------------------------------
-- The 3 Capsule-grounded AI drafts per signal. All 3 kept: the 2 rejected drafts
-- + reject_reason ARE moat data (what the human passed on and why = training
-- signal). `chosen` flags the winner. Cheap-model provenance (model, prompt_ver)
-- so we can later learn which model/prompt wins.
create table signal_drafts (
  id             uuid primary key default gen_random_uuid(),
  signal_id      uuid not null references signals(id) on delete cascade,
  capsule_id     uuid not null references capsules(id) on delete cascade,
  model          text,                 -- cheap tier model id (OpenRouter/Ollama)
  prompt_version text,
  draft_text     text not null,
  rank           int,                  -- 1..3 display order
  chosen         boolean not null default false,
  approver       text,
  reject_reason  text,                 -- why the human passed (moat)
  created_at     timestamptz not null default now()
);
create index signal_drafts_signal_idx  on signal_drafts(signal_id);
create index signal_drafts_capsule_idx on signal_drafts(capsule_id);
create index signal_drafts_chosen_idx  on signal_drafts(chosen);

-- meme_receipts ----------------------------------------------------------------
-- THE data moat. One per approved+published response (the campaign record).
-- versions/remixes/contributors are jsonb, empty at m1, filled by the m2 Swarm.
-- parent_meme_id = meme lineage. reach/referrals/backing_generated are the
-- measurable outcomes that only exist post-publish.
create table meme_receipts (
  id                uuid primary key default gen_random_uuid(),
  capsule_id        uuid not null references capsules(id) on delete cascade,
  signal_id         uuid references signals(id) on delete set null,       -- original_signal
  chosen_draft_id   uuid references signal_drafts(id) on delete set null,
  why_it_matched    text,
  creator           text,
  approver          text,
  source_assets     jsonb not null default '[]'::jsonb,
  parent_meme_id    uuid references meme_receipts(id) on delete set null, -- lineage
  versions          jsonb not null default '[]'::jsonb,
  remixes           jsonb not null default '[]'::jsonb,   -- m2 Swarm
  contributors      jsonb not null default '[]'::jsonb,   -- m2 Swarm
  reach             bigint not null default 0,
  referrals         bigint not null default 0,
  backing_generated numeric not null default 0,
  rewards           jsonb not null default '{}'::jsonb,
  lessons           text,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index meme_receipts_capsule_idx on meme_receipts(capsule_id);
create index meme_receipts_signal_idx  on meme_receipts(signal_id);
create index meme_receipts_parent_idx  on meme_receipts(parent_meme_id);
create trigger meme_receipts_set_updated_at before update on meme_receipts
  for each row execute function set_updated_at();

-- RLS: on everywhere, deny anon by default. Server (service role) bypasses RLS.
alter table capsules        enable row level security;
alter table capsule_backers enable row level security;
alter table signals         enable row level security;
alter table signal_drafts   enable row level security;
alter table meme_receipts   enable row level security;
