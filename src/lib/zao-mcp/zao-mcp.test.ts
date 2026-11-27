import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { canonicalize, sha256Hex } from "./canonical";
import { RECEIPTS } from "./receipts-data";
import { ALLOWLIST, type Approval } from "./allowlist";
import { getApprovedReceipt, openContributionProof } from "./proof";
import { listZaoProjects } from "./projects";
import { ZAO_TOOLS } from "./registry";
import type { Hearth } from "@/lib/supabase/types";

const ID = "fixture-zoostr-logo-0";
const SHA = "1861f86b7f500b10f4d944362f1f0090752b56751083b5cbd85623be0b682b6e";
const NOW = Date.parse("2026-11-26T12:00:00Z");
const ETH = /0x[0-9a-fA-F]{40}/;

test("every stored receipt is canonical and named by the sha256 of its exact bytes", () => {
  for (const [key, bytes] of Object.entries(RECEIPTS)) {
    const sha = key.split("/")[1];
    assert.equal(createHash("sha256").update(Buffer.from(bytes, "utf8")).digest("hex"), sha, key);
    assert.equal(canonicalize(JSON.parse(bytes)), bytes, `${key} is not canonical`);
  }
  for (const a of ALLOWLIST) assert.ok(RECEIPTS[`${a.contribution_id}/${a.sha256}`], `${a.contribution_id} has bytes`);
});

test("canonical JSON sorts keys, drops whitespace and refuses floats", () => {
  assert.equal(canonicalize({ b: 1, a: [true, null, "x"] }), '{"a":[true,null,"x"],"b":1}');
  assert.throws(() => canonicalize({ n: 1.5 }));
});

// Brandon's check 1: the approved id and digest open in chat and in the browser, with the
// same source and canonical digest.
test("check 1: chat and browser serve the same bytes and digest", async () => {
  const res = openContributionProof({ contribution_id: ID, receipt_sha256: SHA }, NOW);
  assert.equal(res.isError, undefined);
  const s = res.structuredContent as Record<string, string>;
  assert.equal(s.digest, SHA);
  assert.ok(s.viewer_url.endsWith(`/proof/${ID}/${SHA}`));
  assert.equal(s.source_link, "https://poidh.xyz/base/bounty/1568");
  const { GET } = await import("@/app/proof/[id]/[sha]/raw/route");
  const raw = await GET(new Request(`https://trysparkz.com/proof/${ID}/${SHA}/raw`), {
    params: Promise.resolve({ id: ID, sha: SHA }),
  });
  assert.equal(raw.status, 200);
  const body = await raw.text();
  assert.equal(sha256Hex(body), SHA);
  assert.equal(body, RECEIPTS[`${ID}/${SHA}`]);
});

// Brandon's check 2: a changed digest, an unapproved id, the wrong issuer or an expired
// approval fails closed, and no record fields come back.
const closed = (r: ReturnType<typeof openContributionProof>) => {
  assert.equal(r.isError, true);
  assert.deepEqual(r.structuredContent, { error: "closed" });
  assert.doesNotMatch(r.content[0].text, /poidh|zoostr/i);
};

test("check 2: a changed digest fails closed", () => {
  closed(openContributionProof({ contribution_id: ID, receipt_sha256: SHA.slice(0, 63) + "0" }, NOW));
});

test("check 2: an unknown id, a path in the id and bad input fail closed", () => {
  closed(openContributionProof({ contribution_id: "no-such-record", receipt_sha256: SHA }, NOW));
  closed(openContributionProof({ contribution_id: "../../etc", receipt_sha256: SHA }, NOW));
  closed(openContributionProof({ contribution_id: ID }, NOW));
  closed(openContributionProof({ contribution_id: ID, receipt_sha256: SHA, extra: 1 }, NOW));
});

test("check 2: an expired approval fails closed", () => {
  const after = Date.parse(ALLOWLIST[0].expires_at) + 1;
  closed(openContributionProof({ contribution_id: ID, receipt_sha256: SHA }, after));
});

test("check 2: bytes on record but not on the allowlist stay closed; wrong issuer or audience too", () => {
  const bytes = '{"id":"not-approved","type":"fixture"}';
  const sha = sha256Hex(bytes);
  assert.equal(getApprovedReceipt("not-approved", sha, NOW, { [`not-approved/${sha}`]: bytes }), null);
  const base: Approval = { ...ALLOWLIST[0] };
  assert.notEqual(getApprovedReceipt(ID, SHA, NOW, RECEIPTS, [base]), null);
  assert.equal(getApprovedReceipt(ID, SHA, NOW, RECEIPTS, [{ ...base, issuer: "someone" as "sparkz" }]), null);
  assert.equal(getApprovedReceipt(ID, SHA, NOW, RECEIPTS, [{ ...base, audience: "other" as "zao-mcp" }]), null);
});

