import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession } from "@/lib/session";

// Issue #381: every mutating route (admin- or owner-gated, and the public boost, team and waitlist writes) refuses a cross-site POST with 403
// as its first step, before auth, body parsing or any database call. The session check
// already ignored cross-site requests (sessionClaims), so this is a second wall.
// Each request carries an ADMIN session cookie, so a route that skipped the guard would
// reach its handler instead of answering 403.

const ROUTES: Record<string, () => Promise<{ POST: (req: NextRequest) => Promise<Response> }>> = {
  "account/delete": () => import("./account/delete/route"),
  "admin/claim-hearth": () => import("./admin/claim-hearth/route"),
  "admin/seed-zao": () => import("./admin/seed-zao/route"),
  audit: () => import("./audit/route"),
  backers: () => import("./backers/route"),
  "capsules/add-repo": () => import("./capsules/add-repo/route"),
  "capsules/approve": () => import("./capsules/approve/route"),
  "capsules/import-empire": () => import("./capsules/import-empire/route"),
  "capsules/import-repo": () => import("./capsules/import-repo/route"),
  "capsules/link-empire": () => import("./capsules/link-empire/route"),
  "capsules/link-farcaster": () => import("./capsules/link-farcaster/route"),
  "capsules/media-kit": () => import("./capsules/media-kit/route"),
  "capsules/plugins": () => import("./capsules/plugins/route"),
  capsules: () => import("./capsules/route"),
  "signals/approve": () => import("./signals/approve/route"),
  "signals/detect": () => import("./signals/detect/route"),
  signals: () => import("./signals/route"),
  upload: () => import("./upload/route"),
  boost: () => import("./boost/route"),
  team: () => import("./team/route"),
  waitlist: () => import("./waitlist/route"),
};

const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret

function crossSitePost(path: string, headers: Record<string, string>) {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  const h = new Headers({ "content-type": "application/json", ...headers });
  h.set("cookie", `${SESSION_COOKIE}=${mintSession(19640)}`);
  return new NextRequest(`https://trysparkz.com/api/${path}`, { method: "POST", headers: h, body: "{}" });
}

for (const [path, load] of Object.entries(ROUTES)) {
  test(`POST /api/${path} refuses a cross-site request with 403`, async () => {
    const { POST } = await load();
    const variants: Record<string, string>[] = [{ "sec-fetch-site": "cross-site" }, { origin: "https://evil.example" }];
    for (const headers of variants) {
      const res = await POST(crossSitePost(path, headers));
      assert.equal(res.status, 403, JSON.stringify(headers));
      assert.deepEqual(await res.json(), { ok: false, error: "Cross-site request refused" });
    }
  });
}

test("the table covers the 17 gated routes listed in issue #381 plus boost, team, waitlist and account delete", () => {
  assert.equal(Object.keys(ROUTES).length, 21);
});
