import { test } from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_HOST, CANONICAL_URL, canonicalOrigin } from "./origin";

function withOrigin<T>(value: string | undefined, fn: () => T): T {
  const before = process.env.SPARKZ_ORIGIN;
  if (value === undefined) delete process.env.SPARKZ_ORIGIN;
  else process.env.SPARKZ_ORIGIN = value;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env.SPARKZ_ORIGIN;
    else process.env.SPARKZ_ORIGIN = before;
  }
}

test("the canonical URL is https on the canonical host", () => {
  assert.equal(CANONICAL_HOST, "trysparkz.com");
  assert.equal(CANONICAL_URL, "https://trysparkz.com");
});

test("with SPARKZ_ORIGIN unset or blank, links use the canonical URL", () => {
  for (const value of [undefined, "", "   "]) {
    withOrigin(value, () => assert.equal(canonicalOrigin(), CANONICAL_URL));
  }
});

test("SPARKZ_ORIGIN is trimmed and loses trailing slashes", () => {
  withOrigin(" https://preview.example.com/// ", () =>
    assert.equal(canonicalOrigin(), "https://preview.example.com"),
  );
  withOrigin("https://trysparkz.com", () => assert.equal(canonicalOrigin(), "https://trysparkz.com"));
});
