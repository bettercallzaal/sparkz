// The public TestFlight link for the Sparkz iOS beta, from SPARKZ_TESTFLIGHT_URL.
// Unset, or anything but a testflight.apple.com/join link, means no "Try the iOS beta"
// button: the link only exists once Apple approves a build and Zaal turns the Public
// Link on, and setting the variable is the moment it goes public.

const TESTFLIGHT_JOIN = /^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/;

export function iosBetaUrl(raw: string | undefined = process.env.SPARKZ_TESTFLIGHT_URL): string | null {
  const v = raw?.trim();
  return v && TESTFLIGHT_JOIN.test(v) ? v : null;
}
