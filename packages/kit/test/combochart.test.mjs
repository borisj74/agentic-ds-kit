/**
 * ComboChart: bars and a line on one chart. Logic (colours, extents, aligned right-axis ticks,
 * column values, keyboard moves), the shared curve, and the SSR render through the CSS stub
 * (frame, legend with both kinds, Table toggle, empty state). The plot itself draws after the
 * browser measures the width, so SSR covers the frame. Runs against the built kit (dist): build
 * first (npm run build -w agentic-ds-kit).
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

const data = [
  { label: "Jan", revenue: 42000, growth: 0 },
  { label: "Feb", revenue: 45500, growth: 8.3 },
  { label: "Mar", revenue: 44100, growth: -3.1 },
  { label: "Apr", growth: 4 },
];
const bars = [{ key: "revenue", label: "Revenue" }];
const line = { key: "growth", label: "Growth" };

let logic;
let curve;
let React;
let renderToStaticMarkup;
let ComboChart;

before(async () => {
  logic = await import("../dist/ui/ComboChart/comboChart.logic.js");
  curve = await import("../dist/ui/shared/curve.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ComboChart } = await import("../dist/ui/ComboChart/ComboChart.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(ComboChart, { data, bars, line, title: "Revenue and growth", ...props }));
}

describe("ComboChart logic", () => {
  test("bars skip --chart-3, which the line keeps", () => {
    assert.deepEqual([0, 1, 2].map(logic.barColor), ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"]);
    assert.equal(logic.LINE_COLOR, "var(--chart-3)");
  });

  test("values: missing or non-numeric fields are undefined; extents always include zero", () => {
    assert.equal(logic.valueOf(data[3], "revenue"), undefined);
    assert.equal(logic.valueOf({ label: "x", revenue: "12" }, "revenue"), undefined);
    assert.deepEqual(logic.extentOf(data, ["revenue"]), [0, 45500]);
    assert.deepEqual(logic.extentOf(data, ["growth"]), [-3.1, 8.3]);
    assert.deepEqual(logic.extentOf([], ["growth"]), [0, 1]);
  });

  test("right-axis ticks match the left tick count and cover the range with one nice step", () => {
    for (const [min, max, count] of [[-3.1, 8.3, 4], [0, 12.5, 5], [0, 0.42, 3], [-40, 10, 4]]) {
      const { ticks } = logic.alignedTicks(min, max, count);
      assert.equal(ticks.length, count, `${min}..${max} in ${count}`);
      assert.ok(ticks[0] <= min && ticks[ticks.length - 1] >= max, `${ticks} covers ${min}..${max}`);
      const step = ticks[1] - ticks[0];
      ticks.forEach((tick, index) => assert.ok(Math.abs(tick - (ticks[0] + step * index)) < 1e-9));
    }
  });

  test("column values list bars then the line; keys move column by column and stop at the ends", () => {
    assert.deepEqual(logic.columnValues(data[1], bars, line), { bars: [45500], line: 8.3 });
    assert.deepEqual(logic.columnValues(data[3], bars, line), { bars: [undefined], line: 4 });
    assert.equal(logic.nextColumn(0, "ArrowRight", 4), 1);
    assert.equal(logic.nextColumn(0, "ArrowLeft", 4), 0);
    assert.equal(logic.nextColumn(3, "ArrowRight", 4), 3);
    assert.equal(logic.nextColumn(2, "Home", 4), 0);
    assert.equal(logic.nextColumn(0, "End", 4), 3);
    assert.equal(logic.nextColumn(0, "Enter", 4), null);
  });

  test("the shared curve is the same smooth path LineChart draws, linear under three points", () => {
    const points = [{ x: 0, y: 10 }, { x: 10, y: 0 }, { x: 20, y: 5 }];
    assert.match(curve.smoothPath(points), /^M 0 10 C /);
    assert.equal(curve.smoothPath(points.slice(0, 2)), "M 0 10 L 10 0");
  });
});

describe("ComboChart render", () => {
  test("a titled frame with a legend naming both kinds and a Table toggle", () => {
    const html = render();
    assert.match(html, /<h3[^>]*>Revenue and growth<\/h3>/);
    assert.ok(html.includes(">Revenue<") && html.includes(">Growth<"));
    assert.ok(html.includes("var(--chart-1)"), "bar swatch");
    assert.ok(html.includes("var(--chart-3)"), "line swatch");
    assert.match(html, /aria-expanded="false"[^>]*>.*Table/s);
  });

  test("empty data, or no values at all, shows the frame empty state and no legend", () => {
    for (const rows of [[], [{ label: "Jan" }]]) {
      const html = render({ data: rows });
      assert.ok(html.includes("No data for this range"));
      assert.ok(!html.includes("var(--chart-3)"));
    }
  });
});
