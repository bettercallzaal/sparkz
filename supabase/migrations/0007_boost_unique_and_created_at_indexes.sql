-- Backend review 2026-11-19 (Zaal: "Fix butsnyesb", fix the bugs, yes to the schema changes).
--
-- 1. One boost per backer per Hearth, enforced by the database. boost/route.ts checked for an
--    existing row and then inserted, so two taps at once could both insert. The route now
--    treats this index's 23505 as "already boosted".
--    If duplicate boosts already exist, this migration stops with an error and changes
--    nothing (each migration runs in one transaction, scripts/db-migrate.sh). Nothing is
--    deleted here: removing the extra rows is a human call. Find them with
--      select hearth_id, backer_id, count(*) from hearth_backers
--      where kind = 'boost' group by 1, 2 having count(*) > 1;
do $$
begin
  if exists (
    select 1 from hearth_backers where kind = 'boost'
    group by hearth_id, backer_id having count(*) > 1
  ) then
    raise exception 'duplicate boosts exist in hearth_backers; resolve them before 0007 (query in the file header)';
  end if;
end $$;

create unique index if not exists hearth_backers_boost_unique
  on hearth_backers(hearth_id, backer_id) where kind = 'boost';

-- 2. Indexes for the newest-first reads: directory, activity, capsules and by-fid order
--    hearths by created_at; activity, me/backings and backers-owner order hearth_backers
--    by created_at within a kind.
create index if not exists hearths_created_idx on hearths(created_at desc);
create index if not exists hearth_backers_kind_created_idx on hearth_backers(kind, created_at desc);
