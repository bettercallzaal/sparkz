# AGENTS.md

Instructions for AI coding agents (Codex, Claude Code, Cursor and others) working in this repo.

The full rules live in [CLAUDE.md](CLAUDE.md). Read it first; this file only points there and lists the commands.

## Commands

From `package.json` scripts, `.npmrc` (`legacy-peer-deps=true`) and `.github/workflows/ci.yml` (tests on Node 22, build on Node 20).

- Install: `npm install --legacy-peer-deps`
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`
- Tests: `npm test` (Node's test runner with type stripping, Node 22)
- Build: `npm run build`

## Rules that matter most

- PR-only to main. Never push to main, never force-push.
- Ask before a database migration, a new dependency or an env var change.
- Never send a secret or the service key to the browser.
- Zod on every API input; a failed database call is an error, never an empty result.
- Keep it small: no new pages unless asked; a stale page is removed, not rewritten.
- Fill in the PR template, including the Security section when the PR touches src/app/api, src/lib/auth.ts, src/lib/session.ts or a migration.
