-- Team sign-ups: "Join the team" on a Spark (Zaal, 1 Nov 2026: get Sparkz up so wallet
-- addresses can sign up to be on the team / whitelist, and build the initial community).
--
-- One row per wallet per Hearth. A name is required (Zaal: "minimum they need a name"),
-- the handle is optional. Public insert-only through a single validated server route
-- (/api/team); reads are operator-only. RLS on, no anon policies, same as waitlist.
-- ip_hash is the salted hash from lib/rate-limit, never a raw address.

create table if not exists team_signups (
  id          uuid primary key default gen_random_uuid(),
  hearth_id   uuid not null references hearths(id) on delete cascade,
  name        text not null,
  wallet      text not null,                -- 0x + 40 hex, lower-cased by the route
  handle      text,                         -- Farcaster or X handle, optional
  source      text not null default 'zao',
  ip_hash     text,
  created_at  timestamptz not null default now(),
  unique (hearth_id, wallet)
);
create index if not exists team_signups_hearth_idx on team_signups(hearth_id, created_at);
create index if not exists team_signups_ip_idx on team_signups(ip_hash, created_at);

alter table team_signups enable row level security;
