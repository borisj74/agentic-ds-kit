/**
 * AssumptionLog: guesses the agent made without asking. Logic, SSR render through the CSS stub,
 * filter, corrected rows, compact, and the callbacks. Runs against the built kit (dist): build
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

const items = [
  { id: "vat", text: "Prices exclude VAT", confidence: 0.64, source: "earlier chat", steps: ["Convert", "Write"], status: "open" },
  { id: "cur", text: "Prices are in EUR", confidence: 0.42, source: "default", steps: ["Read", "Convert", "Write"], status: "open" },
  { id: "round", text: "Round to .99", confidence: 0.81, status: "confirmed" },
  { id: "tax", text: "No tax on samples", confidence: 0.5, steps: ["Write"], status: "corrected", correction: "Samples are taxed" },
];

let logic;
let React;
let renderToStaticMarkup;
let AssumptionLog;
let Button;
let SegmentedControl;

before(async () => {
  logic = await import("../dist/ui/AssumptionLog/assumptionLog.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AssumptionLog } = await import("../dist/ui/AssumptionLog/AssumptionLog.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ SegmentedControl } = await import("../dist/ui/SegmentedControl/SegmentedControl.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(AssumptionLog, { items, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = AssumptionLog({ items, ...props });
      return out;
    }),
  );
  return out;
}

function findAll(node, type, hits = []) {
  if (!node || typeof node !== "object") return hits;
  if (Array.isArray(node)) {
    for (const child of node) findAll(child, type, hits);
    return hits;
  }
  if (node.type === type) hits.push(node);
  findAll(node.props?.children, type, hits);
  return hits;
}

describe("AssumptionLog logic", () => {
  test("confidence words and open count", () => {
    assert.equal(logic.confidenceLevel(0.42), "low");
    assert.equal(logic.confidenceLevel(0.5), "medium");
    assert.equal(logic.confidenceLevel(0.8), "high");
    assert.equal(logic.openCount(items), 2);
  });

  test("open rows weakest first, then the rest in order; weakest open", () => {
    assert.deepEqual(logic.sortAssumptions(items).map((a) => a.id), ["cur", "vat", "round", "tax"]);
    assert.equal(logic.weakestOpen(items).id, "cur");
    assert.deepEqual(logic.filterAssumptions(items, "corrected").map((a) => a.id), ["tax"]);
  });
});

describe("AssumptionLog render", () => {
  test("a labelled Card with count, filter, confidence words, source and steps", () => {
    const html = render({ onConfirm() {}, onCorrect() {} });
    assert.match(html, /<article[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Assumptions<\/h2>/s);
    for (const text of ["2 open", "Show assumptions", "Low", "Medium", "default", "earlier chat", "used in 3 steps", "Confirm", "Correct"]) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /aria-label="Confidence 42%, Low"/);
    assert.ok(html.indexOf("Prices are in EUR") < html.indexOf("Prices exclude VAT"), "weakest first");
    assert.ok(!html.includes("Round to .99"), "open filter by default");
  });

  test("all shows corrected rows struck through with the redo count", () => {
    const html = render({ filter: "all" });
    assert.match(html, /<del[^>]*>.*No tax on samples<\/del>/s);
    assert.match(html, /<ins[^>]*>.*Samples are taxed<\/ins>/s);
    assert.ok(html.includes("agent will redo 1 step"));
    assert.ok(html.includes("Confirmed"));
  });

  test("empty filter shows Empty; compact is one line with the weakest", () => {
    assert.ok(render({ filter: "open", items: [items[2]] }).includes("Nothing left to check"));
    const html = render({ compact: true });
    assert.match(html, /<section[^>]*aria-label="Assumptions"/);
    assert.ok(html.includes("2 open") && html.includes("Weakest:") && html.includes("Prices are in EUR"));
    assert.ok(!html.includes("<article"));
  });
});

describe("AssumptionLog callbacks", () => {
  test("confirm and filter changes reach the props", () => {
    const calls = [];
    const node = tree({ onConfirm: (id) => calls.push(["confirm", id]), onCorrect() {}, onFilterChange: (f) => calls.push(["filter", f]) });
    findAll(node, Button).find((b) => b.props.children === "Confirm").props.onClick();
    findAll(node, SegmentedControl)[0].props.onChange("all");
    assert.deepEqual(calls, [["confirm", "cur"], ["filter", "all"]]);
  });
});

describe("AssumptionLog in the catalog (MCP)", () => {
  test("list_components returns it as an organism", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "assumptionlog");
    assert.equal(row?.name, "AssumptionLog");
    assert.equal(row.level, "organism");
  });
});
