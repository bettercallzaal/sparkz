# Empire Deploy Test (Slice 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy one real tokenless Empire Builder empire on Base mainnet for the ZLANK Capsule, signed by an operator-connected wallet, from a gated admin page.

**Architecture:** A pure message builder + a server deploy service (holds `EMPIRE_API_KEY`, calls `deploy-empire-tokenless`) + a minimal injected-wallet connect/sign on the client + an operator-gated page. The client signs; the server forwards; the resolved SmartVault treasury is stored on the Capsule's `economic_config`.

**Tech Stack:** Next.js App Router, TypeScript, Zod, `viem` (new), Empire Builder HTTP API, `node:test` for unit tests (no new test dep).

## Global Constraints

- Next.js App Router + Supabase (RLS on every table) + Tailwind + TypeScript; `@/` alias.
- Validate all API input with Zod `safeParse`; `NextResponse.json`; try/catch + sanitized 500.
- Secrets are server-only; never `NEXT_PUBLIC`, never in a `"use client"` file, never in a response.
- Empire Builder: base `https://www.empirebuilder.world/api`, mainnet only (Base 8453). `POST /api/deploy-empire-tokenless`, header `x-api-key`, body includes EIP-191 `signature` by `owner`. Custom-mode message is byte-exact: `I am deploying a custom tokenless Empire named {name}`. Rate limit 2 deploys/wallet/24h.
- New dependency `viem` requires the user's approval before install.
- Deploy routes are operator-gated via `requireAdmin` (existing).
- PR-only to main; branch `ws/empire-v1`.

---

### Task 1: Empire custom-mode message builder (pure, tested)

**Files:**
- Modify: `src/lib/empire/client.ts` (the `tokenlessCustomMessage` fn already exists there)
- Test: `src/lib/empire/message.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `tokenlessCustomMessage(name: string): string` returning exactly `I am deploying a custom tokenless Empire named ${name.trim()}`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/empire/message.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenlessCustomMessage } from "./client";

test("custom message is byte-exact and trims the name", () => {
  assert.equal(
    tokenlessCustomMessage("  ZLANK  "),
    "I am deploying a custom tokenless Empire named ZLANK",
  );
});
```

- [ ] **Step 2: Run it, verify it passes** (the fn already exists)

Run: `node --test --experimental-strip-types src/lib/empire/message.test.ts`
Expected: PASS. If the import path or strip-types flag fails on this Node, compile with `npx tsc` first or move the assertion into a `.mjs` harness importing the built output. The assertion itself is the contract.

- [ ] **Step 3: Commit**

```bash
git add src/lib/empire/message.test.ts
git commit -m "test: byte-exact Empire custom-mode message"
```

---

### Task 2: Add viem + a signing helper for the injected wallet

**Files:**
- Modify: `package.json` (add `viem`)
- Create: `src/lib/wallet/injected.ts`

**Interfaces:**
- Produces:
  - `getInjectedAddress(): Promise<`0x${string}`>` - requests accounts from the EIP-1193 provider and returns the first.
  - `signMessageInjected(message: string): Promise<`0x${string}`>` - EIP-191 `personal_sign` via the injected provider.

- [ ] **Step 1: Get approval + install viem**

Ask the user to approve, then:
Run: `npm install viem`
Expected: added to dependencies; `npx tsc --noEmit` still passes.

- [ ] **Step 2: Implement the injected wallet helper**

```ts
// src/lib/wallet/injected.ts
type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };

function provider(): Eip1193 {
  const p = (globalThis as { ethereum?: Eip1193 }).ethereum;
  if (!p) throw new Error("No wallet found. Install MetaMask or a Base wallet.");
  return p;
}

export async function getInjectedAddress(): Promise<`0x${string}`> {
  const accounts = (await provider().request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.length) throw new Error("No account authorized");
  return accounts[0] as `0x${string}`;
}

export async function signMessageInjected(message: string): Promise<`0x${string}`> {
  const from = await getInjectedAddress();
  return (await provider().request({
    method: "personal_sign",
    params: [message, from],
  })) as `0x${string}`;
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → Expected: PASS

```bash
git add package.json package-lock.json src/lib/wallet/injected.ts
git commit -m "feat: viem + injected wallet sign helper"
```

---

### Task 3: Deploy API route (operator-gated)

**Files:**
- Create: `src/app/api/empire/deploy/route.ts`
- Modify: `src/lib/validation/schemas.ts` (add `deployEmpireSchema`)

**Interfaces:**
- Consumes: `deployTokenlessCustom` + `resolveEmpire` (exist in `src/lib/empire/client.ts`), `requireAdmin` (`src/lib/auth.ts`), `getServiceClient`.
- Produces: `POST /api/empire/deploy` `{ capsule_id, name, owner, signature }` → `{ empire_id, empire_address, capsule }`.

- [ ] **Step 1: Add the Zod schema**

```ts
// append to src/lib/validation/schemas.ts
export const deployEmpireSchema = z.object({
  capsule_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});
