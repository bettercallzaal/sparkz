#!/usr/bin/env bash
# Decides whether the Database workflow's seed step runs. Prints "run", or "skip: <reason>".
# Exits 1 (red) when no database is configured, so a run that seeded nothing never looks green.
#
#   Neon (SPARKZ_DATABASE_URL set): seed ONLY on a manual run (workflow_dispatch) with the
#     seed box ticked. Never on a push: the copy from Supabase must land before the seed, or
#     the ZAO Hearths get new ids and the copied backings no longer match them (seat-misc,
#     #378). A push-triggered seed would race that copy.
#   Supabase (no Neon secret): unchanged, seed on push and on a ticked manual run.
#
# Inputs (env): SPARKZ_DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EVENT (github.event_name),
#               SEED_INPUT ("true" when the manual run's seed box is ticked).
# Tested by src/lib/db/seed-gate.test.ts.
set -euo pipefail

if [[ -n "${SPARKZ_DATABASE_URL:-}" ]]; then
  if [[ "${EVENT:-}" == "workflow_dispatch" && "${SEED_INPUT:-}" == "true" ]]; then
    echo "run"
  else
    echo "skip: on Neon the seed runs only from a manual run with seed ticked (event ${EVENT:-unknown})"
  fi
  exit 0
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "Neither SPARKZ_DATABASE_URL (Neon) nor SUPABASE_SERVICE_ROLE_KEY is set: seed not run" >&2
  exit 1
fi

if [[ "${EVENT:-}" == "push" || "${SEED_INPUT:-}" == "true" ]]; then
  echo "run"
else
  echo "skip: seed box not ticked"
fi
