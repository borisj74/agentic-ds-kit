/**
 * LineChart stacking: the stack maths (stacked and percent, missing and negative values as 0), the
 * reversed curve that closes each band along the one below, and the frame (legend order, Table) in
 * SSR. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const series = [
  { label: "Free", data: [100, 120, 140], color: "var(--chart-1)" },
  { label: "Pro", data: [50, undefined, 60], color: "var(--chart-2)" },
  { label: "Team", data: [Number.NaN, 30, -10], color: "var(--chart-3)" },
];

let logic;
let curve;
let React;
let renderToStaticMarkup;
let LineChart;

before(async () => {
  logic = await import("../dist/ui/LineChart/lineChart.logic.js");
  curve = await import("../dist/ui/shared/curve.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ LineChart } = await import("../dist/ui/LineChart/LineChart.js"));
});

describe("LineChart stack maths", () => {
  test("missing, NaN and negative values count as 0", () => {
    assert.equal(logic.stackValue(undefined), 0);
    assert.equal(logic.stackValue(Number.NaN), 0);
    assert.equal(logic.stackValue(-10), 0);
    assert.equal(logic.stackValue(12), 12);
    assert.equal(logic.hasNegative(series), true);
    assert.equal(logic.hasNegative(series.slice(0, 2)), false);
  });

  test("stacked: bands pile bottom to top, each starting where the one below ends; the top edge is the total", () => {
    const { layers, totals, max } = logic.stackLayers(series, 3, "stacked");
    assert.deepEqual(totals, [150, 150, 200]);
    assert.equal(max, 200);
    assert.deepEqual(layers.map((layer) => layer.values), [[100, 120, 140], [50, 0, 60], [0, 30, 0]]);
    assert.deepEqual(layers[0].lower, [0, 0, 0]);
    assert.deepEqual(layers[0].upper, [100, 120, 140]);
    assert.deepEqual(layers[1].lower, layers[0].upper, "no gap: band 2 starts on band 1's top");
    assert.deepEqual(layers[1].upper, [150, 120, 200]);
    assert.deepEqual(layers[2].lower, layers[1].upper);
    assert.deepEqual(layers[2].upper, totals);
  });

  test("percent: every column reaches 100 and each band is that series' share; an all-zero column stays at 0", () => {
    const { layers, max } = logic.stackLayers(series, 3, "percent");
    assert.equal(max, 100);
    const top = layers[layers.length - 1].upper;
    top.forEach((value) => assert.ok(Math.abs(value - 100) < 1e-9, `${value}`));
    assert.ok(Math.abs(layers[0].upper[0] - (100 / 150) * 100) < 1e-9);
    const empty = logic.stackLayers([{ label: "A", data: [0, undefined] }, { label: "B", data: [0, 0] }], 2, "percent");
    assert.deepEqual(empty.layers[1].upper, [0, 0]);
    assert.deepEqual(empty.totals, [0, 0]);
  });

  test("shares and the percent format", () => {
    assert.equal(logic.sharePercent(50, 200), 25);
    assert.equal(logic.sharePercent(1, 0), 0);
    assert.equal(logic.formatPercent(50), "50%");
  });
});

describe("Shared curve", () => {
  test("the reversed curve walks the same points backwards and ends on the first point", () => {
    const points = [{ x: 0, y: 10 }, { x: 10, y: 0 }, { x: 20, y: 6 }, { x: 30, y: 4 }];
    const reversed = curve.reversedCurveCommands(points, "smooth");
    assert.equal((reversed.match(/C /g) ?? []).length, points.length - 1);
    assert.match(reversed, /0 10$/);
    assert.equal(curve.reversedCurveCommands(points, "linear"), "L 20 6 L 10 0 L 0 10");
    assert.equal(curve.reversedCurveCommands(points.slice(0, 2), "smooth"), "L 0 10");
  });
});

describe("LineChart stacked frame", () => {
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(LineChart, {
        title: "Seats by plan",
        labels: ["Jan", "Feb", "Mar"],
        series: series.slice(0, 2),
        ...props,
      }),
    );

  test("stacked: the legend lists the top layer first", () => {
    const html = render({ variant: "area", stack: "stacked" });
    assert.ok(html.indexOf(">Pro<") < html.indexOf(">Free<"), "Pro (top) before Free (bottom)");
  });

  test("default stack none keeps the legend in data order", () => {
    const html = render({ variant: "area" });
    assert.ok(html.indexOf(">Free<") < html.indexOf(">Pro<"));
  });

  test("stack on a line chart is ignored, with one development warning", () => {
    const warnings = [];
    const original = console.warn;
    console.warn = (message) => warnings.push(String(message));
    try {
      const html = render({ variant: "line", stack: "stacked" });
      render({ variant: "line", stack: "percent" });
      assert.ok(html.indexOf(">Free<") < html.indexOf(">Pro<"), "line keeps data order");
    } finally {
      console.warn = original;
    }
    assert.equal(warnings.filter((message) => message.includes('only applies to variant="area"')).length, 1);
  });
});
