// An in-memory stand-in for the service client, for route tests only (never imported by
// app code). It answers the small supabase-js surface Sparkz routes use: from().select()
// .eq().in().order().limit().single().maybeSingle(), insert(...).select().single(),
// update(...).eq().select().single() and delete().eq(). Results are { data, error } like
// the real client.
type Row = Record<string, unknown>;
type Filter = { col: string; op: "eq" | "in"; v: unknown };

export type FakeTables = Record<string, Row[]>;

class FakeQuery implements PromiseLike<{ data: unknown; error: null | { message: string } }> {
  private filters: Filter[] = [];
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | null = null;
  private orderCol: string | null = null;
  private asc = true;
  private limitN: number | null = null;
  private one: "single" | "maybe" | null = null;

  private tables: FakeTables;
  private table: string;

  constructor(tables: FakeTables, table: string) {
    this.tables = tables;
    this.table = table;
  }

  select(): this { return this; }
  insert(row: Row): this { this.mode = "insert"; this.payload = row; return this; }
  update(row: Row): this { this.mode = "update"; this.payload = row; return this; }
  delete(): this { this.mode = "delete"; return this; }
  eq(col: string, v: unknown): this { this.filters.push({ col, op: "eq", v }); return this; }
  in(col: string, v: unknown[]): this { this.filters.push({ col, op: "in", v }); return this; }
  order(col: string, opts?: { ascending?: boolean }): this { this.orderCol = col; this.asc = opts?.ascending ?? true; return this; }
  limit(n: number): this { this.limitN = n; return this; }
  single(): this { this.one = "single"; return this; }
  maybeSingle(): this { this.one = "maybe"; return this; }

  private match(r: Row): boolean {
    return this.filters.every((f) =>
      f.op === "eq" ? r[f.col] === f.v : (f.v as unknown[]).includes(r[f.col]),
    );
  }

  private run(): { data: unknown; error: null | { message: string } } {
    const rows = (this.tables[this.table] ??= []);
    let out: Row[];
    if (this.mode === "insert") {
      const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...this.payload };
      rows.push(row);
      out = [row];
    } else if (this.mode === "update") {
      out = rows.filter((r) => this.match(r));
      for (const r of out) Object.assign(r, this.payload);
    } else if (this.mode === "delete") {
      out = rows.filter((r) => this.match(r));
      this.tables[this.table] = rows.filter((r) => !this.match(r));
    } else {
      out = rows.filter((r) => this.match(r));
      if (this.orderCol) {
        const c = this.orderCol;
        out = [...out].sort((a, b) => (String(a[c]) < String(b[c]) ? -1 : 1) * (this.asc ? 1 : -1));
      }
      if (this.limitN !== null) out = out.slice(0, this.limitN);
    }
    if (this.one === "single") {
      return out.length === 1 ? { data: out[0], error: null } : { data: null, error: { message: `expected 1 row, got ${out.length}` } };
    }
    if (this.one === "maybe") return { data: out[0] ?? null, error: null };
    return { data: out, error: null };
  }

  then<A = { data: unknown; error: null | { message: string } }, B = never>(
    ok?: ((v: { data: unknown; error: null | { message: string } }) => A | PromiseLike<A>) | null,
    fail?: ((e: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(ok, fail);
  }
}

export function fakeClient(tables: FakeTables) {
  return { from: (table: string) => new FakeQuery(tables, table) };
}
