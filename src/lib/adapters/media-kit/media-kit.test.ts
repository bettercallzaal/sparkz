import { test } from "node:test";
import assert from "node:assert/strict";
import { stubProvider, _stubInternals } from "./stub";
import { getMediaKitProvider, mediaKitMode } from "./index";
import { MAX_SCRIPT_CHARS } from "./types";

test("stub renderSegment returns a ready job with a derived video url", async () => {
  const job = await stubProvider.renderSegment({ script: "hello", anchor: "amina" });
  assert.equal(job.status, "ready");
  assert.equal(job.provider, "stub");
  assert.ok(job.jobId.startsWith(_stubInternals.STUB_PREFIX));
  assert.ok(job.videoUrl && job.videoUrl.includes(job.jobId));
});

test("stub job id is deterministic for the same script+anchor", async () => {
  const a = await stubProvider.renderSegment({ script: "same", anchor: "jabari" });
  const b = await stubProvider.renderSegment({ script: "same", anchor: "jabari" });
  assert.equal(a.jobId, b.jobId);
});

test("stub getSegment reconstructs a ready job from the id (stateless)", async () => {
  const rendered = await stubProvider.renderSegment({ script: "x", anchor: "amina" });
  const polled = await stubProvider.getSegment(rendered.jobId);
  assert.equal(polled.status, "ready");
  assert.equal(polled.videoUrl, rendered.videoUrl);
});

test("stub getSegment on a non-stub id reports failed, not a fake ready", async () => {
  const job = await stubProvider.getSegment("baraza-real-123");
  assert.equal(job.status, "failed");
  assert.equal(job.videoUrl, null);
});

test("stub rejects an over-long script before any render", async () => {
  await assert.rejects(
    stubProvider.renderSegment({ script: "a".repeat(MAX_SCRIPT_CHARS + 1), anchor: "amina" }),
    /exceeds/,
  );
});

test("selector defaults to stub when BARAZA_API_URL is unset", () => {
  const prev = process.env.BARAZA_API_URL;
  delete process.env.BARAZA_API_URL;
  assert.equal(mediaKitMode(), "stub");
  assert.equal(getMediaKitProvider().id, "stub");
  if (prev !== undefined) process.env.BARAZA_API_URL = prev;
});

test("selector flips to baraza when BARAZA_API_URL is set", () => {
  const prev = process.env.BARAZA_API_URL;
  process.env.BARAZA_API_URL = "https://baraza.example";
  assert.equal(mediaKitMode(), "baraza");
  assert.equal(getMediaKitProvider().id, "baraza");
  if (prev === undefined) delete process.env.BARAZA_API_URL;
  else process.env.BARAZA_API_URL = prev;
});
