import { NextResponse } from "next/server";
import type { z } from "zod";

// Consistent JSON responses. Never leak internals: log the real error server-side,
// return a sanitized message to the client.

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details },
    { status: 400 },
  );
}

export function serverError(err: unknown, where: string) {
  console.error(`[sparkz:${where}]`, err);
  return NextResponse.json(
    { ok: false, error: "Internal error" },
    { status: 500 },
  );
}

export function zodError(result: z.ZodError) {
  return badRequest(
    "Invalid input",
    result.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  );
}
