import { Capacitor } from "@capacitor/core";

// Native extras for the iPhone app (the Capacitor shell that loads trysparkz.com):
// the system share sheet and haptics. Every helper is a no-op on the website and on
// an older TestFlight build that lacks the plugin, so callers keep their web path.

export function isNativeIos(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
}

// The share plugin rejects when the person closes the sheet without sharing. That is
// still a handled share: the caller must not open its own menu on top of it.
export function shareWasCancelled(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /cancel/i.test(msg);
}

// Opens the iOS share sheet. Returns true when the sheet handled it (shared or
// closed), false when the caller should fall back to its own share menu.
export async function nativeShare(opts: { title?: string; text?: string; url: string }): Promise<boolean> {
  if (!isNativeIos()) return false;
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title: opts.title, text: opts.text, url: opts.url, dialogTitle: opts.title });
    return true;
  } catch (err) {
    return shareWasCancelled(err);
  }
}

// A short tap on the phone. "success" after a boost lands, "light" for small taps.
export async function haptic(kind: "success" | "light" = "light"): Promise<void> {
  if (!isNativeIos()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "success") await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Plugin missing in this build: no haptic, nothing else changes.
  }
}
