"use client";

import { useEffect } from "react";

// Tells the Farcaster host the app is ready (hides the splash). No-op outside a
// Mini App context. SDK is dynamically imported so it never touches the server
// bundle or plain-web loads.
export default function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        const inMiniApp = await sdk.isInMiniApp();
        if (!cancelled && inMiniApp) {
          await sdk.actions.ready();
        }
      } catch {
        // not in a Mini App / SDK unavailable - ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
