/**
 * Heatmap: a rows × columns grid shaded by value. Logic (cell map, levels, keyboard moves) and the
 * SSR render through the CSS stub (grid roles, labels, one Tab stop, legend, table, empty).
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const rows = ["Mon", "Tue"];
const columns = ["09", "10", "11"];
const data = [
  { row: "Mon", column: "09", value: 40 },
  { row: "Mon", column: "10", value: 10 },
  { row: "Mon", column: "11", value: 0 },
  { row: "Tue", column: "09", value: 25 },
  { row: "Wed", column: "09", value: 999 },
  { row: "Tue", column: "12", value: 999 },
];

let logic;
let React;
let renderToStaticMarkup;
let Heatmap;

before(async () => {
  logic = await import("../dist/ui/Heatmap/heatmap.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Heatmap } = await import("../dist/ui/Heatmap/Heatmap.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(Heatmap, { rows, columns, data, title: "Runs by hour", ...props }));
}

describe("Heatmap logic", () => {
  test("cell map drops unknown rows and columns; the largest value ignores them", () => {
    const cells = logic.cellMap(rows, columns, data);
    assert.equal(cells.size, 4);
    assert.equal(cells.get(logic.cellKey("Mon", "09")), 40);
    assert.equal(logic.maxValue(cells), 40);
  });

  test("levels: 0 for zero, empty, negative or NaN; then four equal shares of the largest value", () => {
    assert.equal(logic.levelOf(undefined, 40), 0);
    assert.equal(logic.levelOf(0, 40), 0);
    assert.equal(logic.levelOf(-3, 40), 0);
    assert.equal(logic.levelOf(Number.NaN, 40), 0);
    assert.equal(logic.levelOf(1, 40), 1);
    assert.equal(logic.levelOf(10, 40), 1);
    assert.equal(logic.levelOf(11, 40), 2);
    assert.equal(logic.levelOf(30, 40), 3);
    assert.equal(logic.levelOf(40, 40), 4);
    assert.equal(logic.levelOf(5, 0), 0);
  });

  test("arrow keys, Home and End move within the grid and stop at its edges", () => {
    const size = { rows: 2, columns: 3 };
    assert.deepEqual(logic.moveFocus({ row: 0, column: 0 }, "ArrowRight", size), { row: 0, column: 1 });
    assert.deepEqual(logic.moveFocus({ row: 0, column: 0 }, "ArrowLeft", size), { row: 0, column: 0 });
    assert.deepEqual(logic.moveFocus({ row: 0, column: 2 }, "ArrowDown", size), { row: 1, column: 2 });
    assert.deepEqual(logic.moveFocus({ row: 1, column: 2 }, "ArrowDown", size), { row: 1, column: 2 });
    assert.deepEqual(logic.moveFocus({ row: 1, column: 1 }, "Home", size), { row: 1, column: 0 });
    assert.deepEqual(logic.moveFocus({ row: 0, column: 1 }, "End", size), { row: 0, column: 2 });
    assert.deepEqual(logic.moveFocus({ row: 1, column: 1 }, "Home", size, true), { row: 0, column: 0 });
    assert.deepEqual(logic.moveFocus({ row: 0, column: 0 }, "End", size, true), { row: 1, column: 2 });
    assert.equal(logic.moveFocus({ row: 0, column: 0 }, "Enter", size), null);
  });
});

describe("Heatmap render", () => {
  test("a named grid with column and row headers and one labelled cell per row × column", () => {
    const html = render();
    assert.match(html, /role="grid" aria-label="Runs by hour"/);
    assert.equal((html.match(/role="columnheader"/g) ?? []).length, columns.length + 1);
    assert.equal((html.match(/role="rowheader"/g) ?? []).length, rows.length);
    assert.equal((html.match(/role="gridcell"/g) ?? []).length, rows.length * columns.length);
    for (const label of ["Mon, 09: 40", "Mon, 10: 10", "Mon, 11: 0", "Tue, 09: 25", "Tue, 10: No data", "Tue, 11: No data"]) {
      assert.ok(html.includes(`aria-label="${label}"`), label);
    }
  });

  test("the grid is one Tab stop: only the first cell has tabindex 0", () => {
    const html = render();
    assert.equal((html.match(/tabindex="0"/gi) ?? []).length, 1);
    assert.match(html, /data-cell="0-0" tabindex="0"/i);
  });

  test("legend runs from zero to the largest value through valueFormatter, with a text cue", () => {
    const html = render({ valueFormatter: (v) => `${v} runs` });
    assert.ok(html.includes("0 runs"));
    assert.ok(html.includes("40 runs"));
    assert.ok(html.includes("Lighter cells are lower, darker cells are higher."));
    assert.ok(html.includes('aria-label="Mon, 09: 40 runs"'));
  });

  test("a Table toggle is offered; empty data shows the frame empty state instead of the grid", () => {
    assert.match(render(), /aria-expanded="false"[^>]*>.*Table/s);
    const empty = render({ data: [] });
    assert.ok(empty.includes("No data for this range"));
    assert.ok(!empty.includes('role="grid"'));
  });
});
