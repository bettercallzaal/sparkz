import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { SESSION_COOKIE, mintSession, mintAddressSession, readSessionClaims } from "@/lib/session";
import { setServiceClientForTests } from "@/lib/supabase/server";
import { fakeClient, type FakeTables } from "@/lib/db/fake-client";
import { blockedOwners } from "@/lib/blocks-server";
import { blockedOwnerOf, withoutBlocked } from "@/lib/moderation";

// The block read filters (migration 0009) that #435 left untested or uncovered: the public
// /api/capsules list, the Home showcase list, and the Hearth page's blocked branch. The
// pages are server components, so their tests run the same helpers they call
// (withoutBlocked, blockedOwnerOf) on the viewer's real blocks read (blockedOwners, the
// function viewerBlockedOwners wraps with next/headers).
const KEY = "test-only-session-secret-0123456789abcdef"; // throwaway, never a real secret
const ME = 7000;
const OWNER = 8000;
const WALLET_OWNER = "0x" + "ab".repeat(20);
const MY_WALLET = "0x" + "cd".repeat(20);
const THEIRS = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const WALLETS = "33333333-3333-4333-8333-333333333333";

let tables: FakeTables;

const hearth = (id: string, slug: string, owner: { owner_fid?: number | null; owner_wallet?: string | null }, at: string) => ({
  id,
  slug,
  name: slug,
  type: "creator",
  status: "spark",
  owner_fid: null,
  owner_wallet: null,
  ...owner,
  metadata: {},
  economic_config: {},
  created_at: at,
});

beforeEach(() => {
  process.env.SPARKZ_SESSION_SECRET = KEY;
  tables = {
    hearths: [
      hearth(THEIRS, "theirs", { owner_fid: OWNER }, "2026-11-01T00:00:00Z"),
      hearth(OTHER, "other", {}, "2026-11-02T00:00:00Z"),
      // Stored in mixed case: the identity match is on the lower-cased wallet.
      hearth(WALLETS, "wallets", { owner_wallet: WALLET_OWNER.toUpperCase().replace("0X", "0x") }, "2026-11-03T00:00:00Z"),
    ],
    user_blocks: [],
  };
  setServiceClientForTests(fakeClient(tables));
});

function req(session?: { fid?: number; address?: string }) {
  const h = new Headers({ origin: "https://trysparkz.com", "sec-fetch-site": "same-origin" });
  if (session?.fid) h.set("cookie", `${SESSION_COOKIE}=${mintSession(session.fid)}`);
  if (session?.address) h.set("cookie", `${SESSION_COOKIE}=${mintAddressSession(session.address)}`);
  return new NextRequest("https://trysparkz.com/api/capsules", { method: "GET", headers: h });
}

const slugs = (list: { slug: string }[]) => list.map((h) => h.slug).sort();

test("/api/capsules: a blocked owner's Hearth is left out for the blocker only", async () => {
  tables.user_blocks.push({ id: "k1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OWNER}` });
  const { GET } = await import("./route");
  const mine = await (await GET(req({ fid: ME }))).json();
  assert.deepEqual(slugs(mine.data), ["other", "wallets"]);
  const anon = await (await GET(req())).json();
  assert.deepEqual(slugs(anon.data), ["other", "theirs", "wallets"]);
});

test("/api/capsules: a wallet session that blocked a wallet owner", async () => {
  tables.user_blocks.push({ id: "k2", blocker_id: MY_WALLET, blocked_id: WALLET_OWNER });
  const { GET } = await import("./route");
  const mine = await (await GET(req({ address: MY_WALLET }))).json();
  assert.deepEqual(slugs(mine.data), ["other", "theirs"]);
});

test("Home: the showcase list leaves out Hearths whose owner the viewer blocked", async () => {
  tables.user_blocks.push({ id: "k1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OWNER}` });
  const hearths = tables.hearths as { slug: string; owner_fid: number | null; owner_wallet: string | null }[];
  const blocked = await blockedOwners(readSessionClaims(mintSession(ME) ?? undefined));
  assert.deepEqual(slugs(withoutBlocked(hearths, blocked)), ["other", "wallets"]);
  const anon = await blockedOwners(null);
  assert.equal(withoutBlocked(hearths, anon).length, 3);
});

test("Hearth page: the blocked branch names the owner to unblock, only for the blocker", async () => {
  tables.user_blocks.push(
    { id: "k1", blocker_id: `fid:${ME}`, blocked_id: `fid:${OWNER}` },
    { id: "k2", blocker_id: `fid:${ME}`, blocked_id: WALLET_OWNER },
  );
  const mine = await blockedOwners(readSessionClaims(mintSession(ME) ?? undefined));
  const [theirs, other, wallets] = tables.hearths as { owner_fid: number | null; owner_wallet: string | null }[];
  assert.equal(blockedOwnerOf(theirs, mine), `fid:${OWNER}`);
  assert.equal(blockedOwnerOf(wallets, mine), WALLET_OWNER);
  // An ownerless Hearth never takes the blocked branch.
  assert.equal(blockedOwnerOf(other, mine), null);
  // Signed out, or someone who blocked nobody, sees the Hearth.
  assert.equal(blockedOwnerOf(theirs, await blockedOwners(null)), null);
  assert.equal(blockedOwnerOf(theirs, await blockedOwners(readSessionClaims(mintSession(OWNER) ?? undefined))), null);
});
