"use client";

import Link from "next/link";
import { useViewerProfile } from "@/lib/view-as";

// The header's "Try Sparkz" call to action, for signed-out visitors only. Zaal, 16 Nov
// 2026 ("too many buttons"): signed in, the header showed his avatar, Try Sparkz and
// the menu. A signed-in person has already tried it.
export default function TryCta() {
  const { isAuthenticated } = useViewerProfile();
  if (isAuthenticated) return null;
  return (
    <Link href="/start" className="web-only btn-spark rounded-lg px-4 py-1.5 text-sm">
      Try Sparkz
    </Link>
  );
}
