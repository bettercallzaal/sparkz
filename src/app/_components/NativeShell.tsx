"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Marks <html data-shell="ios"> when Sparkz runs inside the iPhone app (the Capacitor
// shell that loads trysparkz.com). CSS in shell.css then hides the web-only chrome
// (marketing footer, hamburger menu, "Try Sparkz" button) and shows the bottom tab bar.
//
// Three signals, any one is enough:
// 1. Capacitor's native bridge reports a native platform.
// 2. The shell's user agent carries "SparkzApp" (capacitor.config.ts appendUserAgent).
// 3. "?shell=ios" in the URL, kept for the tab session, so the layout can be checked
//    in a desktop browser or a Vercel preview without a phone.
const KEY = "sparkz-shell";

export function isShell(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    // no bridge: a normal browser tab
  }
  if (navigator.userAgent.includes("SparkzApp")) return true;
  try {
    const q = new URLSearchParams(window.location.search).get("shell");
    if (q === "ios") sessionStorage.setItem(KEY, "ios");
    if (q === "off") sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === "ios";
  } catch {
    return false;
  }
}

export default function NativeShell() {
  useEffect(() => {
    if (isShell()) document.documentElement.dataset.shell = "ios";
  }, []);
  return null;
}
