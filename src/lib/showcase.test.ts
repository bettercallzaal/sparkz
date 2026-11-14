import { test } from "node:test";
import assert from "node:assert/strict";
import { pickShowcase } from "./showcase";

const h = (slug: string) => ({ slug });

test("featured follow the showcase order, not the input order", () => {
  const all = [h("zabal-gamez"), h("sparkz"), h("zabal"), h("coc-concertz"), h("zao-festivals")];
  const { featured, others } = pickShowcase(all);
  assert.deepEqual(
    featured.map((x) => x.slug),
    ["zao-festivals", "coc-concertz", "zabal", "zabal-gamez"],
  );
  assert.equal(others, 1);
});

test("a featured slug that is not public is skipped, not shown empty", () => {
  const { featured, others } = pickShowcase([h("zabal"), h("zao-devz")]);
  assert.deepEqual(featured.map((x) => x.slug), ["zabal"]);
  assert.equal(others, 1);
});

test("no public Hearths gives nothing featured and no others", () => {
  assert.deepEqual(pickShowcase([]), { featured: [], others: 0 });
});
