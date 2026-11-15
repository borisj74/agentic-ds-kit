/**
 * DoneCheck: agreed checks marked met / not met / unverified / checking, with proof. Logic,
 * SSR render through the CSS stub, one solid primary, sorting and the callbacks. Runs against
 * the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const mixed = [
  { id: "a", text: "Every SKU priced", status: "met", evidence: { href: "/runs/1", hrefLabel: "Sheet diff" } },
  { id: "b", text: "Totals match", status: "not_met", reason: "Garden is €412 under.", evidence: { output: "-412.00", outputLabel: "compare" } },
  { id: "c", text: "No big drops", status: "unverified" },
  { id: "d", text: "Tests pass", status: "met", setBy: "person" },
];
const allMet = mixed.map((c) => ({ ...c, status: "met" }));

let logic;
let React;
let renderToStaticMarkup;
let DoneCheck;
let Button;

before(async () => {
  logic = await import("../dist/ui/DoneCheck/doneCheck.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ DoneCheck } = await import("../dist/ui/DoneCheck/DoneCheck.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(DoneCheck, { title: "EU prices", criteria: mixed, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = DoneCheck({ title: "EU prices", criteria: mixed, ...props });
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
const handlers = { onOverride() {}, onRecheck() {}, onAccept() {}, onSendBack() {} };

describe("DoneCheck logic", () => {
  test("unverified never counts as met; verdict words", () => {
    assert.equal(logic.metCount(mixed), 2);
    assert.deepEqual(logic.verdict(mixed), { label: "2 of 4 met", tone: "danger" });
    assert.deepEqual(logic.verdict(allMet), { label: "All met", tone: "success" });
    assert.deepEqual(logic.verdict([{ id: "x", text: "", status: "unverified" }, allMet[0]]), { label: "Needs review", tone: "warning" });
    assert.equal(logic.allMet([]), false);
    assert.equal(logic.metPercent(mixed), 50);
  });

  test("not met sorts first, met last, stable within a status", () => {
    assert.deepEqual(logic.sortCriteria(mixed).map((c) => c.id), ["b", "c", "a", "d"]);
  });
});

describe("DoneCheck render", () => {
  test("a labelled Card with verdict, ordered rows, status words and evidence", () => {
    const html = render(handlers);
    assert.match(html, /<article[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>EU prices<\/h2>/s);
    for (const text of ["2 of 4 met", "Not met", "Unverified", "Met", "Agent says:", "Garden is €412 under.", "set by you", "Evidence for check 1", "Sheet diff"]) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /<ol/);
    assert.ok(html.indexOf("Totals match") < html.indexOf("Every SKU priced"), "not met first");
    assert.match(html, /aria-label="2 of 4 checks met"/);
  });

  test("Send back is the one solid primary until all are met; then Accept", () => {
    const html = render(handlers);
    assert.equal(solidPrimaries(html), 1);
    assert.ok(!html.includes("Accept result"));
    const done = render({ ...handlers, criteria: allMet });
    assert.equal(solidPrimaries(done), 1);
    assert.ok(done.includes("Accept result") && done.includes("All met"));
  });

  test("checking is aria-busy and disables that row; empty shows Empty", () => {
    const html = render({ ...handlers, criteria: [{ id: "a", text: "Every SKU priced", status: "checking" }] });
    assert.match(html, /aria-busy="true"/);
    assert.ok(render({ criteria: [] }).includes("No checks to mark"));
  });
});

describe("DoneCheck callbacks", () => {
  test("override, re-check and send back reach the props", () => {
    const calls = [];
    const node = tree({
      onOverride: (id, status) => calls.push(["override", id, status]),
      onRecheck: (id) => calls.push(["recheck", id]),
      onSendBack: () => calls.push(["back"]),
    });
    const buttons = findAll(node, Button);
    buttons.find((b) => b.props.children === "Mark met").props.onClick();
    buttons.find((b) => b.props.children === "Re-check").props.onClick();
    buttons.find((b) => b.props.children === "Send back to agent").props.onClick();
    assert.deepEqual(calls, [["override", "b", "met"], ["recheck", "b"], ["back"]]);
  });
});

describe("DoneCheck in the catalog (MCP)", () => {
  test("list_components returns it as an organism", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "donecheck");
    assert.equal(row?.name, "DoneCheck");
    assert.equal(row.level, "organism");
  });
});
