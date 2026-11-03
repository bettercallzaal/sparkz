# Sparkz - local setup (Milestone 1: the Hearth foundation)

Next.js (App Router) + Supabase + Tailwind + TypeScript. The moat is the data:
Hearths + Meme Receipts. This milestone ships the Hearth schema, the three
adapter seams, the flag -> 3-drafts -> approve loop, and the Zoostr Hearth.

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
- `SPARKZ_ADMIN_TOKEN` - gates the write routes (the service client bypasses RLS,
  so the routes authz against this). Generate: `openssl rand -hex 24`. Fails closed
  if unset (no writes allowed). In `/admin`, click Unlock and paste it once.

Optional:

- `OPENROUTER_API_KEY` (+ `OPENROUTER_MODEL`) - the cheap tier for the 3 drafts.
  Without it the Meme Engine returns clearly-labelled `[fallback]` drafts so the
  loop is still testable end-to-end.
- `DISCORD_WEBHOOK_URL` - turns the Discord approval channel on (dark until set).

## 3. Apply the migrations

Migrations live in `supabase/migrations/` (numbered, applied in order). Since 3 Nov 2026
they run themselves: the **Database** workflow (`.github/workflows/db.yml`) applies every
migration not yet recorded in `public._sparkz_migrations`, then runs the ZAO seed, on every
merge to main that touches them (or from the Actions tab, Run workflow). It needs three repo
secrets, set once: `SUPABASE_DB_URL` (Project settings > Database > connection string,
session pooler), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Migrations
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
- `/admin` - the Meme Engine loop: flag a moment -> 3 Hearth-grounded drafts ->
  approve one -> a Meme Receipt is written. Deep-linkable: `/admin?hearth=<id>`.

## The three adapter seams (why this doesn't need a rebuild later)

- **SignalSource** (`src/lib/adapters/signal-source`) - trend source. m1: `human`.
  Later: farcaster, alpha_radar - same `detectSignals(hearthId)` contract.
- **BackingProvider** (`src/lib/adapters/backing-provider`) - where value settles.
  m1: `ledger` (off-chain). Later: eliza, bankr (on-chain), clanker / empire
  (tokenization) - same table, unified moat.
- **ApprovalChannel** (`src/lib/adapters/approval-channel`) - where the human
  approves. m1: `in_app` + `discord`. Router fans out to all; first-approve-wins.
