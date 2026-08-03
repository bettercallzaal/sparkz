-- Per-Capsule plugin toggles - the control plane that lets each Capsule turn
-- capabilities on/off and connect to ITS OWN communities (its Discord, its Farcaster
-- channel, its Telegram) instead of one global config.
--
-- Design: a row exists only when a Capsule OVERRIDES a default. No rows for a Capsule
-- = every built-in plugin enabled with global/default config (backward compatible - the
-- migration changes nothing for existing Capsules until a toggle is set). `config` holds
-- per-Capsule settings (e.g. this Capsule's Discord webhook, its channel id); secrets
-- here are server-only and must never be exposed through a public read path.
--
-- RLS on, no anon policies - written only through the admin-gated toggle API, same as
-- every other table.

create table capsule_plugins (
  id          uuid primary key default gen_random_uuid(),
  capsule_id  uuid not null references capsules(id) on delete cascade,
  plugin_id   text not null,
  enabled     boolean not null default true,
  config      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (capsule_id, plugin_id)
);
create index capsule_plugins_capsule_idx on capsule_plugins(capsule_id);

alter table capsule_plugins enable row level security;
