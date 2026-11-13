# Open-source readiness

What has to be true before Sparkz is announced as an open-source project people can
run, fork and contribute to. Each row has its state and the evidence behind it.
Re-run the commands at the bottom to check a row again.

**The repo is already public.** `gh repo view bettercallzaal/sparkz` reports
`PUBLIC`, licence Apache-2.0. So this list is not about flipping visibility. It is
about whether a stranger who finds the repo can trust it, run it and contribute.
Announcing it is the maintainer's call; this list ends at "ready".

Last checked: 2026-11-13 06:04 EST (by `date`), against `main` at `ca1d254`. Detail of the 13 Nov re-scan: [readiness/2026-11-13-rescan.md](readiness/2026-11-13-rescan.md).

## The list

| # | Item | State | Evidence |
|---|---|---|---|
| 1 | Licence file | DONE | `LICENSE` is Apache License 2.0; `NOTICE` names The ZAO; `package.json` says `"license": "Apache-2.0"`. Kept as Apache-2.0 because the repo already says so. |
| 2 | README a stranger can run from | DONE, one note | Run 2026-11-12 19:05 EST (by `date`) on a fresh checkout of `main` `7d9611b`, using only the README steps: `npm install` exit 0, `cp .env.example .env.local` with every value empty, `npm run dev`. `/`, `/explore` and `/profile` return 200. `/api/auth/nonce` returns 503 until `SPARKZ_SESSION_SECRET` is set, which is by design (sign-in fails closed) and is in the README's setup line. Note: CI installs with `--legacy-peer-deps`; plain `npm install` also worked. |
| 3 | `.env.example` with no values | WAITING | Two lines still carry values (`OPENROUTER_MODEL`, `SPARKZ_ORIGIN`). Neither is a secret, and both have defaults in the code. This waits on open PR #344, which edits the same file. |
| 4 | Secret scan of the full git history | DONE, clean | Re-run 13 Nov ([note](readiness/2026-11-13-rescan.md)): 637 commits across 161 refs. The only 2 matches are the planted test value in this file's re-run instructions, so **0 real secrets**. 0 credentials in URLs. No secret file was ever committed. |
| 5 | PII scan | ONE ITEM OPEN | Re-run 13 Nov ([note](readiness/2026-11-13-rescan.md)). One decision is still open with the maintainer: their personal email is the author address on most commits. The default is to leave it, because rewriting a public repo's history breaks forks and PR links. Every other address is a published company contact, a project address or a test fixture. |
| 6 | Credits and dependency licences | DONE | No copied or ported code found ("adapted from", "copied from", "ported from": 0 hits in `src/`, `agent/`, `scripts/`). "Pattern credit" comments name design inspiration (Luma, Partiful), not code. Of 399 production packages, 384 are under open-source licences (MIT, Apache-2.0, ISC, BSD, 0BSD, LGPL via sharp/libvips, MPL-2.0 for capgo native-navigation). The 15 that are not, Reown AppKit and WalletConnect, are source-available; their licence terms are met by #347 (`NOTICE`, `licenses/`, web footer) and #348 (iPhone About list). Whether to keep AppKit is a separate maintainer decision: it needs a paid licence above 500 monthly active users. |
| 7 | Tests and CI green | DONE | #354 merged: CI runs `npm test` (Node 22) next to the build job. 18 test files and 76 tests pass on `main` (13 Nov), with no test framework as a dependency. |
| 8 | Community files | DONE | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CITATION.cff`, `NOTICE` are all present. |
| 9 | Internal notes in the tree | REVIEW | `.handoffs/` holds six agent session notes from July to August 2026, `CLAUDE.md` holds agent instructions, and `.mcp.json` names the Supabase project ref (an identifier, not a credential). None holds a secret. Whether strangers should see them is a maintainer choice; the default is to keep them, since they show how the project is built. |
| 10 | Known dependency advisories | DONE for critical | `npm audit --omit=dev`: 26 (critical 1) before #346, 23 (critical 0, high 16) after. Production runs next 16.4.6 (deploy `255c8ee`). The remaining highs sit in @reown/appkit and nested zod copies, with no upstream fix yet. Re-check monthly. |
| 11 | iPhone project buildable from a clone | DONE | `ios/` (Capacitor 8, build 4) is on `main` since #349, so `scripts/testflight.sh` runs from a fresh clone. `npx cap sync ios` matches main's two plugins. Signing needs the builder's own Apple team (`SPARKZ_TEAM_ID`); no team secret is in the repo. |

**Ready means rows 1 to 11 are DONE or closed by a recorded decision.**

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
