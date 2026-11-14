import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyContext,
  hasContext,
  linesToList,
  readContext,
} from "./hearth-context";

test("reads a full context", () => {
  const c = readContext({
    stage: "live",
    done: ["Show 1"],
    needs: ["Sound engineer"],
  });
  assert.deepEqual(c, {
    stage: "live",
    done: ["Show 1"],
    needs: ["Sound engineer"],
  });
  assert.equal(hasContext(c), true);
});

test("an unknown stage, non-list or non-string items read as empty, never throw", () => {
  const c = readContext({
    stage: "moon",
    done: "Show 1",
    needs: [42, " ", "Venue"],
  });
  assert.deepEqual(c, { stage: null, done: [], needs: ["Venue"] });
  assert.deepEqual(readContext(null), { stage: null, done: [], needs: [] });
  assert.equal(hasContext(readContext({})), false);
});

test("the edit box turns lines into a list, dropping blanks and repeats", () => {
  assert.deepEqual(linesToList("Venue\n\n  Sound \nVenue\n"), [
    "Venue",
    "Sound",
  ]);
});

test("applying an edit sets, leaves alone, and clears", () => {
  const meta: Record<string, unknown> = {
    about: "keep me",
    stage: "idea",
    done: ["a"],
    needs: ["b"],
  };
  applyContext(meta, { stage: "building", needs: [] });
  assert.deepEqual(meta, { about: "keep me", stage: "building", done: ["a"] });
  applyContext(meta, { stage: "", done: [" x ", "x", ""] });
  assert.deepEqual(meta, { about: "keep me", done: ["x"] });
});
