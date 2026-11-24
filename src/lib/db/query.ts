// A small query builder that answers the supabase-js calls Sparkz makes, with plain
// Postgres underneath (Neon). It exists so the move off Supabase (Zaal, 14 Nov 2026) does not
// rewrite the ~470 query calls across 41 files: getServiceClient() hands back this builder
// when SPARKZ_DB=neon, and every call site stays as it is.
//
// It implements only what the code uses (measured on main, 14 Nov 2026):
//   from, select (column list or "*", with { count: "exact", head: true }), insert, update,
//   upsert (onConflict), delete, eq, neq, gt, gte, lt, lte, like, is, in, not, filter,
//   or (PostgREST filter string), order, limit, single, maybeSingle.
// Anything else throws, so a new call shape fails loudly in tests instead of returning
// wrong rows. Column names and JSON paths are checked against a strict pattern and quoted;
// every value is a bind parameter. Server-only, like the service client it replaces.

export type Row = Record<string, unknown>;

export interface DbError {
  message: string;
  code?: string;
  details?: string;
}

export interface DbResult<T = unknown> {
  data: T | null;
  error: DbError | null;
  count: number | null;
}

/** Runs one parameterised statement. Rows come back already normalised (see neon.ts). */
export type Exec = (text: string, params: unknown[]) => Promise<{ rows: Row[]; rowCount: number }>;

const IDENT = /^[a-z_][a-z0-9_]*$/;
const JSON_KEY = /^[A-Za-z0-9_]+$/;

function quoteIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`db: bad identifier ${JSON.stringify(name)}`);
  return `"${name}"`;
}

/** "metadata->>review" -> "metadata"->>'review'; plain names are quoted identifiers. */
export function columnRef(col: string): string {
  const parts = col.split(/(->>|->)/);
  let sql = quoteIdent(parts[0].trim());
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i];
    const key = (parts[i + 1] ?? "").trim();
    if (!JSON_KEY.test(key)) throw new Error(`db: bad JSON path key ${JSON.stringify(key)}`);
    sql += `${op}'${key}'`;
  }
  return sql;
}

function selectList(columns: string): string {
  const cols = columns.trim();
  if (cols === "*" || cols === "") return "*";
  return cols
    .split(",")
    .map((c) => quoteIdent(c.trim()))
    .join(", ");
}

/** JSON-encode objects and arrays (every such column in Sparkz is jsonb). */
function toParam(v: unknown): unknown {
  if (v !== null && typeof v === "object" && !(v instanceof Date)) return JSON.stringify(v);
  return v;
}

const OPS: Record<string, string> = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "LIKE", ilike: "ILIKE" };

type Mode = "select" | "insert" | "update" | "upsert" | "delete";

export class Query<T = unknown> implements PromiseLike<DbResult<T>> {
  private mode: Mode = "select";
  private columns = "*";
  private countHead = false;
  private wantCount = false;
  private returning: string | null = null;
  private values: Row[] = [];
  private onConflict = "id";
  // Each fragment uses "?" for its values; numbering happens once, in toSQL(). Identifiers
  // and JSON keys are validated to [A-Za-z0-9_], so a "?" can only be a placeholder.
  private wheres: { sql: string; vals: unknown[] }[] = [];
  private orders: string[] = [];
  private limitN: number | null = null;
  private one: "single" | "maybe" | null = null;

  // Plain fields, not constructor parameter properties: Node's type stripping (npm test and
  // the Neon seed) cannot run parameter properties.
  private readonly table: string;
  private readonly exec: Exec;

  constructor(table: string, exec: Exec) {
    quoteIdent(table);
    this.table = table;
    this.exec = exec;
  }

  private w(sql: string, ...vals: unknown[]): this {
    this.wheres.push({ sql, vals: vals.map(toParam) });
    return this;
  }

  // ---- shape -------------------------------------------------------------------------
  select(columns = "*", opts?: { count?: "exact"; head?: boolean }): this {
    if (this.mode === "select") {
      this.columns = columns;
      this.wantCount = opts?.count === "exact";
      this.countHead = Boolean(opts?.head);
    } else {
      this.returning = columns; // insert(...).select() etc: return the written rows
    }
    return this;
  }

