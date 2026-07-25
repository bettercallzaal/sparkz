-- Guard the core loop against a double-publish race.
--
-- POST /api/signals/approve is fanned out across redundant approval channels
-- (in-app + Discord), so two approvals for the same signal can arrive
-- concurrently. The app-level idempotency check (signal.status === 'published')
-- only helps AFTER the first write commits; two requests that both read
-- status='drafted' before either commits will BOTH insert a meme_receipt for the
-- same signal - a corrupted ledger (the Meme Receipt is meant to be one-per-signal).
--
-- This partial unique index makes the DB the source of truth: the second concurrent
-- insert fails with a unique violation (SQLSTATE 23505) instead of duplicating.
-- signal_id is nullable (receipts can outlive a deleted signal via ON DELETE SET
-- NULL), so scope the constraint to non-null rows - multiple historical NULLs stay
-- legal, live signals stay unique.
--
-- NOTE: with this in place, the losing concurrent request currently returns a 500.
-- Follow-up (app-side): catch 23505 in the approve route and return the existing
-- receipt so the loser gets the same idempotent 200 as a late duplicate.

create unique index if not exists meme_receipts_signal_unique
  on meme_receipts (signal_id)
  where signal_id is not null;
