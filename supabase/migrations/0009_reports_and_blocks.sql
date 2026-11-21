-- Report and block (Zaal, 21 Nov 2026, redesign decisions D2 and D4; App Store guideline
-- 1.2: an app with user content must let people report it and block the people who post
-- it). Two small tables, additive: no existing table or row changes.
--
-- An identity is the same text the rest of Sparkz keys people by (hearth_backers.backer_id):
-- "fid:<n>" for a Farcaster session, or a lower-cased 0x address for a wallet session. It is
-- always taken from the verified session on the server, never from a request body.
--
-- content_reports: one report per person per thing. Reports land in /admin/pending for the
-- admins only (D4); nothing is sent anywhere.
-- user_blocks: a person hides another person's Hearths and Sparks from themselves.
--
-- RLS on, no anon policies: reads and writes go through validated server routes
-- (/api/reports, /api/blocks), like every other table.

create table if not exists content_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  text not null check (char_length(reporter_id) between 5 and 64),
  target_type  text not null check (target_type in ('hearth','spark')),
  target_id    uuid not null,
  hearth_id    uuid not null references hearths(id) on delete cascade,
  reason       text not null check (reason in ('spam','abuse','ip','other')),
  note         text check (note is null or char_length(note) <= 500),
  status       text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint content_reports_once unique (reporter_id, target_type, target_id)
);

create index if not exists content_reports_status_created_idx on content_reports(status, created_at desc);
create index if not exists content_reports_hearth_idx on content_reports(hearth_id);

alter table content_reports enable row level security;

drop trigger if exists content_reports_set_updated_at on content_reports;
create trigger content_reports_set_updated_at before update on content_reports
  for each row execute function set_updated_at();

create table if not exists user_blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  text not null check (char_length(blocker_id) between 5 and 64),
  blocked_id  text not null check (char_length(blocked_id) between 5 and 64),
  created_at  timestamptz not null default now(),
  constraint user_blocks_once unique (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocker_idx on user_blocks(blocker_id);

alter table user_blocks enable row level security;

-- Tell the Supabase API layer (PostgREST) to reload its schema cache, as 0008 does. On Neon
-- nothing listens and the notify is a no-op.
notify pgrst, 'reload schema';
