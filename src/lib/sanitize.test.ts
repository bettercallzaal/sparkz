import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublicReview } from "./sanitize";

test("no review flag or approved is public", () => {
  assert.equal(isPublicReview({}), true);
  assert.equal(isPublicReview(null), true);
  assert.equal(isPublicReview({ review: null }), true);
  assert.equal(isPublicReview({ review: "approved" }), true);
});

test("pending and rejected are not public", () => {
  assert.equal(isPublicReview({ review: "pending" }), false);
  assert.equal(isPublicReview({ review: "rejected" }), false);
});

test("an unexpected value is not public", () => {
  assert.equal(isPublicReview({ review: "maybe" }), false);
});
