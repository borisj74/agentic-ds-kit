/**
 * ScatterChart: scales (axis ticks, groups, colours), size mapping by area, keyboard order, and the
 * SSR frame (legend, Table with every value, empty state). The plot draws after the browser measures
 * the width, so SSR covers the frame and table. Runs against the built kit (dist): build first
 * (npm run build -w agentic-ds-kit).
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
  { id: "b", label: "Globex", x: 31800, y: 41, group: "Enterprise", size: 220 },
  { id: "a", label: "Acme", x: 12400, y: 18, group: "Pro", size: 40 },
  { id: "c", label: "Initech", x: 4200, y: 7, group: "Pro" },
  { id: "d", label: "Tie later", x: 12400, y: 30, group: "Starter", size: 10 },
  { id: "e", label: "Broken", x: Number.NaN, y: 3 },
];

let logic;
let React;
let renderToStaticMarkup;
let ScatterChart;

before(async () => {
  logic = await import("../dist/ui/ScatterChart/scatterChart.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ScatterChart } = await import("../dist/ui/ScatterChart/ScatterChart.js"));
});

describe("ScatterChart scales", () => {
  test("rows without a finite x and y are left out", () => {
    assert.deepEqual(logic.plottable(data).map((row) => row.id), ["b", "a", "c", "d"]);
  });

  test("axes start at zero for non-negative data, keep negatives, and stay whole for whole numbers", () => {
    assert.deepEqual(logic.axisTicks([4200, 12400, 31800], 4).ticks, [0, 20000, 40000]);
    assert.deepEqual(logic.axisTicks([7, 18, 41], 4).ticks, [0, 20, 40, 60]);
    const negative = logic.axisTicks([-12, 30], 4);
    assert.ok(negative.min <= -12 && negative.max >= 30);
    assert.ok(logic.axisTicks([0.2, 0.7], 4).ticks.some((tick) => !Number.isInteger(tick)));
    assert.deepEqual(logic.axisTicks([5, 5], 4).ticks.at(0), 0);
  });

  test("groups keep their first-appearance order and take --chart-1 onwards", () => {
    const groups = logic.groupsOf(logic.plottable(data));
    assert.deepEqual(groups, ["Enterprise", "Pro", "Starter"]);
    assert.equal(logic.groupColor(groups, "Enterprise"), "var(--chart-1)");
    assert.equal(logic.groupColor(groups, "Starter"), "var(--chart-3)");
  });
});

describe("ScatterChart size mapping", () => {
  test("radius grows with the square root: four times the value, twice the distance from the smallest", () => {
    const radius = logic.radiusScale([0, 25, 100], [4, 14]);
    assert.equal(radius(0), 4);
    assert.equal(radius(100), 14);
    assert.equal(radius(25), 9, "sqrt(25)=5 is halfway between sqrt(0)=0 and sqrt(100)=10");
  });

  test("missing, negative or NaN sizes take the smallest dot; equal sizes sit mid-range", () => {
    const radius = logic.radiusScale([10, undefined, 40], [3, 10]);
    assert.equal(radius(undefined), 3);
    assert.equal(radius(-5), 3);
    assert.equal(radius(Number.NaN), 3);
    assert.equal(logic.radiusScale([7, 7], [4, 14])(7), 9);
    assert.equal(logic.radiusScale([undefined], [4, 14])(undefined), 4);
  });
});

describe("ScatterChart keyboard order", () => {
  test("order is by x, then y, then data order", () => {
    const rows = logic.plottable(data);
    assert.deepEqual(logic.keyboardOrder(rows).map((index) => rows[index].id), ["c", "a", "d", "b"]);
  });

  test("arrow keys move one dot and stop at the ends; Home and End jump", () => {
    assert.equal(logic.nextPosition(0, "ArrowRight", 4), 1);
    assert.equal(logic.nextPosition(0, "ArrowLeft", 4), 0);
    assert.equal(logic.nextPosition(3, "ArrowDown", 4), 3);
    assert.equal(logic.nextPosition(2, "ArrowUp", 4), 1);
    assert.equal(logic.nextPosition(2, "Home", 4), 0);
    assert.equal(logic.nextPosition(0, "End", 4), 3);
    assert.equal(logic.nextPosition(0, "Enter", 4), null);
  });
});

describe("ScatterChart frame", () => {
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(ScatterChart, {
        title: "Accounts",
        xLabel: "Monthly revenue",
        yLabel: "Support tickets",
        data,
        ...props,
      }),
    );

  test("a titled frame with a group legend in first-appearance order and a Table toggle", () => {
    const html = render();
    assert.match(html, /<h3[^>]*>Accounts<\/h3>/);
    assert.ok(html.indexOf(">Enterprise<") < html.indexOf(">Pro<") && html.indexOf(">Pro<") < html.indexOf(">Starter<"));
    assert.match(html, /aria-expanded="false"[^>]*>.*Table/s);
  });

  test("one group: no legend; no rows: the frame empty state", () => {
    const single = render({ data: data.map(({ group, ...row }) => row) });
    assert.ok(!single.includes("legendSwatch") && !single.includes(">Pro<"));
    assert.ok(render({ data: [] }).includes("No data for this range"));
  });
});
