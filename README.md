<p align="center">
  <img src="public/brand/sparkz-logo.gif" alt="Sparkz - start with a Hearth, grow with Sparks" width="300" />
</p>

<h1 align="center">Sparkz</h1>
<p align="center"><em>Start with a Hearth. Grow it with Sparks.</em><br/>Part of The ZAO.</p>

<p align="center">
  <a href="https://trysparkz.com">trysparkz.com</a>
  -
  <a href="#data-model">Data model</a>
  -
  <a href="#pages">Pages</a>
  -
  <a href="#api-reference">API</a>
  -
  <a href="#local-setup">Setup</a>
  -
  <a href="#documentation">Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Base-Farcaster-8a63d2" alt="Base + Farcaster" />
  <img src="https://img.shields.io/badge/status-Milestone%201-fbbf24" alt="Milestone 1" />
</p>

<p align="center">
  <a href="https://trysparkz.com/architecture"><img src="https://img.shields.io/badge/View%20the%20interactive%20architecture%20%E2%86%92-c084fc?style=for-the-badge" alt="Interactive architecture" /></a>
</p>

---

**Sparkz is where a project starts as a Hearth and grows through Sparks.** A Hearth is the project's home: its identity, the people backing it, and a record of everything it ships. A Spark is any event that grows the Hearth: a show, a drop, a release, a collab, a launch. A project can have many. Community grows through onchain actions people take together, not through buying in. Back the album.

> **TL;DR** Every section below opens with a one-line TL;DR, so you can skim the whole thing top to bottom in a minute. Read the bold lines; dive into any section that catches you.

## New here? Start with this

> **TL;DR** Sparkz is for creators, no code needed. Open a Hearth, grow it with Sparks, and let the record of what you do together speak.

**Sparkz is for creators - artists, musicians, writers, builders - and the people around them. You do not need to code to use it, or to help.**

Here is the whole idea in plain words: you open a **Hearth** - a home for your project that holds your identity, the people backing you, and a record of everything you have made. Then you grow it with **Sparks**: events that bring people in, like a show, a drop, a release or a collab. Every action people take around your work adds to the record, and the record is what grows.

<p align="center">
  <a href="https://trysparkz.com"><img src="https://img.shields.io/badge/Try%20Sparkz%20%E2%86%92-fbbf24?style=for-the-badge" alt="Try Sparkz" /></a>
  &nbsp;
  <a href="https://trysparkz.com/demo"><img src="https://img.shields.io/badge/See%20how%20it%20works-c084fc?style=for-the-badge" alt="See how it works" /></a>
</p>

- **Support** - people can boost your work for free, no wallet needed to start.
- **Connect** - your project gets a Farcaster home and a community that shows up.
- **Build** - grow the Hearth with Sparks: a moment, a token, an NFT drop, a bounty, an event.

<!-- DEMO GIF SLOT: record a 20-30s screen capture of trysparkz.com
     (open a Hearth -> boost -> light a Spark -> share), save it as
     docs/assets/demo.gif, and replace this comment with:
     <p align="center"><img src="docs/assets/demo.gif" alt="Sparkz in 30 seconds" width="100%" /></p> -->

