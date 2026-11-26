import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError, zodError, forbidCrossSite } from "@/lib/http";
import { requireHearthOwner } from "@/lib/auth";
import { sessionClaims } from "@/lib/session";
import { deploySubject, issueDeployCode } from "@/lib/empire/deploy-code";

const schema = z.object({ hearth_id: z.string().uuid() });

// POST /api/empire/deploy/code - a one-time code for the tokenless Empire deploy, bound to
// this session and this Hearth and good for 5 minutes (lib/empire/deploy-code.ts). Same
// people as the deploy itself: the Hearth's owner or the operator.
export async function POST(req: NextRequest) {
  try {
    const crossSite = forbidCrossSite(req);
    if (crossSite) return crossSite;

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const denied = await requireHearthOwner(req, parsed.data.hearth_id);
    if (denied) return denied;

    const subject = deploySubject(sessionClaims(req));
    if (!subject) {
      return NextResponse.json({ ok: false, error: "Sign in to deploy" }, { status: 401 });
    }

    const { data: hearth, error } = await getServiceClient()
      .from("hearths").select("slug").eq("id", parsed.data.hearth_id).maybeSingle();
    if (error) throw error;
    if (!hearth) return badRequest("hearth not found");

    const issued = issueDeployCode(subject, parsed.data.hearth_id);
    if (!issued) {
      return NextResponse.json(
        { ok: false, error: "Deploy codes not configured (set SPARKZ_SESSION_SECRET)" },
        { status: 503 },
      );
    }
    return ok({ code: issued.code, issued_at: issued.issuedAt, hearth_slug: (hearth as { slug: string }).slug });
  } catch (err) {
    return serverError(err, "empire.deploy.code.POST");
  }
}
