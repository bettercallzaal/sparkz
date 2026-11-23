import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, serverError, forbidCrossSite, zodError } from "@/lib/http";
import { sessionClaims, clearSessionCookie } from "@/lib/session";
import { viewerIdentity } from "@/lib/moderation";

export const dynamic = "force-dynamic";

// POST /api/account/delete - delete the signed-in person's Sparkz account from inside the
// app (App Store guideline 5.1.1(v): an app with sign-in must offer deletion in the app).
//
// Sparkz has no users table: a person is a verified session (an FID or a wallet), and
// what Sparkz holds about them is the rows keyed by that identity. Deleting the account
// removes those rows and ends the session:
//   - hearth_backers boost rows whose backer_id is the identity ("fid:<n>" or the address).
//     Paid, on-chain or collectable rows (kind backing or collectable: amount_or_qty,
//     provider, provider_ref txhash, migration 0001) are the Hearth's record of money and
//     stay, anonymised: backer_id becomes "deleted", backer_kind "user", and personal
//     metadata keys (ip_hash, email...) go, so nothing links them to the person while the
//     amount, provider and txhash remain;
//   - team_signups rows whose wallet is the session address;
//   - content_reports they filed and user_blocks they made (migration 0009). Blocks other
//     people made of them stay: those are the other person's choice;
//   - sparks.created_by_fid is cleared (the Spark belongs to its Hearth and stays);
//   - owner_fid / owner_wallet is cleared on Hearths they own that are asleep (dormant).
// A Hearth they own that is still awake blocks the delete (Zaal, D5: give it away or put
// it to sleep first), so no live Hearth is left without an owner. The response names
// those Hearths so the app can say which. Their Farcaster account is never touched.
//
// The session is a signed cookie with no server-side store, so ending it means clearing
// the cookie on this response.

const bodySchema = z.object({ confirm: z.literal("delete") });

const IDENTITY_REQUIRED = "Sign in to delete your account";
// What a kept backing row says instead of the person (backer_id is not null in 0001).
// The public pages already show anything that is not an @handle or a wallet as
// "a supporter" (maskBacker in src/lib/sanitize.ts).
const ANONYMOUS_BACKER = "deleted";
// Metadata keys on a backing row that can point back to a person (boost and the ledger
// adapter can write them).
const PERSONAL_META_KEYS = ["ip_hash", "owner_email", "email", "fid", "username", "wallet"] as const;

type OwnedHearth = { id: string; slug: string; name: string; status: string };

export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const claims = sessionClaims(req);
    if (!claims || (!claims.fid && !claims.address)) {
      return NextResponse.json({ ok: false, error: IDENTITY_REQUIRED }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const fid = claims.fid;
    const address = claims.address;

    // Hearths this identity owns, by FID and by wallet.
    const owned: OwnedHearth[] = [];
    if (fid) {
      const { data, error } = await supabase
        .from("hearths")
        .select("id, slug, name, status")
        .eq("owner_fid", fid);
      if (error) throw error;
      owned.push(...((data as OwnedHearth[]) ?? []));
    }
    if (address) {
      const { data, error } = await supabase
        .from("hearths")
        .select("id, slug, name, status")
        .eq("owner_wallet", address);
      if (error) throw error;
      for (const h of (data as OwnedHearth[]) ?? []) {
        if (!owned.some((o) => o.id === h.id)) owned.push(h);
      }
    }

    const awake = owned.filter((h) => h.status !== "dormant");
    if (awake.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Give each Hearth you own to someone, or put it to sleep, before deleting your account.",
          hearths: awake.map((h) => ({ slug: h.slug, name: h.name })),
        },
        { status: 409 },
      );
    }

    // Boosts go; backing and collectable rows stay, unlinked from the person.
    const backerIds = [fid ? `fid:${fid}` : null, address].filter((v): v is string => v !== null);
    for (const backerId of backerIds) {
      const { error } = await supabase
        .from("hearth_backers")
        .delete()
        .eq("backer_id", backerId)
        .eq("kind", "boost");
      if (error) throw error;
      // Row by row, so each row's metadata loses the keys that can point back to a person
      // (ip_hash, owner_email) and keeps the rest.
      const { data: kept, error: keptErr } = await supabase
        .from("hearth_backers")
        .select("id, metadata")
        .eq("backer_id", backerId);
      if (keptErr) throw keptErr;
      for (const row of (kept as { id: string; metadata: Record<string, unknown> | null }[]) ?? []) {
        const metadata = { ...(row.metadata ?? {}) };
        for (const k of PERSONAL_META_KEYS) delete metadata[k];
        const { error: anonErr } = await supabase
          .from("hearth_backers")
          .update({ backer_id: ANONYMOUS_BACKER, backer_kind: "user", metadata })
          .eq("id", row.id);
        if (anonErr) throw anonErr;
      }
    }
    if (address) {
      const { error: teamErr } = await supabase.from("team_signups").delete().eq("wallet", address);
      if (teamErr) throw teamErr;
    }

    // Reports they filed and blocks they made.
    const identity = viewerIdentity(claims);
    if (identity) {
      const { error: repErr } = await supabase.from("content_reports").delete().eq("reporter_id", identity);
      if (repErr) throw repErr;
      const { error: blockErr } = await supabase.from("user_blocks").delete().eq("blocker_id", identity);
      if (blockErr) throw blockErr;
    }

    // Sparks they lit stay on their Hearth; only the link to the person goes.
    if (fid) {
      const { error } = await supabase.from("sparks").update({ created_by_fid: null }).eq("created_by_fid", fid);
      if (error) throw error;
    }

    // Asleep Hearths they owned lose the owner link.
    for (const h of owned) {
      const { error } = await supabase
        .from("hearths")
        .update({ owner_fid: null, owner_wallet: null })
        .eq("id", h.id);
      if (error) throw error;
    }

    const res = ok({ deleted: true });
    clearSessionCookie(res);
    return res;
  } catch (err) {
    return serverError(err, "account.delete.POST");
  }
}