Not sure what a word means? Every coined term is defined in plain English in the [Glossary](#glossary). Want to help without writing code? See [Contribute without coding](CONTRIBUTING.md#contribute-without-coding).

## Contents

> **TL;DR** Jump straight to the idea, the product, the implementation, or the open questions.

- [New here? Start with this](#new-here-start-with-this)
- [Glossary](#glossary)
- [The idea](#the-idea)
- [Why it's different](#why-its-different)
- [No lock-in, by design](#no-lock-in-by-design)
- [How Sparkz compares](#how-sparkz-compares)
- [The Hearth](#the-hearth)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Adapter seams](#adapter-seams)
- [Integrations](#integrations)
- [Pages](#pages)
- [API reference](#api-reference)
- [Tech stack](#tech-stack)
- [Repo layout](#repo-layout)
- [Local setup](#local-setup)
- [Deploy](#deploy)
- [Security](#security)
- [The four anti-failure gates](#the-four-anti-failure-gates)
- [Roadmap](#roadmap)
- [Still fluid - help us decide](#still-fluid---help-us-decide)
- [Documentation](#documentation)
- [Principles](#principles)
- [Provenance](#provenance)

## Glossary

> **TL;DR** Every coined word on this page, in plain English - start here if a term trips you up.

Plain-language definitions. If a coined word shows up anywhere and you are not sure what it means, it is here.

| Term | In plain words |
| --- | --- |
| **Spark** | An event that grows a Hearth: a show, a drop, a release, a collab, a launch. A Hearth can have many. |
| **Hearth** | Your project's home base on Sparkz - its identity, its backers, and a record of what it has made. The hub of the wheel. Every project starts here. |
| **Spoke** | A tool you connect to your Hearth (a Discord, a treasury, an Audius catalog). The Hearth is the hub; each integration is a spoke. Vendors can add their own. |
| **Back / Boost** | To support a creator you believe in. Free - no wallet required to start. |
| **Farcaster** | An open social network (like Twitter, but you own your identity). Sparkz shares there first. |
| **Onchain action** | Something a person does around a project that is recorded onchain: wearing a hat, backing, attending, contributing.. Records live on Ethereum and its networks. |
| **Empire** | A shared treasury a project can set up - a shared account for its money. |
| **The ZAO** | The creator collective Sparkz is part of. |

## The idea

> **TL;DR** A project starts as a Hearth and grows through Sparks; community grows through what people do together, onchain.

Every project on Sparkz starts as a **Hearth**: a home where a community backs the work and builds a track record. It grows through **Sparks** - events that bring people in and give them something to do: a show, a drop, a release, a collab, a launch. Each action people take is recorded, onchain where it counts, so the project's history and its community grow together.

## Why it's different

> **TL;DR** Start with a Hearth, grow with Sparks, a visible boost signal, ZAO-backed quality - and the work is always the pitch.

- **Start with a Hearth.** Identity, backers, free boosts - a real record from day one.
- **Grow with Sparks.** Events are how a Hearth grows, and every one leaves a record of who showed up and what they did.
- **A boost signal.** Supporters can show up without a wallet or payment. Leaderboards and reward layers can build on that signal later.
- **Collectables on the roadmap.** Backing a creator's work will earn collectables - a v2 layer, not live today.
- **Backed by ZAO.** Not a permissionless farm. ZAO stands behind who launches, so it stays quality over hype, and takes an aligned locked stake - never a fee slice.

**The frame:** Sparkz leads with the work: **back the album.** Perks are what backers enjoy today, not promises. Community grows through onchain actions people take together.

## No lock-in, by design

> **TL;DR** Your data is yours, swap any piece, bring your own tools, any chain, leave any time.

Sparkz is built so a creator is never trapped - not in a vendor, not in a chain, not even in our own stack. The whole point is to give creators the least-friction way to build, while keeping every exit open.

- **Your data is yours.** A Hearth is an open record - identity, backers, boosts, Sparks - built on an open schema in an open-source codebase.
- **Swap any piece.** Every external system sits behind an adapter - [BackingProvider and Connector](#adapter-seams-the-spokes). Today that means ledger backing and connector spokes; new rails can slot in without a UI rewrite.
- **Bring the tools you already use.** Farcaster identity and sharing, GitHub imports, and Empire are wired today; POIDH, Hats, Lens, Bluesky and more can join through the same open approach. Sparkz is connective tissue, not a walled garden that replaces them.
- **Decentralized where it counts.** An identity you own, onchain records on Ethereum and its networks, and treasury rails you control when configured. Members sign in with a wallet or a social account. Nothing goes onchain until you choose it.

The pitch in one line: **own your work, use any tool, leave any time.**

### Integration policy

**Integrate broadly, disclose fully, let the creator choose.** Sparkz is open to any tool or partner that meets two requirements:

1. **No vendor lock-in.** A creator can understand the exit path and move their work or community without starting over.
2. **Full fee transparency.** Before a creator commits, Sparkz shows what they pay, who receives it, and what they get in return.

Sparkz puts every partner's split and benefits next to every other compatible option - never hidden.

## How Sparkz compares

> **TL;DR** Most launch tools start with something to buy; Sparkz starts with a Hearth and grows it through events and onchain actions.

|  | Typical launch flow | Sparkz |
| --- | --- | --- |
| **Starting point** | Something to buy on day one | Hearth: identity, backers, and free boosts |
| **First community action** | Buy, sell, or hold | Back, boost, wear a hat, show up |
| **How it grows** | Price | Sparks: events, and the onchain actions around them |
| **Rail choice** | The launcher's supported stack | Compare compatible providers and terms |
| **Fees** | Depend on the provider | Amount, recipient, and benefits shown before committing |
| **Portability** | Depends on the provider | Open-source core with swappable adapter seams |
| **Existing tools** | Usually centered on the launcher | Designed to connect Farcaster, GitHub, Empire, and more |

## The Hearth

> **TL;DR** Every project is a Hearth (identity + backers + free boosts). One schema, several entry points.

Every Sparkz project is a **Hearth.** The Hearth is the unit that accumulates: identity, contributors, history, content, backing, and economic config. A Spark is an event on a Hearth - a moment, a token, an NFT drop, a bounty, an event - ideally something onchain we can point to. Back the album, not a coin.

One schema, several entry points (so a new one is additive, not a rewrite):

```mermaid
flowchart LR
  Creator["Creator<br/>(Zoostr - v1 proof)"] --> Hearth
  Culture["Culture<br/>(a scene / movement)"] --> Hearth
  OSS["Open-Source repo<br/>(repo + contributors + audit)"] --> Hearth
  Hearth(("Hearth")) --> Sparks["Sparks<br/>(events: shows, drops, launches)"]
  Sparks --> Record["Onchain record<br/>(who showed up, what they did)"]
```

The Hearth type lives in `hearths.type` (`creator | culture | oss`, plus a legacy `meme` value the schema still allows); type-specific fields live in `metadata` jsonb, so a new entry point is a value, not a migration. v1 proves ONE loop with Zoostr (a Creator Hearth).

## Architecture

> **TL;DR** Server-first Next.js; secrets never reach the browser; every external system is a swappable adapter.

Server-first Next.js App Router. All privileged work runs server-side with the Supabase service-role key; the browser never sees a secret. Every external system sits behind an adapter or a thin client so it can be swapped without touching the UI.

> [View the interactive architecture](https://trysparkz.com/architecture) - step through the system map, the data model, and the adapter seams.

```mermaid
flowchart TB
  subgraph Browser
    UI["Pages: /, /start, /c/[slug], /explore,<br/>/blog, /demo, /architecture, /admin, /profile"]
  end

  subgraph Next["Next.js (App Router, server-first)"]
    Pages["Server components<br/>(read via service role)"]
    API["API routes<br/>(Zod safeParse -> try/catch -> JSON)"]
    Auth["requireAdmin<br/>(admin sign-in session)"]
  end

  subgraph Data["Supabase (RLS on every table)"]
    DB[("Postgres<br/>hearths - backers - sparks")]
    Store[("Storage<br/>logos / assets")]
  end

  subgraph Seams["Adapter registries (swappable)"]
    BP["BackingProvider"]
    CN["Connector"]
  end

  subgraph Ext["External"]
    EM["Empire + Base<br/>(create2 treasury)"]
    FC["Farcaster<br/>(SIWF, Mini App, share/cast)"]
    PO["POIDH<br/>(planned)"]
  end

  UI --> Pages
  UI --> API
  API --> Auth
  Pages --> DB
  API --> DB
  API --> Store
  API --> Seams
  Seams -.-> Ext
  API --> EM
  API --> FC
  Pages -.-> PO
```

## Data model

> **TL;DR** Hearths, backers and Sparks, with RLS on every table. Backing settles into one provider-agnostic table.

Sparkz keeps Hearths, backers, Sparks and a waitlist in Postgres. RLS is ON everywhere with no anon policies - every read and write goes through the server on the service-role key, which bypasses RLS. Types are CHECK constraints, not Postgres enums, so a new type/status/provider is a plain migration.

```mermaid
erDiagram
  hearths ||--o{ hearth_backers : "backed by"
  hearths ||--o{ sparks : "grows through"

  hearths {
    uuid id PK
    text slug UK
    text type "creator|culture|oss"
    text status "spark|tokenized|dormant"
    jsonb economic_config "0xSplits, empire ref"
    jsonb metadata "type-specific + farcaster + stars"
  }
  hearth_backers {
    text kind "collectable|backing|boost"
    text provider "ledger|clanker|empire|..."
    numeric amount_or_qty
    text chain "null = off-chain ledger"
  }
```

Ledger backing is live now; the provider-agnostic model is designed so future on-chain value can settle into the *same* table, keeping the record unified.

### Hearth lifecycle

```mermaid
stateDiagram-v2
  [*] --> spark: open a Hearth
  spark --> spark: Sparks (events), backing, boosts accumulate
  spark --> dormant: goes quiet
  dormant --> spark: revived by a new Spark
```

## Adapter seams (the spokes)

> **TL;DR** Two swappable registries (backing provider, connector). A new backend - or a whole vendor tool - is one file plus one import. No rewrite.

Two registry-backed seams keep Sparkz swappable. Each is a `Map`-backed registry; implementations self-register via `src/lib/adapters/bootstrap.ts`. **BackingProvider** is specific; **Connector** is the generic **spoke** any vendor can add for their own tool. Adding a backend is a new file plus one import - no UI change.

```mermaid
flowchart LR
  R2{{"BackingProvider<br/>registry"}} --- L["ledger (v1)"] & EMp["empire"] & OC["other onchain rails"]
  R4{{"Connector<br/>registry (spokes)"}} --- AU["audius (example)"] & VN["any vendor tool"]
```

| Seam | Interface | v1 impl | Grows to |
| --- | --- | --- | --- |
| **BackingProvider** | credit / settle backing | `ledger` (off-chain) | empire, privy, other onchain rails |
| **Connector** (spoke) | `status(hearthId)` for the integrations grid | `audius-catalog` (example) | any vendor tool - added via a community PR |

Seams are bundled into **spokes** by the plugin system (`src/lib/plugins`, modeled on elizaOS). A `HearthPlugin` bundles components behind one id + a declared config schema; `registerPlugin()` fans them into the seams above. Each Hearth toggles its spokes on/off (and sets their config) via the `hearth_spokes` table - so every Spark connects to its own communities and tools. **Vendors add their tool as a spoke** in three files + one PR: see [`src/lib/plugins/community/README.md`](src/lib/plugins/community/README.md).

## Integrations (spokes on the wheel)

> **TL;DR** The Hearth is the hub; each integration is a spoke. Farcaster, email, and Empire are usable now; other rails remain explicitly planned. Any vendor can add a new spoke via a community PR.

Surfaced on each Hearth page (`/c/[slug]`) as an integrations panel - **the Hearth is the hub of a wheel; each tool you connect is a spoke.** The ones below ship in-repo; a vendor adds their own the same way (a `Connector` spoke - see [Adapter seams](#adapter-seams-the-spokes)).

| Integration | What it does | Status |
| --- | --- | --- |
| **Empire (treasury)** | Deploy or link an Empire treasury | Live at `/admin/empire` when the API key and owner signature are configured |
| **0xSplits** | A candidate for adjustable revenue distribution | Modeled in economic config; not directly deployed by Sparkz yet |
| **Farcaster** | Sign in with Farcaster (SIWF), Mini App manifest, share-to-cast | Live |
| **Email list** | Off-chain backing / waitlist capture | Live |
| **POIDH bounties** | Connect Hearth work to bounties | Planned; UI placeholder only |

## Pages

> **TL;DR** The routes people actually visit, and what each one does.

| Route | What it is |
| --- | --- |
| `/` | Landing - the pitch, join form, the ecosystem |
| `/start` | Self-serve: light your own spark in under a minute |
| `/c/[slug]` | A Hearth: identity, stats, integrations, boost, Sparks, backers |
| `/explore` | Filterable directory of every Spark (type, status, integrations, sort) - each shows its connected-integration badges |
| `/empire/[id]` | Live Empire panel - any empire's treasury, reward flow, and boost leaderboard (also embedded on a Spark's `/c/[slug]` page) |
| `/blog` | Short pieces on the thesis and the stack |
| `/demo` | The idea in one page - live-stream explainer |
| `/architecture` | The interactive architecture explorer |
| `/admin` | The operator console (operator-gated) |
| `/admin/new` | Create a Hearth manually (operator-gated) |
| `/admin/pending` | Review queue for self-serve sparks (operator-gated) |
| `/admin/empire` | Tokenless empire launcher (wallet-connected) |
| `/audit` | Brand audit - import an existing repo as an OSS Hearth |
| `/profile` | Sign in with Farcaster |
| `/c/[slug]/settings` | Owner settings - choose which integrations show on the public Hearth page (the Hearth's owner, signed in with Farcaster, or the operator) |
| `/admin/add-repo` | Add a project from its GitHub repo - opens an OSS Hearth pre-filled with real repo data (operator-gated) |
| `/blog/[slug]` | A single blog post |
| `/hearth` | What a Hearth is - identity, backers, and Sparks |
| `/graduation` | How Sparks (events) grow a Hearth |
| `/split-wizard` | Set a split sheet before launch - roles, shares, 0xSplits JSON export |
| `/community-pool`, `/contribution`, `/examples` | Options creators can experiment with - contribution points, pool shares, Spark templates |
| `/farcaster` | Why Sparkz is Farcaster-native |
| `/manifesto` | The principles - generative, not extractive |
| `/zao` | Sparkz as part of The ZAO |

## API reference

> **TL;DR** Every endpoint is validated and error-handled; administrative writes need an admin.

Routes validate request data with Zod `safeParse`, wrap handlers in try/catch, log server-side, and return sanitized errors. Public creation, boosting, and waitlist routes are intentionally narrow; administrative writes require an admin: a human signed in with Farcaster or Sign-In with Ethereum as an allowlisted identity (`src/lib/admin-identities.ts`). There is no admin token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET`  | `/api/directory` | Every Hearth with live counts + integration flags |
| `GET/POST` | `/api/capsules` | List / create Hearths (GET hides pending self-serve sparks) |
| `POST` | `/api/capsules/create-spark` | Public self-serve spark creation (rate-limited, held for review) |
| `POST` | `/api/capsules/approve` | Operator: approve / reject a pending spark |
| `POST` | `/api/capsules/import-repo` | Import a GitHub repo as an OSS Hearth |
| `POST` | `/api/capsules/import-empire` | Import an existing Empire Builder empire AS a Spark |
| `POST` | `/api/capsules/link-empire` | Attach an Empire treasury to a Hearth |
| `POST` | `/api/capsules/link-farcaster` | Attach a Farcaster identity |
| `POST` | `/api/capsules/add-repo` | Operator: add a project from a GitHub repo URL as an OSS Hearth |
| `GET`  | `/api/capsules/by-fid` | Hearths owned by a Farcaster FID, for the creator hub (PII stripped) |
| `GET/POST` | `/api/capsules/visibility` | Owner or operator: read / set which integrations a Hearth hides from its public page |
| `GET/POST` | `/api/capsules/media-kit` | Operator: render a Hearth into an AI-anchor video segment (offline stub unless the Baraza env is set) |
| `GET/POST` | `/api/capsules/plugins` | Read / toggle a Hearth's plugins + per-Hearth config |
| `GET/POST`  | `/api/backers` | List backers / record operator-gated ledger backing |
| `POST` | `/api/boost` | Back / boost a Hearth (email, no wallet) |
| `GET`  | `/api/activity` | Proof-of-life feed - recent sparks and boosts across public Hearths (backers sanitized) |
| `GET`  | `/api/audius` | An artist's public Audius catalog, by handle (fail-soft) |
| `GET`  | `/api/empire/{id}` | Full public Empire read bundle (resolve + leaderboards + entries + rewards + boosters) |
| `POST` | `/api/empire/deploy` | Deploy a tokenless empire |
| `POST` | `/api/audit` | Update the readiness audit for an OSS Hearth |
| `POST` | `/api/waitlist` | Join the list |
| `POST` | `/api/upload` | Upload a logo/asset to Storage |
| `GET`  | `/api/auth/nonce` | Server-issued nonce for web Sign In With Farcaster |
| `POST` | `/api/auth/siwf` | Web door: verify a signed SIWF message, start the creator session |
| `POST` | `/api/auth/quick` | Mini-app door: verify a Farcaster Quick Auth JWT, start the creator session |
| `GET`  | `/api/auth/me` | The FID of the current verified session, or null |
| `POST` | `/api/auth/logout` | End the creator session |
| `POST` | `/api/auth/siwe` | Admin door: verify a Sign-In with Ethereum message from an admin wallet, start the session |
| `GET`  | `/api/og`, `/api/icon` | Dynamic OG image + icon |

## Tech stack

> **TL;DR** Next.js 16 + Supabase (RLS) + Tailwind + Base/Farcaster.

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** (strict).
- **Supabase** - Postgres + RLS on every table + Storage. Service role server-only.
- **Tailwind** (v4) - mobile-first, dark theme. Space Grotesk display, violet-to-amber gradient.
- **Base / Farcaster** - viem + wagmi + Reown AppKit; Farcaster AuthKit + Mini App SDK.
- **Vercel** deploy; GitHub integration auto-deploys `main`.

See [docs/STACK.md](docs/STACK.md) for the full file-by-file map.

## Repo layout

> **TL;DR** Where everything lives - app routes, the lib seams, the migrations.

```
src/
  app/
    page.tsx            landing
    c/[slug]/           Hearth page
    explore/            filterable directory
    start/              self-serve spark creation
    blog/               articles
    demo/               explainer
    admin/              review queue + empire launcher (gated)
    api/                all API routes (Zod + try/catch)
    _components/        Flame, Avatar, Header, Footer, ShareButton, BoostForm, ...
  lib/
    supabase/           server client (service role) + DB types
    adapters/           the 2 seams (backing/connector) + bootstrap
    plugins/            the spoke system (registry, built-ins) + community/ (vendor spokes)
    empire/             tokenless-empire client (create2 message)
    brand-audit/        GitHub repo -> OSS Hearth import
    rate-limit.ts, auth.ts, http.ts, validation/
content/articles/       the blog source
supabase/migrations/    history, in order (the numbered .sql files)
docs/                   deep docs + assets
```

## Local setup

> **TL;DR** `npm install`, copy the env file, `npm run dev`. Full walkthrough in SETUP.md.

```bash
npm install
cp .env.example .env.local   # fill in Supabase + the session secret
npm run dev                  # http://localhost:3000
npm run seed:zoostr          # optional: the first spark
```

Full walkthrough (env vars, keys, migrations, one at a time): [SETUP.md](docs/SETUP.md).

## Deploy

> **TL;DR** Vercel auto-deploys `main`; PR-only, never push direct.

Vercel + the two domains (trysparkz.com / sparkz.lol). PR-only to `main`; the GitHub integration auto-deploys on merge. Full steps: [DEPLOY.md](docs/DEPLOY.md).

## Security

> **TL;DR** The service role never touches the browser; RLS on everything; admin access fails closed.

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or any secret to the browser - service role is server-only.
- Never commit secrets or `.env`; stub keys on disk, real keys at runtime.
- RLS on every table, deny-anon by default.
- Admin access: humans sign in (Farcaster or SIWE) as an allowlisted identity; it fails closed.

Full posture: [SECURITY.md](docs/SECURITY.md).

## The four anti-failure gates

> **TL;DR** Every feature must earn, be measurable, strengthen the data, and be testable with a real project in 30 days - or it stays in the lab.

Every feature passes all four or it stays in the lab:

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Hearth's accumulating data?
4. Can it be tested with a real project within 30 days?

## State of the project + roadmap

> **TL;DR** Audited 2026-08-17. Hearths, free boosts and Sparks work end to end. The honest gap: owner-by-FID auth switches on with `SPARKZ_SESSION_SECRET`.

**Working end to end (verified):**

- Hearth creation - self-serve `/start` (rate-limited, held for review) and operator console.
- Sparks - an event on a Hearth (moment, token, NFT drop, bounty, event), lit by the Hearth's owner.
- Empire Builder - live reads (leaderboards, boosters) and a working tokenless deploy at `/admin/empire` (wallet-signed, operator-gated).
- The Audius spoke - real catalog reads from the Audius public API, live demo on `/audius`.
- Owner visibility settings - `/c/[slug]/settings` toggles which integrations show on the public page (the owner, signed in with Farcaster, or the operator).
- Free boost backing - no wallet, no card, one boost per backer per Hearth.

**The honest gap (and the plan):**

1. **Owner-by-FID auth is built; it switches on with `SPARKZ_SESSION_SECRET`.** *Two doors, one session*: Quick Auth JWT verification for mini-app entry, `auth-kit` + server-side `verifySignInMessage` for web, both minting one HMAC session cookie (`SameSite=None; Secure` so it survives the Farcaster iframe). A `requireHearthOwner` gate lets a creator manage their own Hearth's visibility and Empire deploy by FID, and `create-spark` takes the owner FID from the verified session only. The live sign-in test (step 6 of [AUTH-PLAN.md](docs/AUTH-PLAN.md)) runs once the secret is set in production.

**Build order:** owner-by-FID auth (built) -> owner-gated settings + Empire deploy/link -> per-Hearth contributor leaderboards.

**The convergence** - each audited ZAO project is a Hearth candidate; CoCConcertZ is slated to become a Spark.

Full vision: [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [V1-SCOPE.md](docs/V1-SCOPE.md).

## Still fluid - help us decide

> **TL;DR** These are NOT locked in yet. Tell us what you think - that is the feedback we want.

Sparkz is early and public on purpose. The things below are **not locked in**. If you have a take, that is exactly the kind of feedback we want - open a [Discussion](https://github.com/bettercallzaal/sparkz/discussions) or an [idea](https://github.com/bettercallzaal/sparkz/issues/new?template=idea.yml).

- **Backing rails** - `ledger` (off-chain) is live; Privy, Empire and other onchain rails are candidates behind the same adapter. Which do creators actually want first?
- **Fees + splits** - the creator-first default is 1/1/98. Is that the right floor? Should Sparkz ever take a slice, or only an aligned, locked stake - never a fee?
- **Sparks** - which events grow a Hearth best, and which onchain actions should every Spark record? A hat, an attendance proof, a contribution?
- **Self-serve + moderation** - anyone can light a spark, held for review. The auth direction is decided (verified Sign-in-with-Farcaster, owner-by-FID); still open is how open creation should be: fully self-serve, invite-only, or FID-gated from day one?
- **Entry points** - Creator and OSS-repo flows are wired; Culture remains early. Which should we build out next?

Bring a take with a concrete path (see [Contributing](CONTRIBUTING.md)) and it gets read and acted on.

## Documentation

> **TL;DR** The deeper docs, indexed - vision, scope, setup, security, and the file-by-file map.

| Doc | What's in it |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | The full two-track vision (the upgrades and gates) |
| [V1-SCOPE.md](docs/V1-SCOPE.md) | The shippable floor + product gates |
| [BUILD-MILESTONE-1.md](docs/BUILD-MILESTONE-1.md) | Milestone 1 scope (the Hearth foundation) |
| [BRAND.md](docs/BRAND.md) | Brand + messaging (the spine, voice, visual direction) |
| [MVP.md](docs/MVP.md) | Readiness + brand-test playbook |
| [DEMO.md](docs/DEMO.md) | Live-stream demo script |
| [SETUP.md](docs/SETUP.md) | Local setup, step by step |
| [DEPLOY.md](docs/DEPLOY.md) | Vercel + domains |
| [SECURITY.md](docs/SECURITY.md) | Security posture |
| [AUTH-PLAN.md](docs/AUTH-PLAN.md) | The locked owner-by-FID auth plan (two doors, one session) - the next build |
| [STACK.md](docs/STACK.md) | File-by-file stack map |
| [strategy/positioning.md](docs/strategy/positioning.md) | Why Sparkz is an OSS protocol + data network, not SaaS |
| [research/sparkz-improvements-and-plugin-system.md](docs/research/sparkz-improvements-and-plugin-system.md) | The Hearth plugin system (elizaOS-modeled) + easy Farcaster/integration wins |
| [research/empire-builder-api-integration.md](docs/research/empire-builder-api-integration.md) | Empire Builder endpoint audit + the Sparkz integration |

## Principles

> **TL;DR** Community first, the work is the pitch, baked into hard rules.

- **Hearth first.** Every project starts as a home for its people and its work.
- **Monetization tool, not a security.** Splits are revenue share (utility), not "shares in the creator." No moon talk, no promises.
- **Retention first.** Real engagement - collabs, backing, showing up - grown through onchain actions, not holder count.
- **Generative, not extractive. Symbiotic, not parasitic.**

Built to work with the ecosystem: ZAO, Kismet, Podia, POIDH, Empire, and more.

## Provenance

> **TL;DR** Who made it and why - part of the ZAO estate, public and OSS-first, first spark Zoostr.

Sparkz two-track strategy, Zaal + Brandon Ducar (DreamNet), 2026-07-17. Part of the ZAO estate; Sparkz is public and OSS-first. First spark: Zoostr (ZABAL x Boostr).

### For AIs

Point any AI at this context box to load the full Sparkz picture and give grounded, actionable advice:

    https://useicm.com/api/objects/icm_Lr30gogWivu6uzio4l02MQ/llm.txt

### Feedback

This is public on purpose - if someone wants to take the idea and run, go for it. I would rather learn from others and hear real suggestions.

One rule: bring solutions, not just complaints. If you want to comment, make sure there is something actionable I can do to rectify your perspective. Feedback with a concrete fix gets read and acted on. A complaint with no actionable path will just be ignored.

## License

[Apache-2.0](LICENSE). Public and OSS-first - fork it, build on it, ship commercial
work with it. The Apache license adds an explicit patent grant and trademark
protection, which suit a protocol others build on. See [LICENSE](LICENSE) and
[NOTICE](NOTICE).
