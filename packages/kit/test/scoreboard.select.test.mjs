/**
 * Scorecard sparkline and plain look; Scoreboard selectable (radiogroup, roving tabindex, key map)
 * and divided. SSR through the CSS stub. Runs against the built kit (dist): build first
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

let React;
let renderToStaticMarkup;
let Scorecard;
let sparklinePoints;
let Scoreboard;
let scoreboardKeyTarget;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Scorecard, sparklinePoints } = await import("../dist/ui/Scorecard/Scorecard.js"));
  ({ Scoreboard, scoreboardKeyTarget } = await import("../dist/ui/Scoreboard/Scoreboard.js"));
});

const items = [
  { id: "seats", label: "Seats", value: "1,204" },
  { id: "trials", label: "Trials", value: "88" },
  { label: "Refunds", value: "6" },
];

const h = (type, props) => renderToStaticMarkup(React.createElement(type, props));

describe("Scorecard sparkline", () => {
  test("points span the box, high values near the top", () => {
    const pts = sparklinePoints([0, 10]).split(" ").map((p) => p.split(",").map(Number));
    assert.deepEqual(pts[0], [0, 23]);
    assert.deepEqual(pts[1], [100, 1]);
  });

  test("flat series sit in the middle; under two finite values gives null", () => {
    assert.equal(sparklinePoints([5, 5, 5]), "0,12 50,12 100,12");
    assert.equal(sparklinePoints([5, Number.NaN]), null);
    assert.equal(sparklinePoints(undefined), null);
  });

  test("renders an aria-hidden svg only with enough data", () => {
    assert.match(h(Scorecard, { label: "Seats", value: "1", sparkline: [1, 2, 3] }), /<svg[^>]*aria-hidden="true"[^>]*><polyline/);
    assert.ok(!h(Scorecard, { label: "Seats", value: "1", sparkline: [1] }).includes("<svg"));
  });

  test("radio selection role swaps aria-pressed for role radio", () => {
    const html = h(Scorecard, { label: "Seats", value: "1", onClick() {}, selected: true, selectionRole: "radio" });
    assert.match(html, /role="radio"/);
    assert.match(html, /aria-checked="true"/);
    assert.ok(!html.includes("aria-pressed"));
    assert.match(h(Scorecard, { label: "Seats", value: "1", onClick() {}, selected: false }), /aria-pressed="false"/);
  });
});

describe("Scoreboard selectable", () => {
  test("radiogroup with the first item checked by default and one tab stop", () => {
    const html = h(Scoreboard, { items, selectable: true, "aria-label": "Chart metric" });
    assert.match(html, /role="radiogroup" aria-label="Chart metric"/);
    const radios = [...html.matchAll(/<button[^>]*role="radio"[^>]*>/g)].map((m) => m[0]);
    assert.equal(radios.length, 3);
    assert.match(radios[0], /aria-checked="true"/);
    assert.match(radios[0], /tabindex="0"/);
    assert.match(radios[1], /aria-checked="false"/);
    assert.match(radios[1], /tabindex="-1"/);
    assert.ok(!radios.some((r) => /\sid="/.test(r)), "item id is not put on the DOM");
  });

  test("value picks by id, then by label", () => {
    const byId = h(Scoreboard, { items, selectable: true, value: "trials" });
    const byLabel = h(Scoreboard, { items, selectable: true, value: "Refunds" });
    const checkedName = (html) => html.match(/aria-checked="true"[^>]*>[\s\S]*?class="[^"]*label[^"]*">([^<]+)</)?.[1];
    assert.equal(checkedName(byId), "Trials");
    assert.equal(checkedName(byLabel), "Refunds");
  });

  test("key map wraps and jumps", () => {
    assert.equal(scoreboardKeyTarget("ArrowRight", 2, 3), 0);
    assert.equal(scoreboardKeyTarget("ArrowLeft", 0, 3), 2);
    assert.equal(scoreboardKeyTarget("ArrowDown", 0, 3), 1);
    assert.equal(scoreboardKeyTarget("Home", 2, 3), 0);
    assert.equal(scoreboardKeyTarget("End", 0, 3), 2);
    assert.equal(scoreboardKeyTarget("Enter", 0, 3), null);
  });

  test("not selectable keeps articles and item ids", () => {
    const html = h(Scoreboard, { items });
    assert.ok(!html.includes("radiogroup"));
    assert.match(html, /<article[^>]*id="seats"/);
  });
});