```

- [ ] **Step 2: Implement the route**

```ts
// src/app/api/empire/deploy/route.ts
import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { deployEmpireSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError, zodError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deployTokenlessCustom, resolveEmpire } from "@/lib/empire/client";
import type { Capsule } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const parsed = deployEmpireSchema.safeParse(body);
    if (!parsed.success) return zodError(parsed.error);

    const supabase = getServiceClient();
    const { data: capsule, error: capErr } = await supabase
      .from("capsules").select("*").eq("id", parsed.data.capsule_id).maybeSingle();
    if (capErr) throw capErr;
    if (!capsule) return badRequest("capsule not found");

    const { baseToken } = await deployTokenlessCustom({
      owner: parsed.data.owner,
      name: parsed.data.name,
      signature: parsed.data.signature as `0x${string}`,
    });
    const resolved = baseToken ? await resolveEmpire(baseToken) : null;

    const econ = (capsule as Capsule).economic_config ?? {};
    const { data, error } = await supabase.from("capsules").update({
      economic_config: {
        ...econ, empire: true, tokenization_rail: "empire",
        empire_id: baseToken,
        empire_address: resolved?.empireAddress ?? null,
        empire_mode: "custom", empire_owner: parsed.data.owner,
      },
    }).eq("id", parsed.data.capsule_id).select("*").single();
    if (error) throw error;

    return ok({ empire_id: baseToken, empire_address: resolved?.empireAddress ?? null, capsule: data }, 201);
  } catch (err) {
    return serverError(err, "empire.deploy.POST");
  }
}
```

- [ ] **Step 3: Verify unauth is blocked + build**

Run: `npm run build` → Expected: route `/api/empire/deploy` listed, compile PASS.
Run (dev server up): `curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/empire/deploy -H 'Content-Type: application/json' -d '{}'`
Expected: `401` (no operator cookie) or `503` (token unset).

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation/schemas.ts src/app/api/empire/deploy/route.ts
git commit -m "feat: operator-gated tokenless empire deploy route"
```

---

### Task 4: Operator empire page (connect → sign → deploy)

**Files:**
- Create: `src/app/admin/empire/page.tsx`
- Modify: `src/app/admin/page.tsx` (add a link to `/admin/empire`)

**Interfaces:**
- Consumes: `getInjectedAddress`, `signMessageInjected` (Task 2); `tokenlessCustomMessage` (Task 1); `POST /api/empire/deploy` (Task 3); `POST /api/admin/login` (exists).
- Produces: a client page that picks a Capsule, connects a wallet, signs, deploys, shows the SmartVault address.

- [ ] **Step 1: Implement the page** (client component)

