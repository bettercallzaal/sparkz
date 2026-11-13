# Open-source readiness

What has to be true before Sparkz is announced as an open-source project people can
run, fork and contribute to. Each row has its state and the evidence behind it.
Re-run the commands at the bottom to check a row again.

**The repo is already public.** `gh repo view bettercallzaal/sparkz` reports
`PUBLIC`, licence Apache-2.0. So this list is not about flipping visibility. It is
about whether a stranger who finds the repo can trust it, run it and contribute.
Announcing it is the maintainer's call; this list ends at "ready".

Last checked: 2026-11-12 19:03 EST (by `date`), against `main` at `7d9611b`.

## The list

| # | Item | State | Evidence |
|---|---|---|---|
| 1 | Licence file | DONE | `LICENSE` is Apache License 2.0; `NOTICE` names The ZAO; `package.json` says `"license": "Apache-2.0"`. Kept as Apache-2.0 because the repo already says so. |
| 2 | README a stranger can run from | IN PROGRESS | `README.md` has "Local setup" (`npm install`, copy `.env.example`, `npm run dev`) and links [SETUP.md](SETUP.md). Not yet proven by a run from a clean clone with only the documented steps. That is the next pass. |
| 3 | `.env.example` with no values | NEXT | Two lines still carry a value: `OPENROUTER_MODEL=deepseek/deepseek-chat` and `SPARKZ_ORIGIN=https://trysparkz.com`. Neither is a secret, and both have defaults in code (`src/lib/meme-engine/draft.ts`, `src/lib/origin.ts`), so they can be blanked safely. Waiting for open PR #344, which also edits `.env.example`. Check: `grep -nE '^[A-Z_]+=[^ #]' .env.example` must print nothing. |
| 4 | Secret scan of the full git history | DONE, clean | 575 commits across 133 refs, all branches, not just `HEAD`. 0 matches for private keys, OpenRouter, Anthropic or OpenAI keys, GitHub tokens, AWS keys, Slack tokens, JWTs, `*_SECRET`/`*_KEY`/`*_PRIVATE_KEY` assignments with a value, or 64-hex private keys. 0 matches for credentials inside URLs. A planted test line matched both patterns, so the scan was able to find them. No `.env`, `.p8`, `.p12`, `.pem`, `.key` or provisioning file was ever committed. |
| 5 | PII scan | ONE ITEM OPEN | Emails across the full history: the maintainer's personal email is the author address on 406 commits and appeared in 4 files in July 2026, all removed from `HEAD` since. Everything else is a placeholder (`you@example.com`) or a project address. Removing it would mean rewriting the history of a public repo, which breaks forks and PR links. Decision pending; the default is to leave it and record it here. No phone numbers found. FIDs and wallet addresses in `src/lib/alpha-access.ts` and `src/lib/admin-identities.ts` are public identifiers, by design. |
| 6 | Credits for adopted code | PARTIAL | No copied or ported code found ("adapted from", "copied from", "ported from": 0 hits in `src/`, `agent/`, `scripts/`). "Pattern credit" comments name design inspiration (Luma, Partiful), not code. Still to do: list the licences of every runtime dependency and confirm none conflicts with Apache-2.0. |
| 7 | Tests and CI green | NOT YET | CI (`.github/workflows/ci.yml`) is green on `main` (typecheck, lint, build). But CI runs no tests. The 10 web-app test files under `src/` fail under plain `node --test` with `ERR_MODULE_NOT_FOUND`, because they import without file extensions. `agent/` runs its tests through `tsx`. The fix is a root `test` script plus a CI step, which needs a dev dependency (`tsx`) and the maintainer's OK per `CLAUDE.md`. |
| 8 | Community files | DONE | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CITATION.cff`, `NOTICE` are all present. |
| 9 | Internal notes in the tree | REVIEW | `.handoffs/` holds six agent session notes from July to August 2026, `CLAUDE.md` holds agent instructions, and `.mcp.json` names the Supabase project ref (an identifier, not a credential). None holds a secret. Whether strangers should see them is a maintainer choice; the default is to keep them, since they show how the project is built. |

**Ready means rows 1 to 9 are DONE or closed by a recorded decision.**

## How to re-run the checks

Full-history secret scan (no install needed):

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*'
git log --all -p --no-color -U0 > /tmp/hist.patch
grep -nE '^\+.*(BEGIN [A-Z ]*PRIVATE KEY|sk-or-v1-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|(SERVICE_ROLE_KEY|SESSION_SECRET|PRIVATE_KEY|API_KEY|SECRET)[A-Z_]*\s*=\s*["'"'"']?[A-Za-z0-9/+_.-]{16,}|0x[0-9a-fA-F]{64})' /tmp/hist.patch
# Control: this line must print 1, or the pattern is broken.
echo '+SUPABASE_SERVICE_ROLE_KEY=abcdefghijklmnop1234' | grep -cE '^\+.*SERVICE_ROLE_KEY[A-Z_]*\s*=\s*[A-Za-z0-9/+_.-]{16,}'
# Files that should never be committed:
git log --all --name-only --format= | sort -u | grep -iE '(^|/)\.env($|\.)|\.p8$|\.p12$|\.pem$|\.key$|\.mobileprovision$|id_rsa' | grep -v '\.env\.example$'
```

A second tool such as gitleaks is a stronger check, because it knows more key formats.
It is not installed on the machine that ran this, so it has not been run.

Emails in history:

```bash
grep -oE '^\+.*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' /tmp/hist.patch | grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | sort | uniq -c | sort -rn
git log --all --format='%ae' | sort | uniq -c | sort -rn
```
