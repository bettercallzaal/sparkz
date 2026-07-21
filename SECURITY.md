# Sparkz - security posture

Sparkz is a public, forkable OSS product on a live Supabase/Postgres DB. This is
the DB + data-access checklist every change is held to. Status is for Milestone 1.

| # | Control | Status | Where |
|---|---------|--------|-------|
| 1 | RLS ON every table; RLS-on + no-policy = deny-all to anon/authenticated (service role only) | DONE | `0001_capsule_foundation.sql` enables RLS on all 5 tables, zero policies. Advisor shows only INFO `rls_enabled_no_policy` (the intended lockdown). |
| 2 | Service-role key is server-only; never `NEXT_PUBLIC`, never in a `"use client"` file, never in a response | DONE | `SUPABASE_SERVICE_ROLE_KEY` used only in `src/lib/supabase/server.ts` + `scripts/seed-zoostr.mjs`. No client import; anon key is the only client-side key. |
| 3 | Two clients not mixed; service client bypasses RLS so every route using it does its own authz | DONE (operator-level) | m1 has no client-side DB client at all - all access is server-side. Mutating routes call `requireAdmin()` (`src/lib/auth.ts`) before touching the service client. Per-creator owner-scoping is item 4. |
| 4 | Least privilege: owner-scoped writes, never `using(true)`; backing + receipts append-only | PARTIAL | Backing + receipts are append-only (no update/delete routes exist). Writes are operator-gated. Per-creator, owner-scoped writes (`owner_wallet`/`owner_fid` = caller) require real user auth (Farcaster SIWF / wallet) - a tracked follow-up before multi-tenant use. No `using(true)` policy exists (no policies exist). |
| 5 | Zod-validate every input before the DB, even server-side | DONE | Every route `safeParse`s (`src/lib/validation/schemas.ts`); enums mirror the CHECK constraints. |
| 6 | No raw SQL from user input; query builder or parameterized RPC only | DONE | All app DB access uses `.eq/.insert/.update` object args. No string-concatenated SQL in `src/`. |
| 7 | `.env.local` gitignored; public repo ships only `.env.example` stubs; secret scan before PR | DONE | `.gitignore` covers `.env*`; `.env.local` untracked; secret scan over tracked files is clean. Service_role set via a hidden terminal prompt, never through chat. |
| 8 | Run Supabase Advisors after migration; fix findings | DONE | `get_advisors(security)` re-run post-changes: only the intended INFO notices, no ERROR/WARN. `updated_at` function `search_path` pinned. |
| 9 | No secrets / PII in `jsonb` (`metadata`, `economic_config`) - they're queryable | DONE | Seed + code store only non-sensitive config (economics model, rail, flags). Enforced by convention + review. |
| 10 | One route = one specific validated operation; no generic "run any query" endpoint | DONE | Each route is a single typed op (create capsule, flag signal, approve, back, read receipts). No passthrough SQL endpoint. |

## Follow-ups (before multi-tenant / public write access)

- Real user auth (Farcaster SIWF / wallet) so writes are owner-scoped per creator
  (item 4), replacing the single operator token.
- Narrow public-read RLS SELECT policies when a public client reads capsules /
  receipts directly (today public reads go through server routes, not a client).
