"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useProfile } from "@farcaster/auth-kit";

// "View as": lets an admin see Sparkz the way other people see it (Zaal, 2026-11-12:
// "a button to view as Zaal, view as guest, view as ZAO member").
//
// UI ONLY. This module changes what client components RENDER. It never touches the
// session cookie, never sends anything to the server, and grants nothing: every API
// route still decides from the real verified session (lib/session.ts, lib/auth.ts).
// So an admin viewing as Guest who taps Boost is still boosting as themself.
//
// The mode is honoured only while the server says the real session is an admin
// (/api/auth/me). For anyone else it is ignored, so a value planted in localStorage
// changes nothing.

export type ViewAs = "self" | "member" | "user" | "guest";

export const VIEW_AS_LABELS: Record<ViewAs, string> = {
  self: "Zaal (admin)",
  member: "ZAO member",
  user: "Signed in, not a member",
  guest: "Guest (signed out)",
};

const KEY = "sparkz_view_as";
const EVENT = "sparkz:view-as";

interface Me {
  fid: number | null;
  admin: boolean;
}

// One /api/auth/me read per page load, shared by every component.
let mePromise: Promise<Me> | null = null;
let meValue: Me | null = null;
const meListeners = new Set<() => void>();

function loadMe(): Promise<Me> {
  if (!mePromise) {
    mePromise = fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => ({
        fid: j?.ok && typeof j.data?.fid === "number" ? j.data.fid : null,
        admin: Boolean(j?.ok && j.data?.admin),
      }))
      .catch(() => ({ fid: null, admin: false }))
      .then((me) => {
        meValue = me;
        meListeners.forEach((l) => l());
        return me;
      });
  }
  return mePromise;
}

function subscribeMe(l: () => void) {
  meListeners.add(l);
  return () => meListeners.delete(l);
}

function readMode(): ViewAs {
  try {
    const v = localStorage.getItem(KEY);
    return v === "member" || v === "user" || v === "guest" ? v : "self";
  } catch {
    return "self";
  }
}

function subscribeMode(l: () => void) {
  window.addEventListener(EVENT, l);
  window.addEventListener("storage", l);
  return () => {
    window.removeEventListener(EVENT, l);
    window.removeEventListener("storage", l);
  };
}

export function setViewAs(mode: ViewAs): void {
  try {
    if (mode === "self") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    // Storage blocked: the switch simply does not stick.
  }
  window.dispatchEvent(new Event(EVENT));
}

export interface Viewer {
  /** /api/auth/me has answered. */
  ready: boolean;
  /** The REAL server-verified admin flag. Only this decides whether View-as shows. */
  realAdmin: boolean;
  /** The mode in effect (always "self" unless realAdmin). */
  viewAs: ViewAs;
  /** What the UI should treat as the signed-in FID (null for Guest). */
  fid: number | null;
  signedIn: boolean;
  /** Admin-only UI should key off this, so viewing as someone else hides it. */
  admin: boolean;
  /** True only in the ZAO member view; false or null otherwise (unknown for real). */
  member: boolean | null;
}

export function useViewer(): Viewer {
  useEffect(() => {
    loadMe();
  }, []);
  const me = useSyncExternalStore(subscribeMe, () => meValue, () => null);
  const stored = useSyncExternalStore(subscribeMode, readMode, () => "self" as ViewAs);

  const realAdmin = Boolean(me?.admin);
  const viewAs: ViewAs = realAdmin ? stored : "self";
  const realFid = me?.fid ?? null;

  if (viewAs === "guest") {
    return { ready: !!me, realAdmin, viewAs, fid: null, signedIn: false, admin: false, member: false };
  }
  if (viewAs === "member" || viewAs === "user") {
    return {
      ready: !!me,
      realAdmin,
      viewAs,
      fid: realFid,
      signedIn: realFid !== null,
      admin: false,
      member: viewAs === "member",
    };
  }
  return {
    ready: !!me,
    realAdmin,
    viewAs,
    fid: realFid,
    signedIn: realFid !== null,
    admin: realAdmin,
    member: null,
  };
}

// Drop-in for auth-kit's useProfile(): same shape, but an admin viewing as Guest gets
// the signed-out shape. Components that branch on isAuthenticated/profile use this.
export function useViewerProfile(): ReturnType<typeof useProfile> {
  const real = useProfile();
  const viewer = useViewer();
  if (viewer.viewAs !== "guest") return real;
  return { ...real, isAuthenticated: false, profile: {} as ReturnType<typeof useProfile>["profile"] };
}
