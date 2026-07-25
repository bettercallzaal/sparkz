import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";
import { ok, serverError } from "@/lib/http";

// POST /api/admin/dev-login - local-dev convenience ONLY. Sets the operator cookie
// straight from SPARKZ_ADMIN_TOKEN so the console self-unlocks and nobody pastes a
// 48-char token every session.
//
// HARD-GATED to development: in any non-development NODE_ENV this returns 404, so it
// does not exist on Vercel/prod. It never echoes the token to the client (the cookie
// is httpOnly and the body carries no secret). Prod auth stays /api/admin/login only.
export async function POST() {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    const token = process.env.SPARKZ_ADMIN_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "SPARKZ_ADMIN_TOKEN not set in .env.local" },
        { status: 503 },
      );
    }
    const res = ok({ authed: true, dev: true });
    setAdminCookie(res, token);
    return res;
  } catch (err) {
    return serverError(err, "admin.devLogin.POST");
  }
}
