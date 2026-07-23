import type { MediaKitProvider } from "./types";
import { barazaProvider } from "./baraza";
import { stubProvider } from "./stub";

// MediaKit seam - the Baraza TV "streaming media kit" integration.
//
// A Capsule turns on a "stream" capability by rendering its spark/recap into an
// AI-anchor video through Baraza TV. This selector returns the LIVE Baraza client
// when BARAZA_API_URL is configured, and the offline STUB otherwise - so Sparkz can
// build and test the whole flow now and flip to the real renderer the moment Aziz
// ships his API, with zero code change (just set the env).

export function getMediaKitProvider(): MediaKitProvider {
  return process.env.BARAZA_API_URL ? barazaProvider : stubProvider;
}

export function mediaKitMode(): "baraza" | "stub" {
  return process.env.BARAZA_API_URL ? "baraza" : "stub";
}

export * from "./types";
