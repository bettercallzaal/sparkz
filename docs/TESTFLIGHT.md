# Sparkz on TestFlight

How to put the Sparkz iPhone app on TestFlight, step by step, so Zaal's Claude can walk him through it on the Mac. Written 11 Nov 2026 from the ZAO research (docs 218, 416, 966) and the WaveWarZ DJ Wavy TestFlight run of 3 Jul 2026.

## What this is

Sparkz is a server-rendered Next.js app (API routes, middleware, Supabase, sign in with Farcaster). It cannot be exported to static files and bundled into an app. So the iPhone app is a thin native shell (Capacitor 8) that loads the live site from `https://trysparkz.com`. That means:

- Every Vercel deploy updates the app. No new TestFlight build for a copy or feature change.
- A new build is only needed when the native shell changes (icon, name, plugins, allowed hosts).
- TestFlight internal testing needs no Apple review. Good enough for the alpha, where only Zaal and IMan can sign in anyway (`src/lib/alpha-access.ts`).
- The App Store proper will want native-feeling features (Apple guideline 4.2, "minimum functionality"). Not a concern for TestFlight. Later: push notifications and the Farcaster share sheet make it pass.

## Already in this repo

| File | What |
|---|---|
| `capacitor.config.ts` | App id `com.trysparkz.app`, name Sparkz, loads trysparkz.com, allowed hosts for Farcaster sign-in, WalletConnect and Supabase, dark splash |
| `cap-www/index.html` | The loading screen for the first second, and the fallback if the site is down |
| `assets/icon.png`, `assets/splash.png` | 1024 icon (the Sparkz logo, no transparency, as Apple wants) and a 2732 splash. `npm run cap:assets` turns them into every iOS size |
| `package.json` | `@capacitor/core`, `@capacitor/ios`, `@capacitor/cli`, `@capacitor/assets`, `@capacitor/splash-screen` and the `cap:*` scripts |
| `src/app/layout.tsx`, `src/app/globals.css` | `viewport-fit=cover` plus safe-area padding so the header is not under the notch |

The `ios/` folder (the Xcode project) is NOT in the repo yet. It is generated on the Mac in step 3 and committed from there.

## Before you start (Zaal, once)

1. Apple Developer Program is live on Zaal's Apple ID since 3 Nov 2026 (Individual, $99/yr). Check at https://developer.apple.com/account. Two-factor must be on.
2. A Mac with Xcode 16 or newer from the Mac App Store (about 15 GB). Open it once, accept the licence, let it install the iOS platform when asked.
3. Command line tools: `xcode-select --install`. CocoaPods: `sudo gem install cocoapods` (or `brew install cocoapods`).
4. Node 20 or newer on the Mac.
5. TestFlight app on the iPhone (App Store, free).

## Steps on the Mac (Zaal's Claude runs these)

### 1. Get the code

```bash
git clone https://github.com/bettercallzaal/sparkz.git
cd sparkz
git checkout ios-testflight   # or main once the PR is merged
npm install
```

### 2. Generate the icons and splash screens

```bash
npm run cap:assets
```

Writes every iOS icon and splash size into `ios/` once it exists (run again after step 3 if it complains the platform is missing).

### 3. Create the Xcode project

```bash
npx cap add ios
npx cap sync ios
npm run cap:assets
npx cap open ios
```

Xcode opens `ios/App/App.xcworkspace`.

### 4. In Xcode, project "App", target "App"

- Signing & Capabilities: tick "Automatically manage signing", Team = Zaal's team (his name, Individual).
- General: Bundle Identifier `com.trysparkz.app`, Display Name `Sparkz`, Version `0.1.0`, Build `1`, Minimum Deployments iOS 16.0.
- Info tab: add the key `App Uses Non-Exempt Encryption` (`ITSAppUsesNonExemptEncryption`) = `NO`. Without it every TestFlight build stops on a compliance question (lesson from DJ Wavy).
- Info tab: `App Transport Security Settings` is not needed, everything is https.

### 5. Try it on the iPhone first

Plug the iPhone in, pick it as the run target, press Run. First time: on the phone, Settings > General > VPN & Device Management > trust the developer. The app should open on trysparkz.com. Check:

- Sign in with Farcaster: the Warpcast prompt opens and comes back to the app.
- The header sits below the notch.
- A link to another site opens Safari, a link inside Sparkz stays in the app.

