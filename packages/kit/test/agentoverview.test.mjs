/**
 * AgentOverview: agent status (icon plus word), Needs you, the All agents rows and filter, the
 * Since rail and the Timeline view. Runs against the built kit (dist):
 * build first (npm run build -w agentic-ds-kit). CSS imports are stubbed so the block renders
 * on the server with react-dom/server.
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

const MINUTE = 60_000;
const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
const SINCE = NOW - 2 * 60 * MINUTE;

const agents = [
  { id: "plan", name: "Planner" },
  { id: "code", name: "Coder" },
  { id: "test", name: "Tester" },
  { id: "docs", name: "Docs writer" },
];

const events = [
  { id: "e1", agentId: "plan", title: "Split the billing epic", status: "done", start: NOW - 100 * MINUTE, end: NOW - 80 * MINUTE },
  { id: "e2", agentId: "code", title: "Refactor invoice totals", status: "running", start: NOW - 20 * MINUTE },
  {
    id: "e3",
    agentId: "code",
    title: "Run migration",
    status: "waiting",
    ask: "Run 0042_drop_legacy.sql on staging?",
    start: NOW - 6 * MINUTE,
    action: { kind: "command", command: "npm run migrate -- --env staging" },
    risk: "high",
  },
  { id: "e4", agentId: "docs", title: "Publish changelog", status: "waiting", ask: "Publish the 0.19 changelog?", start: NOW - 4 * MINUTE },
  { id: "e5", agentId: "test", title: "E2E checkout suite", status: "failed", start: NOW - 30 * MINUTE, end: NOW - 25 * MINUTE, summary: ["3 of 48 specs failed"] },
  { id: "old", agentId: "test", title: "Old run", status: "done", start: NOW - 300 * MINUTE, end: NOW - 290 * MINUTE },
];

let logic;
let React;
let renderToStaticMarkup;
let AgentOverview;
let toAgentStatus;

before(async () => {
  logic = await import("../dist/ui/AgentOverview/agentOverview.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AgentOverview } = await import("../dist/ui/AgentOverview/AgentOverview.js"));
  ({ toAgentStatus } = await import("../dist/ui/shared/agentStatus.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(AgentOverview, { agents, events, since: SINCE, now: NOW, ...props }));
}

describe("AgentOverview status and filter", () => {
  test("agent status comes from the agent, else its latest event, else queued", () => {
    assert.equal(logic.statusOf({ id: "x", name: "X", status: "waiting" }, events), "needs-you");
    assert.equal(logic.statusOf({ id: "x", name: "X", status: "idle" }, events), "queued");
    assert.equal(logic.statusOf(agents[1], events), "needs-you");
    assert.equal(logic.statusOf(agents[2], events), "failed");
    assert.equal(logic.statusOf({ id: "none", name: "None" }, events), "queued");
  });

  test("filter counts are per agent", () => {
    assert.deepEqual(logic.filterCounts(agents, events), { all: 4, running: 0, "needs-you": 2, failed: 1 });
  });

  test("rows: status word plus one fact, one action from the status", () => {
    const withNow = [...agents, { id: "run", name: "Runner", status: "running", now: "Step 3 of 5", cost: "$0.42" }];
    const rows = logic.rowsFor(withNow, events, "all", "code", { review: true, ask: true });
    const by = Object.fromEntries(rows.map((row) => [row.item.id, row]));
    assert.equal(by.code.item.secondary, "Needs you · Waiting on you · request above");
    assert.equal(by.code.item.primaryAction, undefined);
    assert.equal(by.test.item.primaryAction.label, "Review");
    assert.equal(by.test.item.primaryAction.actionLabel, "Review Tester");
    assert.equal(by.run.item.primaryAction.label, "Ask");
    assert.equal(by.run.item.secondary, "Running · Step 3 of 5");
    assert.equal(by.run.item.meta, "$0.42");
    assert.equal(by.plan.item.primaryAction, undefined);
    assert.deepEqual(
      logic.rowsFor(agents, events, "failed", undefined, { review: true, ask: true }).map((row) => row.item.id),
      ["test"],
    );
    // No handler, no button.
    assert.equal(logic.rowsFor(agents, events, "failed", undefined, { review: false, ask: false })[0].item.primaryAction, undefined);
  });

  test("requests: open waiting events, oldest first", () => {
    assert.deepEqual(logic.requestsFor(events).map((e) => e.id), ["e3", "e4"]);
  });

  test("total spent only when every agent has a dollar cost", () => {
    assert.equal(logic.totalSpent([{ id: "a", name: "A", cost: "$0.18" }, { id: "b", name: "B", cost: "$0.82" }]), "$1.00 spent");
    assert.equal(logic.totalSpent([{ id: "a", name: "A", cost: "$0.18" }, { id: "b", name: "B" }]), undefined);
  });

  test("the Since rail lists events since the last visit, newest first, with status words", () => {
    const rail = logic.railFor(agents, events, SINCE, NOW);
    assert.ok(!rail.some((e) => e.id === "old"));
    assert.equal(rail[0].id, "e4");
    assert.deepEqual(rail.find((e) => e.id === "e5").status, { label: "Failed", tone: "danger" });
    assert.equal(rail.find((e) => e.id === "e3").object, "Run 0042_drop_legacy.sql on staging?");
  });

  test("toAgentStatus maps the older words", () => {
    for (const [from, to] of [["waiting", "needs-you"], ["approval", "needs-you"], ["idle", "queued"], ["pending", "queued"], ["done", "done"]]) {
      assert.equal(toAgentStatus(from), to);
    }
  });
});

describe("AgentOverview rendered", () => {
  test("one filter radio group with counts in the names", () => {
    const html = render();
    assert.match(html, /role="radiogroup"[^>]*aria-label="Show agents"/);
    for (const label of ["All 4", "Running 0", "Needs you 2", "Failed 1"]) assert.ok(html.includes(label), label);
  });

  test("Needs you: one ApprovalCard for the oldest request, the rest counted, announced politely", () => {
    const html = render();
    assert.ok(html.includes("Coder asks"));
    assert.ok(html.includes("Run 0042_drop_legacy.sql on staging?"));
    assert.equal((html.match(/<span>Approve<\/span>/g) ?? []).length, 1, "the second request is counted, not shown as a card");
    assert.ok(html.includes("1 more request waiting"));
    assert.match(html, /aria-live="polite"[^>]*>2 requests need you/);
  });

  test("status is an icon plus the word; one solid primary", () => {
    const html = render({ onReview: () => {} });
    assert.ok(html.includes('aria-label="Tester, Failed"'), "the word is in the row name");
    assert.ok(html.includes(">Failed<"), "and visible");
    assert.ok(html.includes(">Review<"));
    assert.ok(html.includes(">Review Tester<"), "the button is named for its agent");
    assert.ok(!html.includes(">Ask<"), "no running agent, no Ask");
  });

  test("the filter narrows the list", () => {
    const failed = render({ filter: "failed" });
    assert.ok(failed.includes('aria-label="Tester, Failed"'));
    assert.ok(!failed.includes('aria-label="Planner'));
  });

  test("Timeline view renders the lanes; list stays for narrow blocks", () => {
    const html = render({ defaultView: "timeline" });
    assert.ok(html.includes("E2E checkout suite"));
    assert.match(html, /aria-label="View"/);
  });

  test("New task shows only with onNewTask", () => {
    assert.ok(!render().includes("New task"));
    assert.ok(render({ onNewTask: () => {} }).includes("New task"));
  });
});

describe("AgentOverview in the catalog (MCP)", () => {
  test("list_components and get_component return it as a block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "agentoverview");
    assert.equal(row?.name, "AgentOverview");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
    assert.ok(row.block.summary.length > 0);
    assert.equal(listComponents().components.find((item) => item.id === "button").kind, "component");
    const { component } = getComponent("AgentOverview");
    assert.equal(component.kind, "block");
    assert.equal(component.import, 'import { AgentOverview } from "agentic-ds-kit";');
    assert.deepEqual(component.variants.find((v) => v.prop === "filter").values, ["all", "running", "needs-you", "failed"]);
  });
});
