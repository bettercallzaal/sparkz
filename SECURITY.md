# Security Policy

Sparkz is a public, forkable product running on a live database. We take security
seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately through GitHub's built-in flow:

1. Go to the [**Security** tab](https://github.com/bettercallzaal/sparkz/security) of this repo.
2. Click **Report a vulnerability** (GitHub Private Vulnerability Reporting).

This keeps the report private until a fix is shipped. If you cannot use GitHub's
reporting flow, email **security@thezao.com** with the details.

When reporting, please include:

- What the vulnerability is and where (file, route, or URL).
- Steps to reproduce, or a proof-of-concept.
- The impact you think it has.

We aim to acknowledge reports quickly and will keep you updated on the fix.

## Scope

In scope: this repository's application code (`src/`), API routes, database
migrations, and deployment configuration.

Out of scope: third-party services Sparkz depends on (Supabase, Vercel, Base,
Farcaster, OpenRouter) - report those to the respective vendor.

## Our security posture

The controls every change is held to - RLS on every table, server-only service
keys, Zod validation on all input, fail-closed rate limiting, host-header-safe
outbound URLs, and more - are documented in
[**docs/SECURITY.md**](docs/SECURITY.md).
