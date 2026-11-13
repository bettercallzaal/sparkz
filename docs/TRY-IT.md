# Try it: what you can do in Sparkz now

A checklist for trying the app end to end, on trysparkz.com or in the iPhone app.
Each step says where to tap and what you should see. It covers what merged on
12 to 13 Nov 2026 (#352 to #370). Sign in with Farcaster first (Me, then Sign in).

Most of these need an admin or owner session. Under the private alpha only the admin
FID and the listed testers can sign in (`src/lib/alpha-access.ts`).

## 1. Make Sparkz yours (start here)

1. **Me, then the Admin card, then "Set up the ZAO Hearths"** (#359).
   - It adds ZAO DEVZ, IMan Afrikah and ZAO Festivals if they are missing.
   - It makes you the owner of ZABAL, ZABAL Gamez, CoC ConcertZ and Sparkz where nobody owns them.
   - It says what it added. Tapping it twice is safe.
2. **Home** now lists your Hearths. On any Hearth with no owner, an admin also sees **"Make me the owner"** next to Share and Boost.

## 2. Home

- **New on your Hearths** (#356): the newest backings and boosts on Hearths you own, with a dot on the ones since your last look. Each row opens that Hearth's Backers tab.
- **Hearths you back** (#367): every Hearth you have boosted or backed, newest first.

## 3. A Hearth you own: Edit (the Manage page)

Open a Hearth, then **Edit**.

- **Details** (#363): name, one-line bio, about, tags, links. Links and the picture must be https.
- **Upload a picture** (#364): pick a photo (png, jpeg, webp or gif, up to 2 MB). The Picture field fills; then press Save details.
- **How it looks when shared** (#370): the card the link makes, a copy button, and Share. On iPhone, Share then Farcaster opens the Farcaster app (#360).
- **Backers** (#368): totals (backers, boosts, the last 7 days) and the newest backers.
- **Farcaster** and **Empire Builder treasury** (#358, admins): link the Hearth's FID, @username and channel, or its empire.
- **Put to sleep** / **Light it again** (#365): takes the Hearth off Explore's main list without deleting anything. Explore's "dormant" chip still shows it.
- **Visibility**: choose which integrations show on the public page.

## 4. Admin

- **Me, then Admin**, or go to **/admin** directly (#352).
- **/admin/hearths, All Hearths** (#366): every Hearth (pending, rejected, asleep, ownerless) with filter chips, plus Approve, Reject, Sleep, Make me the owner and Manage on each row.
- **/admin/pending**: the review queue for new self-serve Hearths.

## 5. View as (admins)

**Me, then View as** (#353). Choose Zaal (admin), ZAO member, Signed in (not a member) or Guest (signed out).

- A bar at the top says who you are viewing as, with Exit.
- It changes only what you see: anything you tap still runs as you.

Things to check in each view:

- **Guest:** Home shows the signed-out page, there are no Edit buttons, and Boost shows "private testing, join the waitlist" (#357).
- **Signed in:** your Hearths show, but the Admin card and All Hearths do not.

## 6. What visitors see under the private alpha

- **Boost** on a Hearth, and the **team** form on /zao, say "Sparkz is in private testing" and offer the waitlist up front (#357). They no longer fail after you fill them in.

## Not yet in the app

- **Posting to Farcaster from Sparkz with your own key:** Iman's #362 (Hypersnap app key), which needs #344 first.
- **The ZAO Hearths via the Database workflow** (#355): needs the 3 Production secrets. The button in section 1 does the same job from inside the app.
- **CI running the unit tests** (#354).

If something here does not behave as written, that is a bug. Note which step failed.
