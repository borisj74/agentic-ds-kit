/**
 * GuardrailLog: rules that stepped in on agents by themselves. Logic, SSR render through the CSS
 * stub, filters, compact, the Drawer and the override callbacks. Runs against the built kit
 * (dist): build first (npm run build -w agentic-ds-kit).
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

const refunds = { name: "No refunds over €500", text: "Refunds above €500 need a finance lead.", owner: "Finance ops" };
const tone = { name: "Plain replies", text: "No promised dates.", owner: "Support leads" };
const events = [
  { id: "e1", verdict: "blocked", rule: refunds, agent: { name: "Billing agent" }, attempted: "refund(740)", at: "14:02", runHref: "#r1" },
  { id: "e2", verdict: "rewritten", rule: tone, agent: { name: "Email agent" }, attempted: "Fixed by Friday", sentInstead: "We'll email you", at: "13:47" },
  { id: "e3", verdict: "flagged", rule: tone, agent: { name: "Email agent" }, attempted: "send()", at: "11:20" },
];

let logic;
let React;
let renderToStaticMarkup;
let GuardrailLog;
let Drawer;
let FilterBar;

before(async () => {
  logic = await import("../dist/ui/GuardrailLog/guardrailLog.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ GuardrailLog } = await import("../dist/ui/GuardrailLog/GuardrailLog.js"));
  ({ Drawer } = await import("../dist/ui/Drawer/Drawer.js"));
  ({ FilterBar } = await import("../dist/ui/FilterBar/FilterBar.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(GuardrailLog, { events, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = GuardrailLog({ events, ...props });
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
  findAll(node.props?.footer, type, hits);
  return hits;
}

describe("GuardrailLog logic", () => {
  test("summary counts verdicts and names the window", () => {
    assert.equal(logic.summaryLine(events, "This week"), "1 blocked · 1 rewritten · 1 flagged this week");
    assert.equal(logic.summaryLine([]), "No rule fired");
  });

  test("filters by verdict, rule and agent; distinct names", () => {
    assert.deepEqual(logic.filterEvents(events, { agent: "Email agent" }).map((e) => e.id), ["e2", "e3"]);
    assert.deepEqual(logic.filterEvents(events, { verdict: "blocked" }).map((e) => e.id), ["e1"]);
    assert.deepEqual(logic.ruleNames(events), ["No refunds over €500", "Plain replies"]);
  });
});

describe("GuardrailLog render", () => {
  test("a labelled section with summary, filters and rows in words", () => {
    const html = render({ filters: { time: "This week" } });
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Guardrails<\/h2>/s);
    for (const text of ["1 blocked · 1 rewritten · 1 flagged this week", "Blocked", "Rewritten", "Flagged", "No refunds over €500", "refund(740)", "Billing agent", "14:02"]) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /aria-label="Filter rule events"/);
    assert.match(html, /aria-haspopup="dialog"/);
  });

  test("filtered to nothing shows Empty; compact is one line", () => {
    assert.ok(render({ filters: { agent: "Nobody" } }).includes("No rule has fired in this window"));
    const html = render({ compact: true, filters: { time: "This week" } });
    assert.match(html, /<section[^>]*aria-label="Guardrails"/);
    assert.ok(html.includes("No refunds over €500 · Billing agent · 14:02"));
    assert.ok(!html.includes("Filter rule events"));
  });

  test("the selected event opens the Drawer with attempt, rewrite, rule and override", () => {
    const node = tree({ selectedId: "e2", onRequestOverride() {} });
    const drawer = findAll(node, Drawer)[0];
    assert.equal(drawer.props.open, true);
    assert.equal(drawer.props.title, "Plain replies");
    const html = renderToStaticMarkup(React.createElement("div", null, drawer.props.children));
    for (const text of ["What the agent tried", "What ran instead", "We&#x27;ll email you", "Owner: Support leads", "Why should this run anyway?"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(findAll(node, Drawer)[0].props.footer, "Submit request in the footer");
  });

  test("override sent and error states", () => {
    const sent = renderToStaticMarkup(React.createElement("div", null, findAll(tree({ selectedId: "e1", onRequestOverride() {}, overrideStatus: "sent" }), Drawer)[0].props.children));
    assert.ok(sent.includes("Request sent to Finance ops"));
    const err = renderToStaticMarkup(React.createElement("div", null, findAll(tree({ selectedId: "e1", onRequestOverride() {}, overrideStatus: "error" }), Drawer)[0].props.children));
    assert.ok(err.includes("Couldn&#x27;t send the request"));
  });
});

describe("GuardrailLog callbacks", () => {
  test("clear filters and close the Drawer reach the props", () => {
    const calls = [];
    const node = tree({ filters: { verdict: "blocked" }, selectedId: "e1", onFiltersChange: (f) => calls.push(["filters", f]), onSelect: (id) => calls.push(["select", id]) });
    findAll(node, FilterBar)[0].props.onClear();
    findAll(node, Drawer)[0].props.onClose();
    assert.deepEqual(calls, [["filters", {}], ["select", null]]);
  });
});

describe("GuardrailLog in the catalog (MCP)", () => {
  test("list_components returns it as an organism", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "guardraillog");
    assert.equal(row?.name, "GuardrailLog");
    assert.equal(row.level, "organism");
  });
});
