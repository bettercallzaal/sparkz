import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  mintAddressSession,
  mintSession,
  readSession,
  readSessionClaims,
  sessionClaims,
  sessionConfigured,
  sessionFid,
} from "./session";

// A throwaway test key, 40 characters; never a real secret.
const KEY = "test-only-session-secret-0123456789abcdef";
const ADMIN_FID = 19640; // on the admin list, so the alpha lock lets it through

function withSecret<T>(value: string | undefined, fn: () => T): T {
  const before = process.env.SPARKZ_SESSION_SECRET;
  if (value === undefined) delete process.env.SPARKZ_SESSION_SECRET;
  else process.env.SPARKZ_SESSION_SECRET = value;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env.SPARKZ_SESSION_SECRET;
    else process.env.SPARKZ_SESSION_SECRET = before;
  }
}

// Builds a cookie value by hand, the same shape mint() writes, so a test can set exp.
function forge(claims: Record<string, unknown>, key = KEY): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const mac = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600;

test("no secret, or one shorter than 32 characters, means no session at all", () => {
  for (const value of [undefined, "", "x".repeat(31)]) {
    withSecret(value, () => {
      assert.equal(sessionConfigured(), false);
      assert.equal(mintSession(ADMIN_FID), null);
      assert.equal(mintAddressSession("0x" + "a".repeat(40)), null);
    });
  }
  // A cookie minted under a good key cannot be read once the key is gone.
  const cookie = withSecret(KEY, () => mintSession(ADMIN_FID));
  assert.ok(cookie);
  withSecret(undefined, () => assert.equal(readSession(cookie), null));
});

test("a minted FID session reads back as that FID", () => {
  withSecret(KEY, () => {
    assert.equal(sessionConfigured(), true);
    const cookie = mintSession(ADMIN_FID);
    assert.ok(cookie);
    assert.deepEqual(readSessionClaims(cookie), { fid: ADMIN_FID, address: null });
    assert.equal(readSession(cookie), ADMIN_FID);
  });
});

test("an address session is stored lowercased and carries no FID", () => {
  withSecret(KEY, () => {
    const cookie = mintAddressSession("0xABCDEF0123456789ABCDEF0123456789ABCDEF01");
    assert.deepEqual(readSessionClaims(cookie ?? undefined), {
      fid: null,
      address: "0xabcdef0123456789abcdef0123456789abcdef01",
    });
    assert.equal(readSession(cookie ?? undefined), null);
  });
});

test("a tampered payload, a wrong key or a malformed value is refused", () => {
  withSecret(KEY, () => {
    const cookie = mintSession(ADMIN_FID);
    assert.ok(cookie);
    const [, mac] = cookie.split(".");
    // Same signature, payload swapped to another FID.
    const swapped = Buffer.from(JSON.stringify({ fid: 1, exp: inAnHour() })).toString("base64url");
    assert.equal(readSessionClaims(`${swapped}.${mac}`), null);
    // Signed with a different key.
    assert.equal(readSessionClaims(forge({ fid: ADMIN_FID, exp: inAnHour() }, "another-key-".repeat(4))), null);
    for (const bad of [undefined, "", "nodot", ".", "abc.", ".abc", `${cookie}x`]) {
      assert.equal(readSessionClaims(bad), null, `accepted ${JSON.stringify(bad)}`);
    }
  });
});

test("an expired session, or one with no expiry, is refused", () => {
  withSecret(KEY, () => {
    const past = Math.floor(Date.now() / 1000) - 1;
    assert.equal(readSessionClaims(forge({ fid: ADMIN_FID, exp: past })), null);
    assert.equal(readSessionClaims(forge({ fid: ADMIN_FID })), null);
    assert.equal(readSessionClaims(forge({ fid: ADMIN_FID, exp: String(inAnHour()) })), null);
    assert.equal(readSession(forge({ fid: ADMIN_FID, exp: inAnHour() })), ADMIN_FID);
  });
});

test("claims must be a positive whole FID or a well-formed lowercase address", () => {
  withSecret(KEY, () => {
    const exp = inAnHour();
    for (const fid of [0, -5, 1.5, "19640", null]) {
      assert.equal(readSessionClaims(forge({ fid, exp })), null, `accepted fid ${JSON.stringify(fid)}`);
    }
    for (const addr of ["0x123", "0x" + "A".repeat(40), "a".repeat(42)]) {
      assert.equal(readSessionClaims(forge({ addr, exp })), null, `accepted addr ${addr}`);
    }
  });
});

function request(headers: Record<string, string>, cookie?: string): NextRequest {
  const h = new Headers(headers);
  if (cookie) h.set("cookie", `${SESSION_COOKIE}=${cookie}`);
  return new NextRequest("https://trysparkz.com/api/me/backings", { headers: h });
}

test("a route sees the session on a same-site request", () => {
  withSecret(KEY, () => {
    const cookie = mintSession(ADMIN_FID) ?? undefined;
    assert.equal(sessionFid(request({}, cookie)), ADMIN_FID);
    assert.equal(sessionFid(request({ origin: "https://trysparkz.com" }, cookie)), ADMIN_FID);
    assert.equal(sessionFid(request({ "sec-fetch-site": "same-origin" }, cookie)), ADMIN_FID);
  });
});

test("a cross-site request is treated as having no session", () => {
  withSecret(KEY, () => {
    const cookie = mintSession(ADMIN_FID) ?? undefined;
    assert.equal(sessionClaims(request({ "sec-fetch-site": "cross-site" }, cookie)), null);
    assert.equal(sessionClaims(request({ origin: "https://evil.example" }, cookie)), null);
  });
});

test("under the alpha lock, a valid session for an unlisted FID reads as none", () => {
  withSecret(KEY, () => {
    const cookie = mintSession(424242) ?? undefined;
    assert.equal(readSession(cookie), 424242); // the cookie itself is valid
    assert.equal(sessionFid(request({}, cookie)), null); // the route still sees no one
  });
});
