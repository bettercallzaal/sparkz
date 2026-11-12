# App research (fetched 12 Nov 2026)

Method: WebFetch of App Store listings, vendor help pages and Apple design docs. A WebFetch returns a summary of the page text, not screenshots, so what I can cite is what the listing and help pages SAY (features, release notes, copy). Layout and navigation claims are limited to what that text states. Where a point is my inference it is marked [Inference]. I did not describe any app from memory.

## Fetch log

| Target | Result |
|---|---|
| https://apps.apple.com/us/app/patreon/id1044456188 | OK |
| https://apps.apple.com/us/app/warpcast/id1600555445 | OK (listing now titled Farcaster, "Formerly Warpcast") |
| https://help.luma.com/p/luma-ios-app | OK |
| https://apps.apple.com/us/app/luma-delightful-events/id1546150895 | OK (https://luma.com/ios redirects here) |
| https://apps.apple.com/us/app/id596961532 (Kickstarter) | OK |
| https://help.kickstarter.com/hc/en-us/articles/360043244853-How-do-I-follow-creators-through-the-app | OK |
| https://apps.apple.com/us/app/id1662982304 (Partiful) | OK |
| https://apps.apple.com/jp/app/id706408639 (Bandcamp) | OK, but this page does not mention a feed or notifications |
| https://apps.apple.com/app/id6474192103 (Zora) | OK |
| https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json | OK (the normal HIG page URL returned only a title, so I used this JSON endpoint of the same page) |
| https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json | OK |
| https://developer.apple.com/design/human-interface-guidelines/layout | FAILED (title only, no body). Safe-area detail not used. |
| https://developer.apple.com/app-store/review/guidelines/ | OK, first 100k of 114k characters read (4.2 is in that part) |
| https://docs.farcaster.xyz/developers/guides/mini-apps/introduction | FAILED (404) |
| https://docs.farcaster.xyz/mini-apps | FAILED (404) |
| https://miniapps.farcaster.xyz/docs/getting-started | OK but thin |
| https://luma.com/ios | Redirect only, followed manually |

Not fetched, so not used: Discord, Supercast, Highlight, Fourthwall, Bandcamp's own site. Web searches returned aggregator summaries that I did not treat as fetches.

## 1. Patreon (creator-community and backer app)

Links fetched: https://apps.apple.com/us/app/patreon/id1044456188

- (a) Layout: listing says a "Home and Membership feed" (v126.23.0 notes: "an updated Home and Membership feed"). Two separate feeds: one for creators you follow, one for paid memberships. A reviewer on the listing complains the new Home "removes the ability to see posts from all of my creators in reverse-chronological order" - lesson: keep a plain chronological view of things you own.
- (b) Navigation: [Inference] feed-first, creator and member views split. Listing confirms Home feed and Membership tab.
- (c) Onboarding: free first. Copy: "JOIN the communities of creators you love for free" then "UNLOCK exclusive posts and benefits through paid membership and one-time purchases." Free follow before any paid step.
- (d) Daily loop: follow creators, read what is new in the Home feed, granular notification settings (v126.40.0 "more granular notification settings"), chats and live streams ("GATHER with creators and other fans in community chats and live streams"). Creator side gets "new post types like Quips" and "the ability to share quotes from your work" (short, repeatable posts).

## 2. Farcaster (formerly Warpcast) - the identity Sparkz signs in with

Links fetched: https://apps.apple.com/us/app/warpcast/id1600555445 ; https://miniapps.farcaster.xyz/docs/getting-started

- (a) Layout: listing lists the core as profile, public posts and replies, private messages, find users and visit profiles. Little detail on layout.
- (b) Navigation: not stated on the listing. [Inference] not usable as a navigation source from what I fetched.
- (c) Onboarding: "Create a Farcaster account and public profile"; notes "Sign up requires an in-app purchase." Identity is the entry.
- (d) Daily loop: post, reply, message. Mini apps: the docs say mini apps "can be discovered and used within Farcaster clients" and the SDK gives access to "authentication, sending notifications, and interacting with the user's wallet". This matters because Sparkz is already a mini app (`MiniAppReady.tsx`, `fc:miniapp` meta in `layout.tsx`): the notification and auth route exists, a native-feeling daily ping can come from it.

## 3. Luma (events and drops)

Links fetched: https://help.luma.com/p/luma-ios-app ; https://apps.apple.com/us/app/luma-delightful-events/id1546150895

- (a) Layout: Home tab with "Your Events" as "the main hub for upcoming and past events"; a Past tab for events attended or hosted (help page).
- (b) Navigation: Home tab (your events) plus Past tab, discovery by local calendars and curated categories (help page). Listing says filters for date, category, time of day.
- (c) Onboarding: guests get a ticket or Apple Wallet pass; hosts "Create a beautiful event page in just a few seconds" from a template gallery (listing + help). Share by any app, poster image, or "Show QR Code" for on-the-spot registration (help page).
- (d) Daily loop: Live Activities - "See real-time event details on your Lock Screen and Dynamic Island starting 1 hour before your events", with countdown, directions, ticket access (help page). Host loop: "Track RSVPs in real-time", check in by QR scan, notifications for "new registrations, messages from attendees, and event updates and changes". Chat with people you met. Release notes (2.18 on Oct 6) say a rebuilt app "feels faster".
- Closest analogue to a Spark (an event that grows a Hearth).

