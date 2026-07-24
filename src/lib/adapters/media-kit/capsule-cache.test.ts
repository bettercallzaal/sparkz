import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mediaKitKey,
  usableCachedSegment,
  writeCachedSegment,
  toStored,
  listSegments,
  QUEUED_TTL_MS,
  type StoredSegment,
} from "./capsule-cache";
import type { SegmentJob } from "./types";

const NOW = Date.parse("2026-07-23T12:00:00.000Z");

function seg(over: Partial<StoredSegment> = {}): StoredSegment {
  return {
    key: "k1",
    jobId: "job-1",
    status: "ready",
    videoUrl: "https://v/1.mp4",
    anchor: "amina",
    provider: "stub",
    scriptChars: 10,
    renderedAt: new Date(NOW).toISOString(),
    ...over,
  };
}

test("mediaKitKey is stable and differs by anchor and by script", () => {
  assert.equal(mediaKitKey("hello", "amina"), mediaKitKey(" hello ", "amina")); // trims
  assert.notEqual(mediaKitKey("hello", "amina"), mediaKitKey("hello", "jabari"));
  assert.notEqual(mediaKitKey("hello", "amina"), mediaKitKey("world", "amina"));
});

test("ready segment is always a cache hit", () => {
  const md = writeCachedSegment(null, seg({ key: "k1" }));
  assert.equal(usableCachedSegment(md, "k1", NOW)?.jobId, "job-1");
});

test("fresh queued segment is reused (in-flight dedupe)", () => {
  const md = writeCachedSegment(null, seg({ key: "k2", status: "queued", videoUrl: null }));
  assert.ok(usableCachedSegment(md, "k2", NOW + 1000));
});

test("stale queued segment is NOT reused (re-render)", () => {
  const md = writeCachedSegment(null, seg({ key: "k3", status: "queued", videoUrl: null }));
  assert.equal(usableCachedSegment(md, "k3", NOW + QUEUED_TTL_MS + 1), null);
});

test("failed and missing segments are not cache hits", () => {
  const md = writeCachedSegment(null, seg({ key: "k4", status: "failed", videoUrl: null }));
  assert.equal(usableCachedSegment(md, "k4", NOW), null);
  assert.equal(usableCachedSegment(md, "does-not-exist", NOW), null);
});

test("writeCachedSegment merges immutably and preserves other metadata", () => {
  const before = { ip_hash: "abc", mediaKit: { segments: { k1: seg({ key: "k1" }) } } };
  const after = writeCachedSegment(before, seg({ key: "k2", jobId: "job-2" }));
  assert.equal((after as typeof before).ip_hash, "abc"); // untouched
  const segs = (after.mediaKit as { segments: Record<string, StoredSegment> }).segments;
  assert.equal(Object.keys(segs).length, 2); // both kept
  // original object not mutated
  assert.equal(Object.keys(before.mediaKit.segments).length, 1);
});

test("toStored maps a job into a stored record", () => {
  const job: SegmentJob = {
    jobId: "j9", status: "ready", videoUrl: "https://v/9.mp4",
    provider: "baraza", anchor: "jabari", createdAt: new Date(NOW).toISOString(),
  };
  const s = toStored(job, "k9", 42);
  assert.equal(s.jobId, "j9");
  assert.equal(s.key, "k9");
  assert.equal(s.scriptChars, 42);
  assert.equal(s.anchor, "jabari");
});

test("listSegments returns newest first", () => {
  let md: Record<string, unknown> = {};
  md = writeCachedSegment(md, seg({ key: "a", renderedAt: "2026-07-01T00:00:00.000Z" }));
  md = writeCachedSegment(md, seg({ key: "b", renderedAt: "2026-07-20T00:00:00.000Z" }));
  const list = listSegments(md);
  assert.equal(list[0].key, "b");
  assert.equal(list[1].key, "a");
});
