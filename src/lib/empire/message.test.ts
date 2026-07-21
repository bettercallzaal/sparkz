import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenlessCustomMessage } from "./client";

test("custom message is byte-exact and trims the name", () => {
  assert.equal(
    tokenlessCustomMessage("  ZLANK  "),
    "I am deploying a custom tokenless Empire named ZLANK",
  );
});
