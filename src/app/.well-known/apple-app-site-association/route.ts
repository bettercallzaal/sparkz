import { NextResponse } from "next/server";

// Apple App Site Association: lets a trysparkz.com link open the Sparkz iPhone app
// instead of Safari (universal links). Served at /.well-known/apple-app-site-association
// as JSON. The app claims the domain with the entitlement
// `applinks:trysparkz.com` (ios/App/App/App.entitlements); iOS fetches this file through
// Apple's CDN when the app is installed. www redirects to the apex, and Apple does not
// follow redirects for this file, so only the apex is claimed.
//
// App ID = Apple team ID + bundle id. Team AYJY22EEPG is Zaal's (scripts/testflight.sh).
export const dynamic = "force-static";

const APP_ID ="AYJY22EEPG.com.trysparkz.app";

export function GET() {
  return NextResponse.json({
    applinks: {
      details: [
        {
          appIDs: [APP_ID],
          // First match wins. API routes and other .well-known files stay on the web.
          components: [
            { "/": "/api/*", exclude: true },
            { "/": "/.well-known/*", exclude: true },
            { "/": "/*" },
          ],
        },
      ],
    },
  });
}
