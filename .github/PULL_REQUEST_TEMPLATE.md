<!-- Thanks for contributing to Sparkz. Keep it tight. -->

## What
<!-- One or two sentences: what does this change and why. -->

## Added, changed, removed
<!-- One line each. Name every file you deleted and why. -->

## Which gate(s) does it serve
<!-- Every feature passes at least one. Delete the ones that don't apply. -->
- [ ] Helps someone earn, participate, or distribute
- [ ] We can measure whether it worked
- [ ] Strengthens the Hearth's proprietary data
- [ ] Testable with a real project within 30 days
- [ ] Internal (docs, refactor, infra) - no gate needed

## Security (fill in if the PR touches src/app/api, src/lib/auth.ts, src/lib/session.ts or a migration)
<!-- Each answered with a file:line or a test name, not "yes". -->
- [ ] Every new or changed write route refuses cross-site requests (forbidCrossSite) and parses its body with Zod
- [ ] Who may call it is checked on the server (requireAdmin / requireHearthOwner / session), and a test fails when that check is removed
- [ ] Identity comes from the verified session, never from the request body
- [ ] A failed database call is an error, never an empty list, zero or "free"
- [ ] No secret or service key reaches the browser or a response
- [ ] Links and URLs from users are https-only at write and at render

## Verify
<!-- How you checked it: tsc, lint, npm test (count), build, a screenshot, a live route. -->

## Notes
<!-- Anything a reviewer should know: migrations, new env vars, new dependencies (ask first), follow-ups. -->
