# Sparkz iPhone design brief

> **Status, 12 Nov 2026.** Build-first items in PRs: #323 (44pt tap targets and pressed states), #324 (bottom tab bar, app only), #325 (one-tap Boost, D4), #326 (Mine home, C1). Next: item 4, one New Hearth create sheet. Item 5 (Sparks as a real object) needs a DB migration and waits on Zaal's OK (CLAUDE.md: ask before any migration). Companion docs: [what Sparkz does today](01-sparkz-today.md), [the 7-app research](02-app-research.md).

For Zaal using Sparkz daily on iPhone via the TestFlight Capacitor shell. Written 12 Nov 2026. Inputs: `01-sparkz-today.md` (repo read) and `02-app-research.md` (fetched sources). Style learning only: nothing here copies another app's logo, name, artwork or text.

## The honest summary

Sparkz on the phone today is a marketing website in a frame. It has no home that is yours, no bottom navigation, no way to see what changed, and "Spark" (an event) does not exist as a thing you can create. Four of the five build-first changes are front-end only. The fifth (real Sparks) needs a database migration, which `CLAUDE.md` says must be asked about first.

[Certain] on: no tab bar, no Spark table, marketing home, 32px hamburger, sign-in hidden on phone width (read in `Header.tsx`, `HeaderAuth.tsx`, `MobileNav.tsx`, migrations). [Likely] on: the native bridge flag for shell detection works on a remote `server.url` page. [Guessing] on: how it looks on device, since I could not run it; do a 10 minute on-device pass before starting.

## Principles taken from the research

