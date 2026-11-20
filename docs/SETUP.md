# Sparkz - local setup (Milestone 1: the Hearth foundation)

Next.js (App Router) + Supabase + Tailwind + TypeScript. This milestone ships the
Hearth schema, the adapter seams, free boosts, Sparks, and the Zoostr Hearth.

## 1. Install

```bash
npm install
```

## 2. Env

```bash
cp .env.example .env.local
```

Fill, at minimum, the Sparkz Supabase project (its OWN dedicated project - not
cowork/ZAOOS):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never sent to the browser)
- `SPARKZ_SESSION_SECRET` - signs the session cookie minted after a verified
  sign-in (the service client bypasses RLS, so routes authz against that session).
  Generate: `openssl rand -hex 32`. Fails closed if unset (no sign-in, no writes).

## 3. Apply the migrations

Migrations live in `supabase/migrations/` (numbered, applied in order). Since 3 Nov 2026
they run themselves: the **Database** workflow (`.github/workflows/db.yml`) applies every
migration not yet recorded in `public._sparkz_migrations`, then runs the ZAO seed, on every
merge to main that touches them (or from the Actions tab, Run workflow). It needs three
secrets, set once in the **Production** environment (Settings > Environments > Production),
never as repository secrets: `SUPABASE_DB_URL` (Project settings > Database > connection
string, session pooler), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. The
environment must have Zaal as its only required reviewer and deployment branches limited to
`main`, and the `Main` branch ruleset must be turned on, so no job (and no branch copy of the
workflow) reaches the database without his approval. Migrations
0001-0005 were pasted by hand before the runner existed and are recorded as a baseline on
the first run (`scripts/db-migrate.sh`). Pasting a file into the SQL editor still works for a
one-off; then raise `SPARKZ_DB_BASELINE` so the runner does not apply it twice.

RLS is ON for every table with NO anon policies: all access is server-side via
the service-role key. Add granular public-read policies per surface as needed.

## 4. Seed Zoostr

```bash
npm run seed:zoostr
```

## 5. Run

```bash
npm run dev
```

- `/` - Hearth list.
- `/admin` - the operator console (admin sign-in required).

## The adapter seams (why this doesn't need a rebuild later)

- **BackingProvider** (`src/lib/adapters/backing-provider`) - where value settles.
  m1: `ledger` (off-chain). Later: eliza, bankr (on-chain), clanker / empire
  (tokenization) - same table.
- **Connector** (`src/lib/adapters/connector`) - the generic spoke any vendor tool
  plugs into.
