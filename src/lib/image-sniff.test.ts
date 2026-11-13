import { test } from "node:test";
import assert from "node:assert/strict";
import { sniffImage } from "./image-sniff";

const u = (...b: number[]) => new Uint8Array(b);

test("real image headers are recognised", () => {
  assert.equal(sniffImage(u(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0)), "image/png");
  assert.equal(sniffImage(u(0xff, 0xd8, 0xff, 0xe0)), "image/jpeg");
  assert.equal(sniffImage(u(0x47, 0x49, 0x46, 0x38, 0x39, 0x61)), "image/gif");
  assert.equal(sniffImage(u(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50)), "image/webp");
});

test("HTML and SVG pretending to be images are refused", () => {
  const html = new TextEncoder().encode("<html><script>alert(1)</script>");
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">');
  assert.equal(sniffImage(html), null);
  assert.equal(sniffImage(svg), null);
});

test("a truncated header is refused", () => {
  assert.equal(sniffImage(u(0x89, 0x50)), null);
  assert.equal(sniffImage(u()), null);
});
