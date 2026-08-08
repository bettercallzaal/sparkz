-- 0005: rename the core unit Capsule -> Hearth (research doc 2251).
--
-- Tables:  capsules -> hearths, capsule_backers -> hearth_backers,
--          capsule_plugins -> hearth_spokes.
-- Column:  capsule_id -> hearth_id on every child table.
--
-- Postgres carries foreign keys, constraints, indexes, triggers, and RLS with the
-- table automatically, and a column rename updates every reference to it (FKs, the
-- unique(capsule_id, plugin_id), etc.). Index + trigger NAMES are renamed cosmetically
-- for consistency. The whole thing is one transaction: if any step fails it rolls back,
-- so it is safe to run - but run it ONCE (re-running a completed rename will error
-- because the old names no longer exist).
--
-- IMPORTANT (deploy order): apply this FIRST, then merge the matching code change
-- (which switches .from("capsules") -> .from("hearths") etc.). Between the two there is
-- a brief window where the live code and the DB names disagree; on a pre-launch app with
-- no traffic that is fine.

begin;

-- 1. Rename the tables.
alter table capsules        rename to hearths;
alter table capsule_backers rename to hearth_backers;
alter table capsule_plugins rename to hearth_spokes;

-- 2. Rename the foreign-key column capsule_id -> hearth_id on every child table.
alter table hearth_backers rename column capsule_id to hearth_id;
alter table signals        rename column capsule_id to hearth_id;
alter table signal_drafts  rename column capsule_id to hearth_id;
alter table meme_receipts  rename column capsule_id to hearth_id;
alter table hearth_spokes  rename column capsule_id to hearth_id;

-- 3. Rename indexes to match (cosmetic; guarded so a differently-named index won't fail).
alter index if exists capsules_owner_wallet_idx   rename to hearths_owner_wallet_idx;
alter index if exists capsules_owner_fid_idx       rename to hearths_owner_fid_idx;
alter index if exists capsules_type_idx            rename to hearths_type_idx;
alter index if exists capsule_backers_capsule_idx  rename to hearth_backers_hearth_idx;
alter index if exists capsule_backers_provider_idx rename to hearth_backers_provider_idx;
alter index if exists signals_capsule_idx          rename to signals_hearth_idx;
alter index if exists signal_drafts_capsule_idx    rename to signal_drafts_hearth_idx;
alter index if exists meme_receipts_capsule_idx    rename to meme_receipts_hearth_idx;
alter index if exists capsule_plugins_capsule_idx  rename to hearth_spokes_hearth_idx;

-- 4. Rename the updated_at triggers to match (cosmetic).
alter trigger capsules_set_updated_at on hearths rename to hearths_set_updated_at;
alter trigger capsule_backers_set_updated_at on hearth_backers rename to hearth_backers_set_updated_at;

commit;

-- Tell the Supabase API layer (PostgREST) to reload its schema cache so the renamed
-- tables + columns are visible to the app immediately.
notify pgrst, 'reload schema';
