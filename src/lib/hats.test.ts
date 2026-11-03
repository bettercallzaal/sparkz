import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHatId, prettyHatId } from "./hats";

const B = BigInt;
// The ZAO top hat: tree 226 in the top 32 bits, nothing below.
const TOP = B(226) << B(224);
const at = (level: number, shift: number) => B(level) << B(shift);

test("parses the dotted id the Hats app shows", () => {
  assert.equal(parseHatId("226"), TOP);
  assert.equal(parseHatId("226.1"), TOP | at(1, 208));
  assert.equal(parseHatId("226.1.1.1.1.4"), TOP | at(1, 208) | at(1, 192) | at(1, 176) | at(1, 160) | at(4, 144));
});

test("parses hex and decimal, rejects junk", () => {
  assert.equal(parseHatId("0x000000e2" + "0001".repeat(4) + "0".repeat(40)), parseHatId("226.1.1.1.1"));
  assert.equal(parseHatId(TOP.toString()), TOP);
  assert.equal(parseHatId(""), null);
  assert.equal(parseHatId("226.0"), null);
  assert.equal(parseHatId("226.70000"), null);
  assert.equal(parseHatId("hat"), null);
});

test("pretty id round-trips", () => {
  for (const id of ["226", "226.1.2", "226.1.1.13", "226.1.1.1.1.4"]) {
    assert.equal(prettyHatId(parseHatId(id)!), id);
  }
});
