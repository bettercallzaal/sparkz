import type { NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";
import { ok, badRequest, serverError, zodError } from "@/lib/http";

const loginSchema = z.object({ token: z.string().min(1).max(200) });

// POST /api/admin/login - exchange the operator token for an httpOnly session
// cookie. The raw token never touches client JS after this (cookie is httpOnly).
export async function POST(req: NextRequest) {
  try {
    if (!process.env.SPARKZ_ADMIN_TOKEN) {
      return badRequest("Admin auth not configured (set SPARKZ_ADMIN_TOKEN)");
    }
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    if (!verifyAdminToken(parsed.data.token)) {
      return badRequest("Invalid token");
    }

    const res = ok({ authed: true });
    res.cookies.set(ADMIN_COOKIE, parsed.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
    });
    return res;
  } catch (err) {
    return serverError(err, "admin.login.POST");
  }
}
