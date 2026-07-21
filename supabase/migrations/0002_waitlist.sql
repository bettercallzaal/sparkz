-- Sparkz waitlist: the "Join Sparkz" capture on the trysparkz.com landing.
-- Public insert-only (anyone can join); reads are operator-only. RLS on; the
-- public join goes through a single validated server route (no client write).

create table waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  ref           text,                 -- referrer / campaign
  interest      text,                 -- what they want (creator, culture, oss, backer...)
  source        text not null default 'landing',
  created_at    timestamptz not null default now()
);
create index waitlist_created_idx on waitlist(created_at);

alter table waitlist enable row level security;
