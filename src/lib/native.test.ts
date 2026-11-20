import { test } from "node:test";
import assert from "node:assert/strict";
import { haptic, isNativeIos, nativeShare, shareWasCancelled } from "./native";

test("outside the iPhone app the native helpers stand aside", async () => {
  assert.equal(isNativeIos(), false);
  // false tells ShareButton to open its own menu.
  assert.equal(await nativeShare({ url: "https://trysparkz.com/c/x" }), false);
  await haptic("success"); // resolves, does nothing
});

test("closing the share sheet counts as handled, a missing plugin does not", () => {
  assert.equal(shareWasCancelled(new Error("Share canceled")), true);
  assert.equal(shareWasCancelled("User cancelled"), true);
  assert.equal(shareWasCancelled(new Error('"Share" plugin is not implemented on ios')), false);
  assert.equal(shareWasCancelled(undefined), false);
});
