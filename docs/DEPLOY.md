# Sparkz - deploy (Vercel + domains)

One app, three front doors routed by hostname (`src/middleware.ts`):
`trysparkz.com` -> `/try`, `sparkz.lol` -> `/lol`, anything else -> `/`.

## Env vars (set in Vercel project settings)

| Var | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://noytvuorbdmgjfxwbufj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | SECRET - server only |
| `SPARKZ_ADMIN_TOKEN` | gates the write routes (fails closed if unset) |
| `OPENROUTER_API_KEY` | cheap-tier drafts (optional; fallback works without) |
| `DISCORD_WEBHOOK_URL` | optional - Discord approval channel |
| `GITHUB_TOKEN` | optional - brand-audit repo import rate limit |

## CLI deploy (what we're doing)

```bash
npx vercel login            # interactive - you run this once
npx vercel link --yes       # create/link the project
# push each env var from .env.local (values never printed):
npx vercel env add <NAME> production   # repeat per var
npx vercel --prod           # deploy current branch to production
```

## Domains

```bash
npx vercel domains add trysparkz.com
npx vercel domains add sparkz.lol
```

Then add the DNS records Vercel prints at your registrar (Porkbun):
- Apex domain -> an `A` record to Vercel's IP (or `ALIAS`/`ANAME` if supported), or
- set the nameservers to Vercel's, per the dashboard.

Once DNS propagates, middleware serves the right page per host automatically.

## Note on the production branch

The app lives on `ws/capsule-foundation` (PR #127). `npx vercel --prod` deploys the
current working tree to production regardless of git branch, so we can go live now
and merge the PR after. Once merged to `main`, Vercel's Git integration will
auto-deploy `main` on every push.
