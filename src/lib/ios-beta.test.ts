import { test } from "node:test";
import assert from "node:assert/strict";
import { iosBetaUrl } from "./ios-beta";

test("a TestFlight join link turns the button on", () => {
  assert.equal(iosBetaUrl("https://testflight.apple.com/join/AbC123xy"), "https://testflight.apple.com/join/AbC123xy");
  assert.equal(iosBetaUrl("  https://testflight.apple.com/join/AbC123xy \n"), "https://testflight.apple.com/join/AbC123xy");
});

test("unset, empty or any other link keeps the button off", () => {
  for (const v of [undefined, "", "   ", "http://testflight.apple.com/join/AbC123", "https://evil.example/join/AbC123",
    "https://testflight.apple.com/join/", "https://testflight.apple.com.evil.example/join/AbC123", "https://testflight.apple.com/join/AbC123?x=1"]) {
    assert.equal(iosBetaUrl(v), null, String(v));
  }
});
