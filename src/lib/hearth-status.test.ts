import { test } from "node:test";
import assert from "node:assert/strict";
import { hearthStatusLabel } from "./hearth-status";

test("the spark status reads lit; others pass through", () => {
  assert.equal(hearthStatusLabel("spark"), "lit");
  assert.equal(hearthStatusLabel("tokenized"), "tokenized");
  assert.equal(hearthStatusLabel("dormant"), "dormant");
  assert.equal(hearthStatusLabel("something-new"), "something-new");
  assert.equal(hearthStatusLabel(null), "");
});
