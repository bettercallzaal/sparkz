# Sparkz - local setup (Milestone 1: the Capsule foundation)

Next.js (App Router) + Supabase + Tailwind + TypeScript. The moat is the data:
Capsules + Meme Receipts. This milestone ships the Capsule schema, the three
adapter seams, the flag -> 3-drafts -> approve loop, and the Zoostr Capsule.

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

## 3. Apply the migration

The schema lives in `supabase/migrations/0001_capsule_foundation.sql`. Apply it
to the Sparkz project via the Supabase SQL editor (paste the file) or the
Supabase CLI (`supabase db push` once the project is linked).

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

- `/` - Capsule list.
- `/admin` - the Meme Engine loop: flag a moment -> 3 Capsule-grounded drafts ->
  approve one -> a Meme Receipt is written. Deep-linkable: `/admin?capsule=<id>`.

## The three adapter seams (why this doesn't need a rebuild later)

- **SignalSource** (`src/lib/adapters/signal-source`) - trend source. m1: `human`.
  Later: farcaster, alpha_radar - same `detectSignals(capsuleId)` contract.
- **BackingProvider** (`src/lib/adapters/backing-provider`) - where value settles.
  m1: `ledger` (off-chain). Later: eliza, bankr (on-chain), clanker / empire
  (tokenization) - same table, unified moat.
- **ApprovalChannel** (`src/lib/adapters/approval-channel`) - where the human
  approves. m1: `in_app` + `discord`. Router fans out to all; first-approve-wins.
