/**
 * LineChart reference line (which points are past it) and the dashed legend swatch; and
 * ComboChart stacked bars (diverging piles and their extent). The plots and the table draw after
 * the browser measures or the Table toggle opens, so SSR covers the frame and the logic the geometry. Runs against the
 * built kit (dist): build first (npm run build -w agentic-ds-kit).
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

let React;
let renderToStaticMarkup;
let LineChart;
let pastReference;
let combo;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ LineChart, pastReference } = await import("../dist/ui/LineChart/LineChart.js"));
  combo = await import("../dist/ui/ComboChart/comboChart.logic.js");
});

describe("LineChart referenceLine", () => {
  test("pastReference follows the highlight side and ignores bad input", () => {
    const above = { value: 10, label: "Goal", highlight: "above" };
    const below = { value: 10, label: "Floor", highlight: "below" };
    assert.equal(pastReference(11, above), true);
    assert.equal(pastReference(10, above), false);
    assert.equal(pastReference(9, below), true);
    assert.equal(pastReference(11, { value: 10, label: "No highlight" }), false);
    assert.equal(pastReference(Number.NaN, above), false);
    assert.equal(pastReference(undefined, above), false);
  });

  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(LineChart, {
        title: "Signups",
        labels: ["W1", "W2", "W3"],
        series: [
          { label: "This period", data: [310, 352, 298] },
          { label: "Previous period", data: [280, 300, 315], dashed: true },
        ],
        ...props,
      }),
    );

  test("dashed series gets the dashed legend swatch", () => {
    const html = render({});
    const swatches = [...html.matchAll(/<span class="([^"]*legendSwatch[^"]*)"[^>]*style="([^"]*)"/g)];
    assert.equal(swatches.length, 2);
    assert.match(swatches[1][1], /swatchDashed/);
    assert.match(swatches[1][2], /^color:/);
    assert.ok(!/swatchDashed/.test(swatches[0][1]));
  });
});

describe("ComboChart stacked", () => {
  const keys = ["added", "grown", "shrunk", "lost"];

  test("positives pile up and negatives pile down, in series order", () => {
    const segments = combo.stackSegments({ label: "Jan", added: 40, grown: 10, shrunk: -5, lost: -12 }, keys);
    assert.deepEqual(segments, [
      { start: 0, end: 40 },
      { start: 40, end: 50 },
      { start: 0, end: -5 },
      { start: -5, end: -17 },
    ]);
  });

  test("missing values take no room", () => {
    const segments = combo.stackSegments({ label: "Feb", added: 20, lost: -3 }, keys);
    assert.deepEqual(segments, [{ start: 0, end: 20 }, null, null, { start: 0, end: -3 }]);
  });

  test("extent spans the tallest piles either side of zero", () => {
    const data = [
      { label: "Jan", added: 40, grown: 10, shrunk: -5, lost: -12 },
      { label: "Feb", added: 60, lost: -30 },
    ];
    assert.deepEqual(combo.stackedExtentOf(data, keys), [-30, 60]);
    assert.deepEqual(combo.stackedExtentOf([{ label: "x" }], keys), [0, 1]);
  });
});
