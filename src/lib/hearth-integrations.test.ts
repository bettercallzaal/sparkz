import { test } from "node:test";
import assert from "node:assert/strict";
import { hearthIntegrations, hiddenIntegrations } from "./hearth-integrations";

type H = Parameters<typeof hearthIntegrations>[0];
const hearth = (over: Partial<H> = {}): H => ({
  type: "creator",
  economic_config: {},
  metadata: {},
  ...over,
} as H);
const byId = (h: H, emailCount = 0) =>
  Object.fromEntries(hearthIntegrations(h, emailCount).map((i) => [i.id, i]));

test("the grid always has the same six cards in the same order", () => {
  assert.deepEqual(
    hearthIntegrations(hearth()).map((i) => i.id),
    ["empire", "farcaster", "email", "token", "agent", "bounties"],
  );
});

test("a bare Hearth shows every card as not connected, with the default wording", () => {
  const g = byId(hearth());
  for (const card of Object.values(g)) assert.equal(card.connected, false, card.id);
  assert.equal(g.empire.value, "not deployed");
  assert.equal(g.empire.href, undefined);
  assert.equal(g.farcaster.value, "not linked");
  assert.equal(g.email.value, "0 on list");
  assert.equal(g.token.value, "spark (no coin)");
  assert.equal(g.agent.value, "scaffold");
  assert.equal(g.bounties.value, "soon");
});

test("Empire: an address is shortened; an id alone reads linked and links to Empire Builder", () => {
  const addr = "0x1234567890abcdef1234567890abcdef12345678";
  const withAddr = byId(hearth({ economic_config: { empire_address: addr, empire_id: 42 } })).empire;
  assert.equal(withAddr.connected, true);
  assert.equal(withAddr.value, "0x1234...5678");
  assert.equal(withAddr.href, "https://www.empirebuilder.world/empire/42");
  const idOnly = byId(hearth({ economic_config: { empire_id: "abc" } })).empire;
  assert.equal(idOnly.value, "linked");
  assert.equal(idOnly.href, "https://www.empirebuilder.world/empire/abc");
});

test("Farcaster prefers channel, then username, then fid", () => {
  const all = byId(hearth({ metadata: { farcaster: { fid: 3, username: "zaal", channel: "zao" } } })).farcaster;
  assert.equal(all.value, "/zao");
  assert.equal(all.href, "https://farcaster.xyz/~/channel/zao");
  const user = byId(hearth({ metadata: { farcaster: { fid: 3, username: "zaal" } } })).farcaster;
  assert.equal(user.value, "@zaal");
  assert.equal(user.href, "https://farcaster.xyz/zaal");
  const fid = byId(hearth({ metadata: { farcaster: { fid: 3 } } })).farcaster;
  assert.equal(fid.value, "fid 3");
  assert.equal(fid.connected, true);
  assert.equal(fid.href, undefined);
});

test("email counts the list and connects only above zero", () => {
  assert.equal(byId(hearth(), 0).email.connected, false);
  const e = byId(hearth(), 12).email;
  assert.equal(e.connected, true);
  assert.equal(e.value, "12 on list");
});

test("token and agent read from economic_config; short addresses stay whole", () => {
  const g = byId(hearth({ economic_config: { token_address: "0xshort", agent: { name: "x" } } }));
  assert.equal(g.token.connected, true);
  assert.equal(g.token.value, "0xshort");
  assert.equal(g.agent.connected, true);
  assert.equal(g.agent.value, "configured");
});

test("hiddenIntegrations returns only string ids, and none by default", () => {
  assert.deepEqual(hiddenIntegrations({ metadata: {} }), []);
  assert.deepEqual(hiddenIntegrations({ metadata: { hidden_integrations: "email" } }), []);
  assert.deepEqual(hiddenIntegrations({ metadata: { hidden_integrations: ["email", 3, null, "token"] } }), ["email", "token"]);
});