### 6. App Store Connect record (once)

https://appstoreconnect.apple.com > My Apps > + > New App:

- Platform iOS, Name `Sparkz`, Primary language English (U.S.), Bundle ID `com.trysparkz.app` (appears after the first Xcode signing), SKU `sparkz-ios`, Full access.

### 7. Archive and upload

In Xcode: set the run target to "Any iOS Device (arm64)", then Product > Archive. When the Organizer opens: Distribute App > TestFlight Internal Only > Upload. Keep the defaults (upload symbols, manage version and build number).

Processing takes 5 to 60 minutes. App Store Connect emails when the build is ready.

### 8. Testers

App Store Connect > the app > TestFlight:

- Internal Testing > + > group `ZAO team`. Internal testers must be App Store Connect team members: Users and Access > + > invite with the Developer role, then add them to the group. Zaal and IMan first.
- Each tester gets an email, opens it on the iPhone, TestFlight installs Sparkz.
- External groups (anyone by email, up to 10,000) need Beta App Review once, about 48 hours. Not for the alpha.

### 9. Next builds

Only when the native shell changes:

```bash
npx cap sync ios
```

then bump Build to 2 in Xcode and repeat step 7. Builds expire after 90 days. Site changes need nothing.

**Or with no clicks:** `scripts/testflight.sh` syncs, bumps the build number and archives. It exports a signed .ipa, then uploads it with an App Store Connect API key. Signing uses the Apple ID signed in to Xcode on the Mac (Xcode > Settings > Accounts, team AYJY22EEPG), the same identity as an Archive click. The key only uploads, so the App Manager role is enough and it never needs Admin. Cloud signing with an App Manager key fails with "Cloud signing permission error" (measured 12 Nov 2026).

1. Once, Zaal creates a Team API key in App Store Connect (Users and Access > Integrations > App Store Connect API, role App Manager). He downloads `AuthKey_<KEY_ID>.p8` to `~/.zao/private/asc/` and runs `chmod 600` on it. Then `zao-env save asc` with two lines, `ASC_KEY_ID=...` and `ASC_ISSUER_ID=...`.
2. Each build: `scripts/testflight.sh --dry-run` first if anything native changed. It archives and exports a signed .ipa, uploads nothing, needs no API key, and puts the build number back. Then `scripts/testflight.sh`.
3. Commit the bumped `ios/App/App.xcodeproj/project.pbxproj`.

The script stops with a message if an ID, the key file or `ios/` is missing. It also stops if the key sits inside the repo or is world-readable. It never prints the key.

## Known gaps, for later

- Push notifications: `@capacitor/push-notifications` plus an APNs key from the developer account. Needs a small API route on Sparkz to store device tokens.
- Open in app from a shared link: Associated Domains (`applinks:trysparkz.com`) plus `/.well-known/apple-app-site-association` served by Next. Then a Sparkz link in Telegram opens the app.
- Android: `npx cap add android`, Play Console internal track, $25 once. Same shell, see research doc 416.
- Sign in with Farcaster uses the relay, so no custom URL scheme is needed. If a wallet app ever fails to return to Sparkz, add a `sparkz` URL scheme in Info > URL Types and allow it in the wallet's redirect settings.

## Sources in the ZAO research

- 218 mobile app strategy (PWA vs Capacitor vs Expo)
- 416 TestFlight and Play Store playbook (Capacitor, limits, review times)
- 966 Expo to TestFlight (the DJ Wavy day: encryption key, internal testers must be team members, test on the device early)

## Rebuild once for the native tab bar (12 Nov 2026)

The HTML tab bar from #324 is now a fallback. On a build that includes
`@capgo/capacitor-native-navigation`, the app draws the system tab bar
(UITabBar, Liquid Glass on iOS 26) and native pull-to-refresh on Home and
Explore (`src/app/_components/NativeChrome.tsx`). That plugin is native code, so
it needs one new TestFlight build:

```bash
git pull
npm install
npx cap sync ios
npx cap open ios
```

Then in Xcode: Product, Archive, Distribute App, TestFlight, as in the steps
above. After that, site changes keep flowing with normal Vercel deploys. The
`capacitor.config.ts` change (`contentInset: "never"`) ships in the same build.
