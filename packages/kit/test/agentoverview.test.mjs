/**
 * AgentOverview: the one filter drives all three areas (summary activity, lanes, inbox), and the
 * approve / reject / retry callbacks reach the block's props. Runs against the built kit (dist):
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

before(async () => {
  logic = await import("../dist/ui/AgentOverview/agentOverview.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AgentOverview } = await import("../dist/ui/AgentOverview/AgentOverview.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(AgentOverview, { agents, events, since: SINCE, now: NOW, ...props }));
}

describe("AgentOverview filter", () => {
  test("counts cover what was active since the last visit", () => {
    assert.deepEqual(logic.summaryCounts(events, SINCE, NOW), { done: 1, needsYou: 2, failed: 1 });
    assert.deepEqual(logic.filterCounts(events, SINCE, NOW), { all: 5, running: 1, "needs-you": 2, failed: 1 });
  });

  test("lanes keep only agents with matching work", () => {
    assert.deepEqual(logic.lanesFor(agents, events, "all").agents.map((a) => a.id), ["plan", "code", "test", "docs"]);
    const waiting = logic.lanesFor(agents, events, "needs-you");
    assert.deepEqual(waiting.agents.map((a) => a.id), ["code", "docs"]);
    assert.deepEqual(waiting.tasks.map((t) => t.id), ["e3", "e4"]);
    assert.deepEqual(logic.lanesFor(agents, events, "failed").agents.map((a) => a.id), ["test"]);
  });

  test("inbox lists waiting and failed work, per filter", () => {
    const all = logic.inboxItemsFor(agents, events, "all", SINCE, NOW);
    assert.deepEqual(all.map((i) => i.id).sort(), ["e3", "e4", "e5"]);
    assert.equal(all.find((i) => i.id === "e3").type, "approval");
    assert.equal(all.find((i) => i.id === "e4").type, "question");
    assert.equal(all.find((i) => i.id === "e5").type, "failure");
    assert.deepEqual(logic.inboxItemsFor(agents, events, "failed", SINCE, NOW).map((i) => i.id), ["e5"]);
    assert.deepEqual(logic.inboxItemsFor(agents, events, "running", SINCE, NOW), []);
  });

  test("activity bar counts only matching work", () => {
    const sum = (filter) => logic.activityFor(events, filter, SINCE, NOW).reduce((n, d) => n + d.value, 0);
    assert.equal(sum("all"), 5);
    assert.equal(sum("running"), 1);
    assert.equal(sum("needs-you"), 2);
    assert.equal(sum("failed"), 1);
  });

  test("the rendered block: one radio group with counts in the names", () => {
    const html = render();
    assert.match(html, /role="radiogroup"[^>]*aria-label="Show agents"/);
    for (const label of ["All 5", "Running 1", "Needs you 2", "Failed 1"]) assert.ok(html.includes(label), label);
  });

  test("all three areas respond to the filter when rendered", () => {
    const all = render();
    const failed = render({ filter: "failed" });
    const running = render({ defaultFilter: "running" });

    // Summary: the activity chart is titled with the filter.
    assert.ok(all.includes(">Activity<"));
    assert.ok(failed.includes("Activity · Failed"));
    // Lanes: only the failing agent keeps a lane.
    assert.ok(all.includes("Docs writer") && all.includes("Planner"));
    assert.ok(failed.includes("Tester"));
    assert.ok(!failed.includes("Planner") && !failed.includes("Refactor invoice totals"));
    // Inbox: the failure only; running has nothing waiting on you.
    assert.ok(all.includes("Run 0042_drop_legacy.sql on staging?"));
    assert.ok(failed.includes("E2E checkout suite") && !failed.includes("Publish the 0.19 changelog?"));
    assert.ok(running.includes("All caught up") && running.includes("Refactor invoice totals"));
  });

  test("inbox rows are buttons with aria-expanded", () => {
    const html = render();
    assert.match(html, /<button[^>]*aria-expanded="false"[^>]*aria-controls="[^"]+"/);
  });
});

describe("AgentOverview callbacks", () => {
  test("approve, reject and retry reach the block's props", () => {
    const calls = [];
    const handlers = logic.inboxHandlers({
      onApprove: (id) => calls.push(["approve", id]),
      onReject: (id) => calls.push(["reject", id]),
      onRetry: (id) => calls.push(["retry", id]),
    });
    handlers.onApprove("e3");
    handlers.onDeny("e3");
    handlers.onAnswer("e4", logic.DECISION_APPROVE);
    handlers.onAnswer("e4", logic.DECISION_REJECT);
    handlers.onAnswer("e4", "something else");
    handlers.onRetryItem("e5");
    assert.deepEqual(calls, [
      ["approve", "e3"],
      ["reject", "e3"],
      ["approve", "e4"],
      ["reject", "e4"],
      ["retry", "e5"],
    ]);
  });

  test("missing callbacks are safe", () => {
    const handlers = logic.inboxHandlers({});
    assert.doesNotThrow(() => {
      handlers.onApprove("e3");
      handlers.onDeny("e3");
      handlers.onAnswer("e4", logic.DECISION_APPROVE);
      handlers.onRetryItem("e5");
    });
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
