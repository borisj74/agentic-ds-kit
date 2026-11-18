/**
 * Chart value-axis ticks (BarChart passes integer for whole-number data). The chart SVG paints
 * only after it measures its width, so this checks the tick math. Runs against the built kit
 * (dist); `npm test` builds first. CSS imports are stubbed.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

let niceTicks;

before(async () => {
  ({ niceTicks } = await import("../dist/ui/shared/chartMath.js"));
});

describe("niceTicks", () => {
  test("integer keeps a whole-number step; without it, steps can be fractional", () => {
    assert.deepEqual(niceTicks(0, 2, 5).ticks, [0, 0.5, 1, 1.5, 2]);
    assert.deepEqual(niceTicks(0, 2, 5, { integer: true }).ticks, [0, 1, 2]);
    assert.deepEqual(niceTicks(0, 1, 5, { integer: true }).ticks, [0, 1]);
    assert.deepEqual(niceTicks(0, 40, 5, { integer: true }).ticks, [0, 10, 20, 30, 40]);
  });
});
