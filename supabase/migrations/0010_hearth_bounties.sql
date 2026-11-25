-- DRAFT, kept as .sql.draft so scripts/db-migrate.sh (which globs *.sql) never applies it. To ship:
-- Zaal approves, run it on a scratch Neon branch, then rename to 0010_hearth_bounties.sql in its own
-- held PR (merging a .sql file IS the Production apply, .github/workflows/db.yml).
--
-- hearth_bounties: links a poidh bounty on Base to a Hearth (a bounty is a Spark
-- opportunity on the Hearth). The money and the bounty text live on-chain in poidh's
-- contract; this row only records WHICH bounty belongs to WHICH Hearth, so Sparkz can read
-- the live state (funding, claims, vote) from Base. Sparkz never holds funds or a key.
--
-- Written only by POST /api/hearth-bounties, after the server re-reads the Base receipt for
-- tx_hash and confirms the owner's wallet created the bounty on the poidh contract.
-- Additive: no existing table or row changes. RLS on, no anon policies: all access goes
-- through validated server routes, like every other table.

create table if not exists hearth_bounties (
  id               uuid primary key default gen_random_uuid(),
  hearth_id        uuid not null references hearths(id) on delete cascade,
  chain            text not null default 'base' check (chain = 'base'),
  contract_address text not null check (contract_address ~ '^0x[0-9a-fA-F]{40}$'),
  bounty_id        numeric(78,0) not null check (bounty_id >= 0),
  issuer_address   text not null check (issuer_address ~ '^0x[0-9a-fA-F]{40}$'),
  tx_hash          text not null check (tx_hash ~ '^0x[0-9a-fA-F]{64}$'),
  created_at       timestamptz not null default now(),
  constraint hearth_bounties_tx_unique unique (tx_hash),
  constraint hearth_bounties_chain_bounty_unique unique (chain, contract_address, bounty_id)
);

create index if not exists hearth_bounties_hearth_idx on hearth_bounties(hearth_id, created_at desc);

alter table hearth_bounties enable row level security;

-- Tell the Supabase API layer (PostgREST) to reload its schema cache, as 0008 and 0009 do.
-- On Neon nothing listens and the notify is a no-op.
notify pgrst, 'reload schema';
