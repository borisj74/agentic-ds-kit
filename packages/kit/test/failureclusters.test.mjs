/**
 * FailureClusters: failed runs grouped by likely cause. Logic (sorting, filters, trend words),
 * SSR render through the CSS stub, the listbox, the selected cluster, one solid primary and the
 * catalog. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const sample = { name: "stripe.refunds.create", error: "429 Too Many Requests" };
const runs = [{ id: "r1", label: "run_1", href: "#r1", agent: "Billing agent", when: "21:48", step: "stripe.refunds.create" }];
const clusters = [
  { id: "small", title: "SMTP 550", status: "known", count: 6, agents: [{ name: "Email agent" }], trend: [1, 1], firstSeen: "Sep 2", lastSeen: "2 h ago", sample, runs: [] },
  { id: "big", title: "Stripe 429 rate limit", status: "new", count: 42, agents: [{ name: "Billing agent" }, { name: "Support agent" }], trend: [2, 6, 18], firstSeen: "06:12", lastSeen: "4 min ago", sample, runs },
  { id: "back", title: "Sheets token expired", status: "regressed", count: 19, agents: [{ name: "Data sync agent" }], trend: [0, 9], firstSeen: "Last week", lastSeen: "9 min ago", sample, runs: [] },
];

let logic;
let React;
let renderToStaticMarkup;
let FailureClusters;
let Button;

before(async () => {
  logic = await import("../dist/ui/FailureClusters/failureClusters.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ FailureClusters } = await import("../dist/ui/FailureClusters/FailureClusters.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(FailureClusters, { clusters, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = FailureClusters({ clusters, ...props });
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
  if (typeof node.type === "function" && node.props?.cluster) findAll(node.type(node.props), type, hits);
  findAll(node.props?.children, type, hits);
  return hits;
}

const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;
const handlers = { onMarkKnown() {}, onMute() {}, onOpenIssue() {} };

describe("FailureClusters logic", () => {
  test("largest first; filters by status and agent", () => {
    assert.deepEqual(logic.sortClusters(clusters).map((c) => c.id), ["big", "back", "small"]);
    assert.deepEqual(logic.filterClusters(clusters, { status: "regressed" }).map((c) => c.id), ["back"]);
    assert.deepEqual(logic.filterClusters(clusters, { agent: "Support agent" }).map((c) => c.id), ["big"]);
  });

  test("trend in words", () => {
    assert.deepEqual(logic.trendWords([2, 6, 18]), { direction: "up", text: "12 more than the previous period" });
    assert.deepEqual(logic.trendWords([0, 9]), { direction: "new", text: "New this period" });
    assert.deepEqual(logic.trendWords([10, 6]), { direction: "down", text: "4 fewer than the previous period" });
    assert.deepEqual(logic.trendWords([10, 10]), { direction: "flat", text: "Same as the previous period" });
    assert.equal(logic.listWords(["Billing agent", "Support agent", "Email agent"]), "Billing agent, Support agent and Email agent");
    assert.deepEqual(logic.trendWords([1, 0]), { direction: "down", text: "None this period" });
  });
});

describe("FailureClusters render", () => {
  test("a labelled section with a listbox, largest first, statuses and trends in words", () => {
    const html = render({ ...handlers, filters: { time: "Last 24 hours" } });
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Failures<\/h2>/s);
    assert.ok(html.includes("67 failed runs in 3 causes · last 24 hours"));
    assert.match(html, /role="listbox"/);
    assert.match(html, /role="option" aria-selected="true" tabindex="0"/);
    for (const text of ["New", "Regressed", "Known", "12 more than the previous period", "New this period", "42 failed runs", "Filter failures"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(html.indexOf("Stripe 429 rate limit") < html.indexOf("SMTP 550"), "largest first");
  });

  test("the selected cluster shows seen times, chart, sample call, runs and one solid primary", () => {
    const html = render(handlers);
    for (const text of ["First seen 06:12", "Last seen 4 min ago", "Failures over time", "Sample failing call", "stripe.refunds.create", "429 Too Many Requests", "Recent runs", "run_1", "Open issue", "Mark known", "Mute 24h"]) {
      assert.ok(html.includes(text), text);
    }
    assert.equal(solidPrimaries(html), 1);
    assert.ok(html.includes("Billing agent and Support agent"), "agents are named as text");
    assert.ok(html.indexOf("Recent runs") < html.indexOf("Open issue"), "actions follow the evidence");
  });

  test("filtered to nothing shows Empty", () => {
    assert.ok(render({ filters: { agent: "Nobody" } }).includes("No failures in this window"));
  });
});

describe("FailureClusters callbacks", () => {
  test("actions reach the props for the selected cluster", () => {
    const calls = [];
    const node = tree({ selectedId: "back", onMarkKnown: (id) => calls.push(["known", id]), onMute: (id) => calls.push(["mute", id]), onOpenIssue: (id) => calls.push(["issue", id]) });
    const buttons = findAll(node, Button);
    buttons.find((b) => b.props.children === "Mark known").props.onClick();
    buttons.find((b) => b.props.children === "Mute 24h").props.onClick();
    buttons.find((b) => b.props.children === "Open issue").props.onClick();
    assert.deepEqual(calls, [["known", "back"], ["mute", "back"], ["issue", "back"]]);
  });
});

describe("FailureClusters in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "failureclusters");
    assert.equal(row?.name, "FailureClusters");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
