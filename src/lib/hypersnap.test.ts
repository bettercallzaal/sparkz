import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProfile, parseCast, parseInfo, toIso, nodeUrl, DEFAULT_NODE_URL } from "./hypersnap";

const msg = (type: string, value: string) => ({
  hash: "0x1",
  data: { type: "MESSAGE_TYPE_USER_DATA_ADD", fid: 19640, timestamp: 1, network: "FARCASTER_NETWORK_MAINNET", userDataBody: { type, value } },
});

test("a profile is read from the node's userData messages, unknown fields ignored", () => {
  const p = parseProfile(19640, [
    msg("USER_DATA_TYPE_USERNAME", "zaal"),
    msg("USER_DATA_TYPE_DISPLAY", "Zaal"),
    msg("USER_DATA_TYPE_PFP", "https://imagedelivery.net/x/pfp.png"),
    msg("USER_DATA_TYPE_BIO", "Founder of the zao"),
    msg("USER_DATA_TYPE_URL", "https://thezao.com/nexus"),
    msg("USER_DATA_TYPE_TWITTER", "bettercallzaal"),
    msg("USER_DATA_PRIMARY_ADDRESS_ETHEREUM", "0xb79cdAbF6f2fB8Fea70C2e515AEC35E827bF7932"),
    msg("USER_DATA_TYPE_LOCATION", "geo:44.54,-68.43"),
    msg("USER_DATA_TYPE_BANNER", "https://imagedelivery.net/x/banner.png"),
  ]);
  assert.equal(p.fid, 19640);
  assert.equal(p.username, "zaal");
  assert.equal(p.display, "Zaal");
  assert.equal(p.pfp, "https://imagedelivery.net/x/pfp.png");
  assert.equal(p.bio, "Founder of the zao");
  assert.equal(p.url, "https://thezao.com/nexus");
  assert.equal(p.twitter, "bettercallzaal");
  assert.equal(p.address, "0xb79cdAbF6f2fB8Fea70C2e515AEC35E827bF7932");
});

test("a pfp or url that is not http is dropped, empty values stay null", () => {
  const p = parseProfile(1, [msg("USER_DATA_TYPE_PFP", "javascript:alert(1)"), msg("USER_DATA_TYPE_URL", "  "), msg("USER_DATA_TYPE_DISPLAY", " ")]);
  assert.equal(p.pfp, null);
  assert.equal(p.url, null);
  assert.equal(p.display, null);
});

test("a cast keeps its text, channel, embeds and a real time", () => {
  const c = parseCast({
    hash: "0x2fe8",
    data: {
      type: "MESSAGE_TYPE_CAST_ADD", fid: 19640, timestamp: 185024768, network: "FARCASTER_NETWORK_MAINNET",
      castAddBody: { text: "zm", parentUrl: "https://warpcast.com/~/channel/zao", parentCastId: null, embeds: [{ url: "https://media.firefly.land/a.png" }, { castId: { fid: 1, hash: "0x9" } }] },
    },
  });
  assert.ok(c);
  assert.equal(c.text, "zm");
  assert.equal(c.parentUrl, "https://warpcast.com/~/channel/zao");
  assert.deepEqual(c.embeds, ["https://media.firefly.land/a.png"]);
  assert.equal(c.at, toIso(185024768));
  assert.equal(c.at.slice(0, 4), "2026");
});

test("a message that is not a cast add is skipped", () => {
  assert.equal(parseCast({ hash: "0x1", data: { type: "MESSAGE_TYPE_CAST_REMOVE", fid: 1, timestamp: 1, network: "x", castAddBody: { text: "" } } }), null);
});

test("node info reads version, counts and shard heights", () => {
  const i = parseInfo({ version: "0.17.5", dbStats: { numMessages: 914514523, numFidRegistrations: 3358375 }, shardInfos: [{ shardId: 0, maxHeight: 50482554, blockDelay: 0 }, { shardId: 1, maxHeight: 51166819 }] });
  assert.equal(i.version, "0.17.5");
  assert.equal(i.messages, 914514523);
  assert.equal(i.fids, 3358375);
  assert.deepEqual(i.shards, [{ id: 0, height: 50482554, delay: 0 }, { id: 1, height: 51166819, delay: 0 }]);
});

test("the node URL comes from HYPERSNAP_NODE_URL, trailing slash dropped, else the public node", () => {
  const before = process.env.HYPERSNAP_NODE_URL;
  process.env.HYPERSNAP_NODE_URL = "https://node.example.org/";
  assert.equal(nodeUrl(), "https://node.example.org");
  process.env.HYPERSNAP_NODE_URL = "";
  assert.equal(nodeUrl(), DEFAULT_NODE_URL);
  if (before === undefined) delete process.env.HYPERSNAP_NODE_URL; else process.env.HYPERSNAP_NODE_URL = before;
});