test("check 2: stored bytes that no longer hash to their name fail closed", () => {
  const tampered = { [`${ID}/${SHA}`]: RECEIPTS[`${ID}/${SHA}`].replace("Not a real", "A real") };
  assert.equal(getApprovedReceipt(ID, SHA, NOW, tampered), null);
});

test("check 2: the browser route 404s a closed record", async () => {
  const { GET } = await import("@/app/proof/[id]/[sha]/raw/route");
  const res = await GET(new Request("https://trysparkz.com/x"), {
    params: Promise.resolve({ id: ID, sha: SHA.slice(0, 63) + "0" }),
  });
  assert.equal(res.status, 404);
});

// Brandon's check 3: a plain MCP client works without a visual card.
test("check 3: the answer is plain text with the exact link, and no card is required", () => {
  const res = openContributionProof({ contribution_id: ID, receipt_sha256: SHA }, NOW);
  assert.equal(res.content[0].type, "text");
  assert.match(res.content[0].text, new RegExp(`/proof/${ID}/${SHA}$`, "m"));
  assert.match(res.content[0].text, /^FIXTURE PROOF/);
  assert.equal("_meta" in res, false);
});

// Brandon's check 4: no posting, payout, wallet action, bounty change or write tool.
test("check 4: exactly two tools, both read only, none that writes", () => {
  assert.deepEqual(ZAO_TOOLS.map((t) => t.name).sort(), ["list_zao_projects", "open_contribution_proof"]);
  for (const t of ZAO_TOOLS) {
    assert.equal(t.readOnly, true);
    assert.doesNotMatch(t.name, /create|update|delete|write|post|send|pay|mint|transfer|claim|launch/);
  }
});

test("the record keeps SOURCE_REPORTED and NOT_EVALUATED, claims no parity, and holds no wallet, payout or contact", () => {
  const res = openContributionProof({ contribution_id: ID, receipt_sha256: SHA }, NOW);
  const s = res.structuredContent as Record<string, string>;
  assert.equal(s.evidence_status, "SOURCE_REPORTED");
  assert.equal(s.settlement, "NOT_EVALUATED");
  assert.equal(s.parity, "NOT_CHECKED");
  const all = JSON.stringify(res);
  assert.doesNotMatch(all, ETH);
  assert.doesNotMatch(all, /payout|email|[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,}/i);
});

test("a receipt that carries a wallet address is kept closed", () => {
  const bytes = canonicalize({ id: "leaky", type: "fixture", what: "paid 0x1111111111111111111111111111111111111111" });
  const sha = sha256Hex(bytes);
  const allow: Approval[] = [{ ...ALLOWLIST[0], contribution_id: "leaky", sha256: sha }];
  assert.equal(getApprovedReceipt("leaky", sha, NOW, { [`leaky/${sha}`]: bytes }, allow), null);
});

test("list_zao_projects gives only public fields, and strips any address from a bio", async () => {
  const hearth = (over: Partial<Hearth>): Hearth => ({
    id: "1",
    slug: "zoostr",
    type: "creator",
    name: "Zoostr",
    bio: "The first Creator Hearth.\nSecond line.",
    owner_wallet: "0x2222222222222222222222222222222222222222",
    owner_fid: 19640,
    status: "spark",
    economic_config: { token_address: "0x3333333333333333333333333333333333333333" },
    metadata: { owner_email: "a@example.com", ip_hash: "h" },
    created_at: "",
    updated_at: "",
    ...over,
  });
  const res = await listZaoProjects(async () => [
    hearth({}),
    hearth({ id: "2", slug: "fef", name: "Farcaster Eats First", type: "meme", bio: "Sent by 0x4444444444444444444444444444444444444444 today" }),
  ]);
  const { projects } = res.structuredContent as { projects: Record<string, unknown>[] };
  assert.deepEqual(projects.map((p) => p.slug), ["fef", "zoostr"]);
  assert.deepEqual(Object.keys(projects[0]).sort(), ["about", "name", "slug", "status", "type", "url"]);
  assert.equal(projects[1].about, "The first Creator Hearth.");
  const all = JSON.stringify(res);
  assert.doesNotMatch(all, ETH);
  assert.doesNotMatch(all, /example\.com|19640|ip_hash/);
});