1. The app's first screen is yours, not a pitch (Luma "Your Events", Kickstarter Backings Dashboard, Patreon Home/Membership, Bandcamp collection).
2. Four or five bottom tabs, one word each, never hidden (Apple HIG tab bars).
3. Everything is 44pt or larger (Apple HIG buttons).
4. Making an event takes seconds and ends in a share link or QR (Luma, Partiful).
5. Core verbs never bounce to Safari (Kickstarter's follow-in-browser is the cautionary case).
6. Something time-based pulls you back: a push or lock-screen item (Luma Live Activities, Patreon notification settings, Kickstarter reminders).

## Build first (the top 5)

| # | Change | Size | Why first |
|---|---|---|---|
| 1 | Native shell chrome: bottom tab bar, drop marketing header and footer inside the app | M | Every other change needs somewhere to live |
| 2 | "Mine" home: signed-in first screen listing your Hearths and what changed | M | Gives a daily reason to open the app |
| 3 | 44pt tap-target and safe-area pass, remove hover-only UI, no email field when signed in | S | Cheap, removes the worst day-one friction |
| 4 | One create flow ("New Hearth") as a bottom sheet from the + tab, with the naming fixed | M | Today there are two flows and the word "spark" means two things |
| 5 | Sparks as a real object: a list on each Hearth and a 4-field "New Spark" form | L (migration) | The product's core idea does not exist in the app yet |

Everything below is the full list, screen by screen, in impact order within each screen.

## Screen by screen

### A. Global navigation (build first: #1)

**Change A1. Bottom tab bar with four tabs: Home, Explore, New (+), Me.** Credit: Apple HIG tab-bar rules ("Prefer a tab bar for navigation", "Avoid overflow tabs", "Use single words whenever possible", "Don't disable or hide tab bar buttons") from https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json ; Luma's Home/Past split from https://help.luma.com/p/luma-ios-app .
- Detail: the + tab opens the create sheet rather than a page (an action, so style it as a raised centre button; HIG says tab bars are for navigation, so treat it as a deliberate exception and keep Home/Explore/Me as true tabs).
- Show it only inside the shell. Detect with `window.Capacitor?.isNativePlatform()` [Likely works on a remote `server.url`; verify]. Fallback if not: set `ios.appendUserAgent` in `capacitor.config.ts` (needs one new TestFlight build).
- Hide `Header` and `Footer` in the shell; keep them on the web. Replace with a slim title bar (page title, one right-side action).
- Padding: `body` already adds `padding-bottom: env(safe-area-inset-bottom)` (`globals.css` line 69). The tab bar must own that inset instead, or you get a double gap.
- Files: `src/app/layout.tsx`, new `src/app/_components/TabBar.tsx`, `src/app/_components/Header.tsx`, `src/app/_components/Footer.tsx`, `src/app/globals.css`, optional `capacitor.config.ts`.
- Size: M.

**Change A2. Remove marketing links from the app menu.** The hamburger holds Blog, Architecture, How it works. In the shell those move to a single "About Sparkz" row under Me. Credit: Apple guideline 4.2.2 ("apps shouldn't primarily be marketing materials... or a collection of links") from https://developer.apple.com/app-store/review/guidelines/ . Files: `MobileNav.tsx`. Size: S.

**Change A3. Keep external links in the app.** Farcaster, website and GitHub pills on a Hearth open in Safari and strand the user. Use an in-app browser sheet. Credit: the cautionary Kickstarter case, where following a creator "opens in a new browser window" (https://help.kickstarter.com/hc/en-us/articles/360043244853-How-do-I-follow-creators-through-the-app). Needs a new dependency (`@capacitor/browser`) and a new build, so ask first. Files: `package.json`, `src/app/c/[slug]/page.tsx`. Size: S-M.

### B. First open and sign-in (build first: part of #2)

**Change B1. In the shell, first open is a sign-in screen, not the landing page.** One flame, one line, one "Sign in with Farcaster" button; signed-in users go straight to Home. Skip the waitlist email form in the shell (alpha lock means only Zaal and IMan can sign in anyway, `src/lib/alpha-access.ts`). Credit: Patreon's free-first entry, "JOIN the communities of creators you love for free" (https://apps.apple.com/us/app/patreon/id1044456188); Farcaster listing: identity is the entry, "Create a Farcaster account and public profile" (https://apps.apple.com/us/app/warpcast/id1600555445).
- Today the phone header hides "Sign in" below the `sm` breakpoint (`HeaderAuth.tsx`).
- Files: `src/app/page.tsx` (branch by shell and session), `src/app/_components/HeaderAuth.tsx`, `src/app/profile/page.tsx`. Size: S.

**Change B2. Guests act without an account.** For the day alpha opens: Boost and RSVP from a shared link need no sign-in. Credit: Partiful, "Invite anyone with a link - guests don't need the app!" (https://apps.apple.com/us/app/id1662982304). Already partly true on the web (`BoostForm.tsx` asks for an email or handle). Not needed while `ALPHA_LOCK` is true. Size: M. Defer.

### C. Home (build first: #2)

**Change C1. "Mine" home.** Signed-in Home lists your Hearths as large cards (avatar, name, status, backers, boosts, receipts, "+N this week") with a "needs you" strip on top: pending review, Meme Engine drafts waiting for approval, upcoming Sparks in the next 7 days. Pull-to-refresh. Credit: Luma's Home tab, "Your Events" as "the main hub for upcoming and past events" (https://help.luma.com/p/luma-ios-app); Kickstarter's Backings Dashboard "which highlights backed projects with pending actions" (https://apps.apple.com/us/app/id596961532); Patreon's split Home and Membership feeds (https://apps.apple.com/us/app/patreon/id1044456188). Also keep a plain newest-first list available, because Patreon users complained when Home lost "reverse-chronological order" (same listing).
- Data: `/api/capsules/by-fid` already returns Hearths by fid (`YourSparks.tsx`); extend with counts and "new since last open" (store last-seen timestamp per device in localStorage first, no migration).
- Files: `src/app/page.tsx`, new `src/app/_components/MyHome.tsx`, `src/app/_components/YourSparks.tsx` (reuse/retire), `src/app/api/capsules/by-fid/route.ts`. Size: M.

**Change C2. Marketing landing stays for web visitors only.** Keep `/` as is for signed-out web traffic; the shell never shows it. Files: `src/app/page.tsx`. Size: S (part of C1).

### D. Hearth page (build first: #3 touches this)

Current page is a 460-line vertical stack: back link, header with two 32px buttons, chips, link pills, stats, About, Integrations, Boost, Receipts, Backers.

**Change D1. Action row of large buttons under the header: Share, Boost, Edit.** 44pt each. Edit appears only to the owner and links to the currently orphaned `/c/[slug]/settings`. Credit: Luma host tools, share "through any app, share a poster image, or use 'Show QR Code'" (https://help.luma.com/p/luma-ios-app). Files: `src/app/c/[slug]/page.tsx`, `ShareButton.tsx`, `CopyButton.tsx`, `OwnerBadge.tsx`. Size: S-M.

**Change D2. Segmented control: Sparks / Receipts / Backers / About.** Replace the long scroll with one section visible at a time, default Sparks. Credit: Partiful's event page pattern of comments, photos and "who else is going" on one page (https://apps.apple.com/us/app/id1662982304) and Bandcamp's filtered collection views (https://apps.apple.com/jp/app/id706408639). Files: `src/app/c/[slug]/page.tsx`, new client `HearthTabs.tsx`. Size: M.

**Change D3. Share as QR plus native share sheet.** "Show QR Code" for in-person shows is the Luma pattern; for ZAO events this fits the live-venue use. Native share sheet needs `@capacitor/share` (new dependency; ask). Size: S-M.

**Change D4. Boost without typing.** When signed in, one tap boosts as you; `BoostForm.tsx` should not ask "your email or handle" of someone already known. Files: `BoostForm.tsx`, `src/app/api/boost/route.ts` (read session fid). Size: S.

### E. Creating a Hearth (build first: #4) and a Spark (build first: #5)

**Change E1. One create flow, named "New Hearth".** Today `/start` (email, no `owner_fid`) and the form on `/profile` (`owner_fid` set) do the same job with different ownership. Collapse to one bottom sheet, opened from the + tab, with 2 required fields (name, type as segmented buttons not a `<select>`), bio optional, no email when signed in. Stop `autoFocus` raising the keyboard before the user has read the sheet. Credit: Luma/Partiful speed, "Create a beautiful event page in just a few seconds" (https://apps.apple.com/us/app/luma-delightful-events/id1546150895) and "Takes two seconds, looks like you tried" (https://apps.apple.com/us/app/id1662982304).
- Rename: UI strings "Light your spark" / "Light a spark as you" become "New Hearth". Keep `/api/capsules/create-spark` path to avoid churn, or rename when a migration happens.
- Files: `src/app/_components/StartForm.tsx`, `CreateSparkAsFarcaster.tsx`, `src/app/start/page.tsx`, `src/app/profile/page.tsx`, `src/app/api/capsules/create-spark/route.ts`. Size: M.

**Change E2. Sparks as a real object (L, needs Zaal's OK on a migration).** A Spark = title, date and time, optional place or link, kind (show, drop, release, collab, launch), belongs to a Hearth. "New Spark" form with those four fields from a Hearth's Sparks tab, with template presets per kind. List shows upcoming first. On the Home "needs you" strip, upcoming Sparks appear. Then, in order of value: share link/QR per Spark, "I'm in" button (a free RSVP that becomes a backer row), reminders. Credit: Luma's template-first event page and RSVP tracking, "Track RSVPs in real-time" (https://help.luma.com/p/luma-ios-app); Partiful's polling and RSVP counts (https://apps.apple.com/us/app/id1662982304). This is the thing that makes the README's Hearth + Spark model true in the product.
- Why large: new table `sparks` (+ RLS), API routes (create, list, RSVP), form, list, validation schemas. `CLAUDE.md` rule: ask before any DB migration.
- Files: new `supabase/migrations/0007_sparks.sql`, new `src/app/api/sparks/route.ts`, `src/lib/validation/schemas.ts`, `src/lib/supabase/types.ts`, `src/app/c/[slug]/page.tsx`, new `_components/NewSparkSheet.tsx`, `_components/SparkList.tsx`. Size: L.
- Gate check from `CLAUDE.md` (4 anti-failure gates): earns/participates/distributes - yes (RSVP is participation); measurable - yes; strengthens Hearth data - yes; testable with a real project in 30 days - yes (the ZAO's own shows).

### F. Explore

**Change F1. Search pinned at the top, filters in a bottom sheet.** Today `src/app/explore/page.tsx` shows search, type/status/flag chips and a sort select all inline, then a card grid. On a phone, show one search field, one "Filters" button with a count badge, and a single-column list of tall cards (avatar, name, one line, backers). Credit: Luma's discovery filters for "date, category, and time of day" (https://apps.apple.com/us/app/luma-delightful-events/id1546150895); Kickstarter's "new sort and filter options in Search" (https://apps.apple.com/us/app/id596961532). Files: `src/app/explore/page.tsx`. Size: M.

**Change F2. A "Rising" row.** Top of Explore: Hearths with the most new backers this week (the page already computes `newThisWeek`, sort key "momentum"). Credit: Zora's "Discover emerging creators, posts, and trends in real time" (https://apps.apple.com/app/id6474192103), taking only the ranked-rising idea and none of the trading. Files: `src/app/explore/page.tsx`. Size: S.

### G. Me (profile)

**Change G1. Rename /profile to "Me", make it quiet.** Contents: avatar and handle, a list of Hearths with "Manage", notification toggles (later), About Sparkz, Sign out. Remove the inline creation form (moves to the + sheet) and the "ZAO profile" title. Files: `src/app/profile/page.tsx`, `YourSparks.tsx`, `CreateSparkAsFarcaster.tsx`. Size: S-M.

**Change G2. Notification settings in two groups: "My Hearths" and "Sparks I'm in".** Credit: Patreon "more granular notification settings" (https://apps.apple.com/us/app/patreon/id1044456188); Luma's customizable alerts (https://help.luma.com/p/luma-ios-app). Depends on push existing (item H1). Size: M.

### H. Later, native (not in the top 5)

**H1. Push notifications.** The reason to open the app tomorrow. Two routes: Farcaster mini app notifications (the docs say the SDK covers "sending notifications": https://miniapps.farcaster.xyz/docs/getting-started; only works for people who open Sparkz as a mini app in a Farcaster client, not the standalone shell) or native APNs via `@capacitor/push-notifications` (new dependency, server work, new build). Size: L. Ask first (dependency, env vars).

**H2. Lock-screen countdown for Sparks.** Luma's Live Activities "starting 1 hour before your events" (https://help.luma.com/p/luma-ios-app). Needs native Swift (a Widget extension), not possible in a pure WebView. Size: L. Real value for showrunners; revisit after E2.

**H3. Skeletons and pull-to-refresh.** Pages are `force-dynamic` and block on the server. Add `loading.tsx` skeletons per route. Credit: Luma's "rebuilt app that feels faster" (https://apps.apple.com/us/app/luma-delightful-events/id1546150895). Files: `src/app/c/[slug]/loading.tsx`, `src/app/explore/loading.tsx`, `src/app/loading.tsx`. Size: S.

### I. Cross-cutting fixes

- **Tap targets (build first: #3).** Raise to at least 44x44: hamburger (`MobileNav.tsx`, `h-8 w-8`), copy and share buttons (`CopyButton.tsx`, `ShareButton.tsx`), link pills and tag chips on `c/[slug]/page.tsx`, avatar pill in `HeaderAuth.tsx`, "Sign out" text link on `profile/page.tsx`, filter chips in `explore/page.tsx`. Credit: "a button needs a hit region of at least 44x44 pt" (https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json). Size: S.
- **Pressed states.** Add `:active` styles alongside every `:hover` (`globals.css`, `.btn-spark`, `.glass-hover`), and wrap hover rules in `@media (hover: hover)`. Size: S.
- **Safe areas.** Re-check header + body padding on a notched phone, and the tab bar bottom inset. Files: `globals.css`, `layout.tsx`. Size: S.
- **No emoji.** Remove from `src/app/hearth/page.tsx` and the `fc:frame` button labels. Size: S.

## Suggested build order

1. Day 1: #3 tap-target and pressed-state pass, D4 boost without typing, B1 shell sign-in screen. All S.
2. Day 2-3: #1 tab bar and shell chrome (A1, A2). Ship, install, use it for a day.
3. Day 3-5: #2 Mine home (C1), then #4 unified New Hearth sheet (E1), D1 action row, G1.
4. After Zaal approves the migration: #5 Sparks (E2), then D2 tabs.
5. Later: F1/F2 Explore, H3 skeletons, then H1 push and A3 in-app browser (both need new dependencies and a new TestFlight build).

Because `server.url` loads the live site, items 1-4 ship with a normal Vercel deploy and no TestFlight rebuild (`docs/TESTFLIGHT.md`). Only A3, D3 (native share), H1 and H2 need a new build.

## Questions that decide scope

1. Is a Spark an event with a date (Luma-style) or a looser "moment"? The design above assumes an event with a date. Default if unanswered: event with a date.
2. May I draft the `sparks` migration (ask-before-migration rule)? Default: draft only, do not apply.
3. Should the tab bar be Home / Explore / + / Me, or Home / Sparks / Explore / Me with + on Home? Default: Home / Explore / + / Me.
