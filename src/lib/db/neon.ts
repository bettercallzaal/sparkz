import { neon } from "@neondatabase/serverless";
import type { Exec, Row } from "./query";

// Runs the query builder's statements on Neon over HTTP (no pooled connection to hold
// open per Vercel request). Server-only: the connection string is a secret.
//
// Values are normalised to what PostgREST (Supabase) returned, so call sites see the same
// shapes after the move:
//   int2/int4/int8 and numeric -> JS number (FIDs, counts and amounts were numbers before)
//   timestamps/dates           -> ISO 8601 strings (code compares created_at as strings)
// jsonb arrives already parsed by the driver.

const NUMERIC_OIDS = new Set([20, 21, 23, 700, 701, 1700]); // int8 int2 int4 float4 float8 numeric

export function normaliseRow(row: Row, numericFields: ReadonlySet<string>): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (v instanceof Date) out[k] = v.toISOString();
    else if (typeof v === "string" && numericFields.has(k)) out[k] = Number(v);
    else out[k] = v;
  }
  return out;
}

/** The database URL for the Neon backend: Vercel's Neon integration with the STORAGE prefix. */
export function neonUrl(): string | undefined {
  return process.env.STORAGE_DATABASE_URL || process.env.DATABASE_URL || undefined;
}

export function neonExec(url: string): Exec {
  const sql = neon(url, { fullResults: true });
  return async (text, params) => {
    const res = await sql.query(text, params);
    const numeric = new Set(res.fields.filter((f) => NUMERIC_OIDS.has(f.dataTypeID)).map((f) => f.name));
    return { rows: (res.rows as Row[]).map((r) => normaliseRow(r, numeric)), rowCount: res.rowCount ?? 0 };
  };
}
