# Session handoff - 2026-07-24 16:50
> from mac / branch ws/rebrand-audit-zao-lens -> to ZOE (via Bonfire + cockpit inbox)
> doc: .handoffs/session-2026-07-24-sparkz-rebrand-positioning/README.md
> chain: none

## Receiver instructions (read me FIRST, then do exactly this)

You just received a handoff bundle. Do NOT start work yet. Do this:

1. Read ALL sections (A-E) before responding.
2. Section C: git state is clean; all work is in PR #218 (unmerged). Nothing to apply.
3. Create TODO entries from Section A.
4. Use Section B as your "why" - do not re-litigate.
5. Section D: nothing running in the background.
6. Section E is the cold-start map.
7. Constraint from Zaal: PR-only. Nothing gated (merges/deploys, spend, outbound, DNS, keys) fires without him. Open PRs for him to merge; do not merge yourself.

## A. Tasks to absorb

- [ ] Zaal reviews + merges PR #218 (rebrand audit + P0 ZAO rebrand code). Merge deploys, so it is HIS call. After deploy, eyeball trysparkz.com/c/sparkz for the new type (Space Grotesk + JetBrains Mono), ZAO Gold accent, "Part of The ZAO" footer, "graduate to independence".
- [ ] Build the domain re-apply PR: trysparkz.com = SEO marketing front door + a "Launch App" button -> sparkz.lol = the app. sparkz.lol now serves Production directly (Zaal fixed Vercel), so it is UNBLOCKED. Match the SIWF sign-in domain to sparkz.lol. Do NOT re-break sign-in - verify on sparkz.lol/profile. (This is the redo of reverted #195, done right.)
- [ ] Build the "glue for Farcaster devs + creators / many open-source options to build and grow" homepage copy, and add that framing to docs/strategy/positioning.md. Zaal's newest positioning line - Sparkz is the connective layer offering a menu of optional OSS rails (backing, receipts, treasury, token, agent, bounties, distribution).
- [ ] Continue rebrand P1-P3: tighten voice to receipts-over-claims; surface the member-owned/transparent ownership story on the page; evolve the flame gradient toward the ZAO signature (#0047FF->#9945FF->#FFD700).
- [ ] Move the PRIVATE commercial playbook (pricing/model/kill-criteria, sent to Zaal as a file this session) into the private ZAOOS lab, NOT the public sparkz repo.

## B. Why - decisions + pivots + friction

- Sparkz monetizes as an OSS protocol + data network, NOT SaaS: earn on value that flows through the rails (graduations, backing/boost/bounty) + the compounding Meme Receipt graph. Sam's (Boston DAO) commercial audit priced it as SaaS (ARPA/churn/CAC); we take his managed-pilot wedge only as the bootstrap, not the identity. Captured in docs/strategy/positioning.md + a CLAUDE.md pointer.
- Commercial numbers (pricing, financial model, kill criteria) were deliberately kept OUT of the public repo (bettercallzaal/sparkz is public). They went to Zaal as a private file for the ZAOOS lab.
- Rebrand verdict (ZAO lens, not SaaS lens): thesis + copy are already ZAO (anti-speculation spine + Meme Receipts = "receipts over claims"). Gap is surface, not soul. P0 = Space Grotesk + JetBrains Mono, ZAO Gold accent, "Part of The ZAO", graduation=independence. Full audit: docs/strategy/rebrand-audit-zao-lens.md. ZAO lens was distilled by a subagent from the ZAO OS V1 lab (brand voice guide, visual spec, ORDAO/Respect governance).
- Domain model per Zaal: trysparkz.com = SEO/marketing front door, sparkz.lol = where the app lives (a SEPARATE domain, not an app.trysparkz.com subdomain). Industry standard is a subdomain, but Zaal wants sparkz.lol.
- #195 (first domain split) broke prod because sparkz.lol 308-redirected to www.sparkz.lol AND the SIWF domain was bare "sparkz.lol" (host mismatch) AND sparkz.lol served the old /lol page. Reverted via #216 to un-break prod. Zaal then edited Vercel so sparkz.lol serves Production directly (Connect to environment, not redirect). Re-apply is now safe - match SIWF domain to the exact serving host.
- Prod cleaned to real-data-only (Zaal directive): deleted the testing-spark capsule, all fabricated backers, all zero-metric seed receipts + seed signals/drafts, fake waitlist row. Then hid the 6 bulk-seeded brand sparks (metadata.review='hidden') so only sparkz is public; they return as each is properly built via the new /admin/add-repo flow. Backup JSON is in the session scratchpad.
- Removed the create-spark auto-boost (#196) - it fabricated "1 supporter backed" on every new spark, which contradicted the real-data directive.
- FRICTION: Google Docs/Sheets are NOT readable via WebFetch (auth-gated, returns the SPA shell). Read them via Claude-in-Chrome: navigate to the doc's /export?format=txt URL, which DOWNLOADS a .txt to ~/Downloads, then Read that file. Worked cleanly.
- FRICTION: the Claude-in-Chrome extension disconnects intermittently mid-session ("Browser extension is not connected"); Zaal reconnects via the extension icon. Also the gif_creator tool errored repeatedly; screenshots worked after a tabs_context_mcp refresh.

## C. Git state

- Branch: `ws/rebrand-audit-zao-lens` (pushed; PR #218 open, unmerged). Working tree clean.
- main is synced. All other session work already merged (#193, #196, #197, #209, #216, #217; #195 was reverted by #216).
- No uncommitted diff, no untracked files.

## D. In-flight

- Background bash jobs: none.
- Subagents pending: none (the ZAO-lens distill agent completed).
- Scheduled wakeups: none.
- Open AskUserQuestion: none.

## E. Cold-start map

- Files touched (this session, recent-first): docs/strategy/rebrand-audit-zao-lens.md, docs/strategy/positioning.md, CLAUDE.md, src/app/layout.tsx, src/app/globals.css, src/app/_components/Footer.tsx, src/app/_components/GraduationPanel.tsx, src/app/c/[slug]/page.tsx, src/app/api/capsules/add-repo/route.ts, src/app/admin/add-repo/page.tsx, src/app/admin/page.tsx, src/app/api/capsules/create-spark/route.ts, src/app/_components/SparkLit.tsx, src/app/_components/YourSparks.tsx, src/app/_components/StartForm.tsx, src/app/_components/CreateSparkAsFarcaster.tsx.
- Skills invoked: brainstorming (FEF product design, spec at scratchpad/fef-v1-design.md), clipboard (x3: test plans + boot lists), handoff (this).
- Memory writes: project_sparkz_state.md - updated with the two-domain split + real-data-only directive.
- Last-known mental model: Mid-rebrand. P0 ZAO rebrand is built and in PR #218 (unmerged). Positioning reframed to OSS-monetization-not-SaaS (merged). Only sparkz is public on prod. Domain re-apply (trysparkz marketing + Launch App -> sparkz.lol) is unblocked because Zaal made sparkz.lol serve Production directly, but NOT yet built.
- Open questions for Zaal: merge #218? Build the domain re-apply now? (Also FEF - a multi-user Farcaster-first-then-X-delayed posting client - has an approved v1 design at scratchpad/fef-v1-design.md, standalone repo, Neynar+QStash, X BYOK, not yet built.)