## 4. Kickstarter (backers)

Links fetched: https://apps.apple.com/us/app/id596961532 ; https://help.kickstarter.com/hc/en-us/articles/360043244853-How-do-I-follow-creators-through-the-app

- (a) Layout: listing says "Browse creative projects from around the world", "pledge to projects they care about, and follow their backings in one place". v5.24.0 added a "Backings Dashboard, which highlights backed projects with pending actions".
- (b) Navigation: listing does not describe tabs. Help page shows a weakness: following a creator on iOS "opens in a new browser window", i.e. the app bounces to web. A user review quoted by search (not fetched) says the same; I rely only on the help page. Lesson for Sparkz: do not make core verbs bounce out of the app.
- (c) Onboarding: v5.29.0 (11/26/2025) shipped "a new onboarding flow" plus "new sort and filter options in Search". Details not on the page.
- (d) Daily loop: a backer's home is the dashboard of things they backed that need action, plus "updates and reminders". Notifications also fire when a followed creator launches or backs a project (help page).

## 5. Partiful (invite and RSVP)

Links fetched: https://apps.apple.com/us/app/id1662982304

- (a) Layout: one event page per event with themes and posters; guests "can comment, post GIFs and photos, and see who else is going". Shared photo album after.
- (b) Navigation: an "Explore" page for nearby events; organizer and party profiles that "track past guests".
- (c) Onboarding: "Invite anyone with a link - guests don't need the app!" and "RSVPs update in real time". Tagline copy "Takes two seconds, looks like you tried". Guest never needs an account to get value.
- (d) Daily loop: "Text Blasts" to guests, comments, RSVP changes, reusable guest lists, calendar sync. [Inference] the host's return trigger is guests responding.

## 6. Bandcamp (artist and fan, collection-first)

Links fetched: https://apps.apple.com/jp/app/id706408639

- (a) Layout: the listing is about the fan's collection: "better ways to browse your collection and wishlist", filters for album, track, artist, a "shuffle all" button (v2.6.0, v3.2.0).
- (b) Navigation: collection, wishlist, playlists with public share links and custom titles/descriptions/images (v3.2.0).
- (c) Onboarding: not described on the page.
- (d) Daily loop: "instantly listen to the music they've purchased, online or offline"; "View others' playlists in the app" (3.3.2, 2025/12/08). The app's value is what you already own, ready at launch. The listing does not mention a feed or notifications, so I make no claim about them.
- Lesson: the receipt is the product. Sparkz's "record" could be a personal collection you open to see what you have backed, not a pitch.

## 7. Zora (post, coins, rising creators)

Links fetched: https://apps.apple.com/app/id6474192103

- (a) Layout: listing: post on interests, "Discover emerging creators, posts, and trends in real time".
- (b) Navigation: not described beyond feed, trade, chat and DMs.
- (c) Onboarding: not described.
- (d) Daily loop: "earn rewards when your calls are right", "No ads. Just people backing what they believe in". A reminder that a "back early" loop is the retention hook, which Sparkz explicitly avoids (no token talk, `CLAUDE.md`). Use only the idea of a visible, ranked "rising" list, not the trading.

## Apple platform rules (not an app, but they decide the answer)

Links fetched: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json ; https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json ; https://developer.apple.com/app-store/review/guidelines/

- Tab bar: "Use a tab bar to support navigation, not to provide actions." "Prefer a tab bar for navigation. A tab bar provides access to the sections of your app that people use most." "Avoid overflow tabs." "If you let people select their own tabs, aim for a default list of five or fewer." "Make sure the tab bar is visible when people navigate to different sections." "Don't disable or hide tab bar buttons, even when their content is unavailable... If a section is empty, explain why." "Include tab labels... Use single words whenever possible."
- Hit target: "a button needs a hit region of at least 44x44 pt".
- Review 4.2: "elevate it beyond a repackaged website"; 4.2.2: "apps shouldn't primarily be marketing materials, advertisements, web clippings, content aggregators, or a collection of links." Sparkz's current first screen is marketing material; fine for TestFlight internal, a risk for the App Store.

## Patterns that come out of the research

1. Home = my stuff, not a pitch (Luma "Your Events", Kickstarter Backings Dashboard, Patreon Home/Membership feed, Bandcamp collection).
2. Create an event in seconds from a template, share via link/QR (Luma, Partiful).
3. Guests do not need an account to take the first action (Partiful link, Patreon free join).
4. Return trigger is a push or lock-screen item tied to a time (Luma Live Activities, Patreon granular notifications, Kickstarter reminders).
5. Core verbs stay inside the app (Kickstarter's follow-in-browser is the counter-example).
6. A short list of bottom tabs with text labels (Apple tab bar guidance).
