/**
 * EvalSuite: a candidate agent version against the baseline on fixed cases. Logic (regressions,
 * sorting, line diff), SSR render through the CSS stub, the Promote gate, running and error
 * states, the case Drawer and the catalog. Runs against the built kit (dist): build first.
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

const pass = (output = "ok") => ({ result: "pass", output, score: 0.9, cost: 0.01 });
const fail = (output = "bad") => ({ result: "fail", output, score: 0.4, cost: 0.012 });
const cases = [
  { id: "a", name: "Same", tags: ["billing"], dataset: "refunds", input: "in", baseline: pass(), candidate: pass() },
  { id: "b", name: "Better", tags: ["orders"], dataset: "shipping", input: "in", baseline: fail(), candidate: pass() },
  { id: "c", name: "Broke", tags: ["billing"], dataset: "refunds", input: "in", baseline: pass("Hi\nfixed soon\nBye"), candidate: fail("Hi\nfixed by Friday\nBye"), graderNote: "Promises a date." },
  { id: "d", name: "Errored", input: "in", baseline: pass(), candidate: { result: "error", output: "ToolError" } },
];
const baseline = { label: "v12", metrics: { passRate: 0.75, avgCost: 0.0105, p50LatencyMs: 2100 } };
const candidate = { label: "v13", metrics: { passRate: 0.5, avgCost: 0.011, p50LatencyMs: 1700 } };

let logic;
let React;
let renderToStaticMarkup;
let EvalSuite;
let Button;
let Drawer;
let DataTable;

before(async () => {
  logic = await import("../dist/ui/EvalSuite/evalSuite.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ EvalSuite } = await import("../dist/ui/EvalSuite/EvalSuite.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ Drawer } = await import("../dist/ui/Drawer/Drawer.js"));
  ({ DataTable } = await import("../dist/ui/DataTable/DataTable.js"));
});

const base = { baseline, candidate, cases };

function render(props) {
  return renderToStaticMarkup(React.createElement(EvalSuite, { ...base, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = EvalSuite({ ...base, ...props });
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

const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;

describe("EvalSuite logic", () => {
  test("regressions, improvements and review state", () => {
    assert.deepEqual(logic.regressions(cases).map((c) => c.id), ["c", "d"]);
    assert.equal(logic.isImprovement(cases[1]), true);
    assert.deepEqual(logic.unreviewedRegressions([{ ...cases[2], accepted: true }, cases[3]]).map((c) => c.id), ["d"]);
  });

  test("regressions first, then errors, improvements, rest; views and filters", () => {
    assert.deepEqual(logic.sortCases(cases).map((c) => c.id), ["c", "d", "b", "a"]);
    assert.deepEqual(logic.viewCases(cases, "improvements").map((c) => c.id), ["b"]);
    assert.deepEqual(logic.viewCases(cases, "all", { tag: "billing" }).map((c) => c.id), ["c", "a"]);
  });

  test("line diff keeps shared lines as context", () => {
    const lines = logic.lineDiff("Hi\nfixed soon\nBye", "Hi\nfixed by Friday\nBye");
    assert.deepEqual(lines.map((l) => l.type), ["context", "remove", "add", "context"]);
    assert.equal(logic.signed(-0.5, 1), "−0.5");
    assert.equal(logic.percent(0.875), "87.5%");
    assert.equal(logic.signedMoney(0.004), "+$0.004");
    assert.equal(logic.signedMoney(-0.002), "−$0.002");
    assert.equal(logic.ms(1800), "1.8 s");
    assert.equal(logic.reviewState(cases[2]), "review");
    assert.equal(logic.reviewState({ ...cases[2], flagged: true }), "flagged");
    assert.equal(logic.reviewState(cases[0]), null);
  });
});

describe("EvalSuite render", () => {
  test("a labelled section with versions, metrics, view, filters and the cases table", () => {
    const html = render({ onPromote() {}, onRerun() {} });
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Eval run<\/h2>/s);
    for (const text of ["v12 baseline · v13 candidate · 4 cases", "Pass rate", "50%", "Average cost per case", "p50 latency", "1.7 s", "Regressions 2", "Improvements 1", "All 4", "Worse · −25.0 pts", "Better · −19%", "vs v12 75%", "Score change", "−0.50 of 1", "+$0.002", "To review", "Show cases", "Filter cases", "Details for Broke"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes("Details for Same"), "regressions view hides unchanged cases");
    assert.ok(!html.includes(">Tags<"), "tags are a filter, not a default column");
  });

  test("Promote is the one solid primary, disabled with a reason while regressions are unreviewed", () => {
    const html = render({ onPromote() {}, onRerun() {} });
    assert.equal(solidPrimaries(html), 1);
    assert.ok(html.includes("2 cases that passed in v12 don&#x27;t pass in v13. Accept the new output or flag each one to promote."));
    const promote = findAll(tree({ onPromote() {} }), Button).find((b) => b.props.children === "Promote v13");
    assert.equal(promote.props.disabled, true);
    assert.ok(promote.props["aria-describedby"]);
    const reviewed = cases.map((c) => (logic.isRegression(c) ? { ...c, flagged: true } : c));
    const ready = findAll(tree({ cases: reviewed, onPromote() {} }), Button).find((b) => b.props.children === "Promote v13");
    assert.equal(ready.props.disabled, false);
  });

  test("running shows progress and is busy; error shows the Alert", () => {
    const html = render({ status: "running", progress: 0.5 });
    assert.match(html, /aria-busy="true"/);
    assert.ok(html.includes("Running 2 of 4 cases"));
    assert.ok(render({ status: "error", errorMessage: "Provider timed out." }).includes("Provider timed out."));
  });

  test("rows open a Drawer through their Open action", () => {
    const node = tree({ onAcceptExpected() {}, onFlag() {} });
    const table = findAll(node, DataTable)[0];
    assert.deepEqual(table.props.rows.map((r) => r.id), ["c", "d"]);
    assert.equal(table.props.rows[0].open.type, "actions");
    assert.equal(findAll(node, Drawer)[0].props.open, false);
  });
});

describe("EvalSuite in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "evalsuite");
    assert.equal(row?.name, "EvalSuite");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
