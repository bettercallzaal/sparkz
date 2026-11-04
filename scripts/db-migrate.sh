#!/usr/bin/env bash
# Applies every supabase/migrations/*.sql that has not been applied yet, in name order,
# each in its own transaction together with its record in public._sparkz_migrations. Runs in the
# db workflow (.github/workflows/db.yml) with psql; no Supabase CLI, no new npm dependency.
#
# Baseline: 0001-0005 were pasted into the SQL editor by hand before this runner existed,
# so the first run records them as applied without re-running them. Raise BASELINE only
# after pasting a migration by hand (Zaal, 3 Nov 2026: "find the best way for you to run
# sqls" - from here on, merge the PR and this runs).
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is not set (Supabase > Project settings > Database > connection string, session pooler)}"
BASELINE="${SPARKZ_DB_BASELINE:-0005}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/supabase/migrations"

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
create table if not exists public._sparkz_migrations (
  name text primary key,
  applied_at timestamptz not null default now(),
  baseline boolean not null default false
);
alter table public._sparkz_migrations enable row level security;
SQL

applied="$(psql "$SUPABASE_DB_URL" -At -c "select name from public._sparkz_migrations")"

for file in "$DIR"/*.sql; do
  name="$(basename "$file" .sql)"
  if grep -qx "$name" <<<"$applied"; then
    echo "skip    $name (applied)"
    continue
  fi
  if [[ "${name%%_*}" < "$BASELINE" || "${name%%_*}" == "$BASELINE" ]]; then
    echo "baseline $name (applied by hand before the runner)"
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -c "insert into public._sparkz_migrations(name, baseline) values ('$name', true)"
    continue
  fi
  echo "apply   $name"
  # Apply and record in ONE transaction: a crash between the two can never leave a
  # migration applied but unrecorded (which would re-apply it on the next run).
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q --single-transaction -f "$file" \
    -c "insert into public._sparkz_migrations(name) values ('$name')"
done
echo "migrations: done"
