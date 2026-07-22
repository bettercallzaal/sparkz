# Contributing to Sparkz

Sparkz is public on purpose. If you want to take the idea and run, go for it. If you
want to contribute here, welcome.

## One rule

Bring solutions, not just complaints. Feedback with a concrete, actionable path gets
read and acted on. A complaint with no path will be ignored. This holds for issues,
discussions, and PRs.

## Every feature passes the four gates

A change earns its place if it passes at least one (internal refactors and docs are
exempt):

1. Does it help someone earn, participate, or distribute?
2. Can we measure whether it worked?
3. Does it strengthen the Capsule's proprietary data?
4. Can it be tested with a real project within 30 days?

## Working here

- **Stack:** Next.js (App Router) + Supabase (RLS on every table) + Tailwind +
  TypeScript. Mobile-first, dark theme. `@/` import alias.
- **Branches:** `ws/<slug>`. PR-only to `main` - never push direct.
- **Validation:** every API route validates input with Zod `safeParse`, wraps the
  handler in try/catch, logs server-side, and returns a sanitized error.
- **Ask before:** any DB migration, new dependency, or env-var change.
- **Secrets:** never expose `SUPABASE_SERVICE_ROLE_KEY` or any secret to the browser.
  Service role is server-only. Never commit `.env`.
- **LLM work:** any drafting/generation uses a cheap tier (OpenRouter), never a
  metered path.

## Before you open a PR

- `npm run build` is green and `npx tsc --noEmit` is clean.
- The agent's tests pass if you touched `agent/` (`cd agent && npm test`).
- Use the PR template. Say how you verified it.

## Local setup

See [docs/SETUP.md](docs/SETUP.md) for the step-by-step (env vars, keys, migrations).

## Architecture

Read the [README](README.md) and the interactive
[architecture page](https://trysparkz.com/architecture) first. The deep docs are in
[docs/](docs/).