  insert(rows: Row | Row[]): this {
    this.mode = "insert";
    this.values = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  upsert(rows: Row | Row[], opts?: { onConflict?: string }): this {
    this.mode = "upsert";
    this.values = Array.isArray(rows) ? rows : [rows];
    if (opts?.onConflict) this.onConflict = opts.onConflict;
    return this;
  }

  update(row: Row): this {
    this.mode = "update";
    this.values = [row];
    return this;
  }

  delete(): this {
    this.mode = "delete";
    return this;
  }

  // ---- filters -----------------------------------------------------------------------
  private cmp(col: string, op: string, v: unknown): this {
    const sqlOp = OPS[op];
    if (!sqlOp) throw new Error(`db: unsupported operator ${op}`);
    return this.w(`${columnRef(col)} ${sqlOp} ?`, v);
  }
  eq(col: string, v: unknown) { return this.cmp(col, "eq", v); }
  neq(col: string, v: unknown) { return this.cmp(col, "neq", v); }
  gt(col: string, v: unknown) { return this.cmp(col, "gt", v); }
  gte(col: string, v: unknown) { return this.cmp(col, "gte", v); }
  lt(col: string, v: unknown) { return this.cmp(col, "lt", v); }
  lte(col: string, v: unknown) { return this.cmp(col, "lte", v); }
  like(col: string, pattern: string) { return this.cmp(col, "like", pattern); }
  ilike(col: string, pattern: string) { return this.cmp(col, "ilike", pattern); }

  is(col: string, v: null | boolean): this {
    const lit = v === null ? "NULL" : v ? "TRUE" : "FALSE";
    return this.w(`${columnRef(col)} IS ${lit}`);
  }

  in(col: string, list: readonly unknown[]): this {
    // An empty list matches nothing, as in PostgREST.
    if (list.length === 0) return this.w("FALSE");
    return this.w(`${columnRef(col)} IN (${list.map(() => "?").join(", ")})`, ...list);
  }

  not(col: string, op: string, v: unknown): this {
    if (op === "is") return this.notIs(col, v as null | boolean);
    const sqlOp = OPS[op];
    if (!sqlOp) throw new Error(`db: unsupported not() operator ${op}`);
    return this.w(`NOT (${columnRef(col)} ${sqlOp} ?)`, v);
  }
  private notIs(col: string, v: null | boolean): this {
    const lit = v === null ? "NULL" : v ? "TRUE" : "FALSE";
    return this.w(`${columnRef(col)} IS NOT ${lit}`);
  }

  filter(col: string, op: string, v: unknown): this {
    if (op === "is") return this.is(col, v === "null" || v === null ? null : v === "true" || v === true);
    return this.cmp(col, op, v);
  }

  /** PostgREST or-string: "a.is.null,b.eq.approved". Flat terms only (no nested and/or). */
  or(expr: string): this {
    const terms = expr.split(",").map((t) => t.trim()).filter(Boolean);
    if (terms.length === 0) throw new Error("db: empty or()");
    const vals: unknown[] = [];
    const parts = terms.map((term) => {
      const first = term.indexOf(".");
      const second = term.indexOf(".", first + 1);
      if (first < 1 || second < 0) throw new Error(`db: bad or() term ${JSON.stringify(term)}`);
      const col = term.slice(0, first);
      const op = term.slice(first + 1, second);
      const raw = term.slice(second + 1);
      if (op === "is") {
        const lit = raw === "null" ? "NULL" : raw === "true" ? "TRUE" : raw === "false" ? "FALSE" : null;
        if (!lit) throw new Error(`db: bad is value ${JSON.stringify(raw)}`);
        return `${columnRef(col)} IS ${lit}`;
      }
      const sqlOp = OPS[op];
      if (!sqlOp) throw new Error(`db: unsupported or() operator ${op}`);
      vals.push(raw);
      return `${columnRef(col)} ${sqlOp} ?`;
    });
    return this.w(`(${parts.join(" OR ")})`, ...vals);
  }

  // ---- modifiers ---------------------------------------------------------------------
  order(col: string, opts?: { ascending?: boolean }): this {
    this.orders.push(`${columnRef(col)} ${opts?.ascending === false ? "DESC" : "ASC"}`);
    return this;
  }

  limit(n: number): this {
    if (!Number.isInteger(n) || n < 0) throw new Error(`db: bad limit ${n}`);
    this.limitN = n;
    return this;
  }

  single(): this {
    this.one = "single";
    return this;
  }

  maybeSingle(): this {
    this.one = "maybe";
    return this;
  }

  // ---- SQL ---------------------------------------------------------------------------
  private ret(): string {
    return this.returning === null ? "" : ` RETURNING ${selectList(this.returning)}`;
  }

  /** The statement this query runs. Pure: safe to call more than once. Exposed for tests. */
  toSQL(): { text: string; params: unknown[]; countText?: string; countParams?: unknown[] } {
    const t = quoteIdent(this.table);
    const params: unknown[] = [];
    const num = (sql: string, vals: unknown[]) => {
      let i = 0;
      return sql.replace(/\?/g, () => {
        params.push(vals[i++]);
        return `$${params.length}`;
      });
    };
    const where = () =>
      this.wheres.length ? ` WHERE ${this.wheres.map((f) => num(f.sql, f.vals)).join(" AND ")}` : "";

    if (this.mode === "select") {
      const w = where();
      const tail =
        (this.orders.length ? ` ORDER BY ${this.orders.join(", ")}` : "") +
        (this.limitN !== null ? ` LIMIT ${this.limitN}` : "");
      const countText = this.wantCount ? `SELECT count(*)::int AS count FROM ${t}${w}` : undefined;
      if (this.countHead) return { text: countText!, params };
      return { text: `SELECT ${selectList(this.columns)} FROM ${t}${w}${tail}`, params, countText, countParams: params };
    }
    if (this.mode === "delete") {
      return { text: `DELETE FROM ${t}${where()}${this.ret()}`, params };
    }
    if (this.mode === "update") {
      const row = this.values[0] ?? {};
      const keys = Object.keys(row);
      if (keys.length === 0) throw new Error("db: update() with no fields");
      const sets = keys.map((k) => `${quoteIdent(k)} = ${num("?", [toParam(row[k])])}`);
      return { text: `UPDATE ${t} SET ${sets.join(", ")}${where()}${this.ret()}`, params };
    }
    // insert / upsert
    if (this.values.length === 0) throw new Error(`db: ${this.mode}() with no rows`);
    const keys = [...new Set(this.values.flatMap((r) => Object.keys(r)))];
    const cols = keys.map(quoteIdent).join(", ");
    const tuples = this.values
      .map((r) => `(${keys.map((k) => (k in r ? num("?", [toParam(r[k])]) : "DEFAULT")).join(", ")})`)
      .join(", ");
    let text = `INSERT INTO ${t} (${cols}) VALUES ${tuples}`;
    if (this.mode === "upsert") {
      const conflict = this.onConflict.split(",").map((c) => c.trim());
      conflict.forEach(quoteIdent);
      const updates = keys.filter((k) => !conflict.includes(k));
      const target = conflict.map(quoteIdent).join(", ");
      text += updates.length
        ? ` ON CONFLICT (${target}) DO UPDATE SET ${updates.map((k) => `${quoteIdent(k)} = EXCLUDED.${quoteIdent(k)}`).join(", ")}`
        : ` ON CONFLICT (${target}) DO NOTHING`;
    }
    return { text: text + this.ret(), params };
  }

  private async run(): Promise<DbResult<T>> {
    try {
      const { text, params, countText, countParams } = this.toSQL();
      if (this.mode === "select" && this.countHead) {
        const { rows } = await this.exec(text, params);
        return { data: null, error: null, count: Number(rows[0]?.count ?? 0) };
      }
      const { rows } = await this.exec(text, params);
      const count = countText ? Number((await this.exec(countText, countParams ?? params)).rows[0]?.count ?? 0) : null;
      const isMutation = this.mode !== "select";
      if (isMutation && this.returning === null) return { data: null, error: null, count };
      if (this.one) {
        if (rows.length > 1) return { data: null, error: { code: "PGRST116", message: "multiple rows returned" }, count };
        if (rows.length === 0) {
          return this.one === "maybe"
            ? { data: null, error: null, count }
            : { data: null, error: { code: "PGRST116", message: "no rows returned" }, count };
        }
        return { data: rows[0] as T, error: null, count };
      }
      return { data: rows as T, error: null, count };
    } catch (err) {
      const e = err as { message?: string; code?: string; detail?: string };
      return { data: null, error: { message: e.message ?? String(err), code: e.code, details: e.detail }, count: null };
    }
  }

  then<A = DbResult<T>, B = never>(
    onfulfilled?: ((value: DbResult<T>) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return this.run().then(onfulfilled, onrejected);
  }
}

/** The client surface the app uses: .from(table). */
export function createQueryClient(exec: Exec) {
  return { from: (table: string) => new Query(table, exec) };
}