```tsx
// src/app/admin/empire/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Capsule } from "@/lib/supabase/types";
import { tokenlessCustomMessage } from "@/lib/empire/client";
import { getInjectedAddress, signMessageInjected } from "@/lib/wallet/injected";

export default function EmpirePage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleId, setCapsuleId] = useState("");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    fetch("/api/capsules").then((r) => r.json()).then((j) => {
      if (j.ok) { setCapsules(j.data); setCapsuleId(j.data[0]?.id ?? ""); setName(j.data[0]?.name ?? ""); }
    });
  }, []);

  const login = async () => {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if ((await r.json()).ok) { setNeedsAuth(false); setToken(""); } else setErr("bad token");
  };
  const connect = async () => { try { setOwner(await getInjectedAddress()); } catch (e) { setErr(e instanceof Error ? e.message : "connect failed"); } };
  const deploy = async () => {
    setBusy(true); setErr(null);
    try {
      const signature = await signMessageInjected(tokenlessCustomMessage(name));
      const r = await fetch("/api/empire/deploy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ capsule_id: capsuleId, name, owner, signature }) });
      const j = await r.json();
      if (r.status === 401 || r.status === 503) { setNeedsAuth(true); return; }
      if (!j.ok) { setErr(j.error); return; }
      setResult(`Empire ${j.data.empire_id} → treasury ${j.data.empire_address ?? "(resolving)"}`);
    } catch (e) { setErr(e instanceof Error ? e.message : "deploy failed"); } finally { setBusy(false); }
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">&larr; Meme Engine</Link>
        <span className="text-sm font-medium">Deploy Empire (Base mainnet)</span>
      </div>
      {err && <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{err}</div>}
      {needsAuth && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="operator token" className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <button onClick={login} className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white">Unlock</button>
        </div>
      )}
      {result ? (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">{result}</div>
      ) : (
        <div className="space-y-3">
          <select value={capsuleId} onChange={(e) => { setCapsuleId(e.target.value); setName(capsules.find((c) => c.id === e.target.value)?.name ?? ""); }} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm">
            {capsules.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Empire name" className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm" />
          <button onClick={connect} className="w-full rounded-md border border-border px-3 py-2 text-sm hover:border-accent">{owner ? `Wallet: ${owner.slice(0, 6)}…${owner.slice(-4)}` : "Connect wallet"}</button>
          <p className="text-xs text-muted">Live on Base mainnet. 2 deploys / wallet / 24h. This is deliberate.</p>
          <button onClick={deploy} disabled={busy || !owner || !name || !capsuleId} className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Deploying…" : "Sign + deploy empire"}</button>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Link it from the admin header**

In `src/app/admin/page.tsx`, add next to the `+ New Capsule` link:
```tsx
<Link href="/admin/empire" className="text-sm text-accent hover:text-foreground">Deploy Empire</Link>
```

- [ ] **Step 3: Build + lint**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all PASS; `/admin/empire` listed.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/empire/page.tsx src/app/admin/page.tsx
git commit -m "feat: operator empire deploy page (connect, sign, deploy)"
```

---

### Task 5: Import ZLANK + deploy the first real empire (manual, deliberate)

**Files:** none (operational).

**Preconditions:**
- `EMPIRE_API_KEY` set in `.env.local` (operator provides via the secret flow).
- A wallet available in the browser on Base with a small amount of ETH is NOT
  required for the tokenless deploy signature itself (nothing on-chain at deploy),
  but the owner wallet must be able to `personal_sign`.

- [ ] **Step 1: Import ZLANK as a Capsule**

With the dev server up + operator cookie, use the brand-audit import:
`curl -s -b cookie -X POST localhost:3000/api/capsules/import-repo -H 'Content-Type: application/json' -d '{"ref":"bettercallzaal/zlank"}'`
Expected: an `oss` Capsule `zlank` is created.

- [ ] **Step 2: Deploy its empire from /admin/empire**

Open `/admin/empire`, unlock, select ZLANK, connect the owner wallet, click Sign +
deploy. Expected: a `baseToken` slug returns and the SmartVault treasury resolves.

- [ ] **Step 3: Verify + record**

`curl -s localhost:3000/c/zlank` shows the Capsule; confirm `economic_config.empire_address`
is set (via the operator or an MCP `select economic_config from capsules where slug='zlank'`).

- [ ] **Step 4: Commit any doc note**

```bash
git commit --allow-empty -m "chore: first tokenless empire deployed for ZLANK (mainnet)"
```

---

## Self-review notes

- Spec coverage: this plan is Slice 1 (parallel mainnet deploy test, section 7 of the
  spec) only. Layer 0 (ZAO Profile / Farcaster-first auth + Privy backup), Layer 1
  (Capsule ownership), the profile-folded free path, and Layer 3 (agents) are
  deliberately deferred to their own plans.
- The live deploy (Task 5) is manual and mainnet - not unit-tested by design; the
  testable units are the message builder (Task 1) and the request shaping.
- viem (Task 2) is the only new dependency and is gated on user approval.
