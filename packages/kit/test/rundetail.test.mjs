/**
 * RunDetail: one step list maps onto the strip, the trail, the tree and the tool call, one
 * selected step drives all four, and the run callbacks reach the block's props. Runs against
 * the built kit (dist): build first (npm run build -w agentic-ds-kit). CSS imports are stubbed
 * so the block renders on the server with react-dom/server.
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

const agents = {
  id: "orch",
  name: "orchestrator",
  status: "running",
  children: [
    { id: "reader", name: "code-reader", status: "done", elapsed: "0:40", cost: 0.04 },
    { id: "editor", name: "editor", status: "waiting", elapsed: "1:10", cost: 0.12, note: "Needs your OK · migration" },
    { id: "tester", name: "test-runner", status: "failed", elapsed: "0:30", cost: 0.03 },
  ],
};

const steps = [
  { id: "s1", agentId: "reader", tool: "read_file", label: "Read the invoice model", status: "done", target: "src/billing/invoice.ts", duration: "1.2s", result: ["142 lines"] },
  { id: "s2", agentId: "tester", tool: "run_tests", label: "Run invoice tests", status: "failed", duration: "8.4s", error: ["3 failed · exit code 1"] },
  { id: "s3", agentId: "editor", tool: "bash", label: "Run the migration", status: "waiting", timer: "0:18", args: { command: "npm run migrate" } },
  { id: "s4", agentId: "editor", tool: "open_pr", label: "Open the pull request", status: "pending" },
];

const run = {
  name: "Refactor billing service",
  meta: "claude-code · acme-demo",
  status: "waiting",
  elapsed: "02:14",
  cost: "$0.19",
  pendingAction: { title: "Run the staging migration?", risk: "high", action: { kind: "command", command: "npm run migrate -- --env staging" } },
};

let logic;
let React;
let renderToStaticMarkup;
let RunDetail;

before(async () => {
  logic = await import("../dist/ui/RunDetail/runDetail.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ RunDetail } = await import("../dist/ui/RunDetail/RunDetail.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(RunDetail, { run, steps, agents, ...props }));
}

describe("RunDetail mapping", () => {
  test("the strip holds started steps; the trail holds every step", () => {
    assert.deepEqual(logic.monitorSteps(steps).map((s) => s.id), ["s1", "s2", "s3"]);
    assert.deepEqual(logic.trailSteps(steps).map((s) => s.status), ["done", "failed", "approval", "pending"]);
    assert.equal(logic.trailSteps(steps)[0].sublabel, "read_file src/billing/invoice.ts");
  });

  test("tool call per step", () => {
    assert.equal(logic.toolCallFor(steps[1]).status, "error");
    assert.deepEqual(logic.toolCallFor(steps[1]).error, ["3 failed · exit code 1"]);
    assert.equal(logic.toolCallFor(steps[2]).summary, "Waiting for your approval");
    assert.equal(logic.toolCallFor(steps[2]).duration, "0:18");
    assert.equal(logic.toolCallFor(steps[3]), null);
    assert.equal(logic.toolCallFor(undefined), null);
  });

  test("tree and steps select each other", () => {
    assert.equal(logic.agentForStep(steps, "s3", agents), "editor");
    assert.equal(logic.agentForStep(steps, null, agents), null);
    assert.equal(logic.stepForAgent(steps, "editor"), "s3");
    assert.equal(logic.stepForAgent(steps, "reader"), "s1");
    assert.equal(logic.stepForAgent(steps, "orch"), null);
    // An agent with only planned steps selects its first one.
    assert.equal(logic.stepForAgent([...steps, { id: "s5", agentId: "orch", tool: "plan", status: "pending" }], "orch"), "s5");
    assert.equal(logic.lastFailedStep(steps), "s2");
    // A tree node's Retry goes to that agent's failed step.
    assert.equal(logic.failedStepForAgent(steps, "tester"), "s2");
    assert.equal(logic.failedStepForAgent(steps, "editor"), null);
  });

  test("summary line", () => {
    assert.equal(logic.runSummary(steps), "1 of 4 steps done · 1 waiting for you · 1 failed");
  });
});

describe("RunDetail render", () => {
  test("a labelled section with the approval and no step selected", () => {
    const html = render();
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Run detail<\/h2>/s);
    assert.ok(html.includes("Run the staging migration?"));
    assert.ok(html.includes("No step selected"));
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 0);
  });

  test("one selected step shows in strip, trail, tree and tool call", () => {
    const html = render({ selectedStepId: "s2" });
    // Strip button, trail button and the tree name of the agent that ran it.
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 3);
    assert.ok(html.includes("Tool call · Run invoice tests"));
    assert.ok(html.includes("3 failed · exit code 1"));
    assert.match(html, /aria-pressed="true"[^>]*aria-label="test-runner, Failed"|aria-label="test-runner, Failed"[^>]*aria-pressed="true"/);
  });

  test("a pending step is selected in the trail only and has no call yet", () => {
    const html = render({ defaultSelectedStepId: "s4" });
    assert.ok(html.includes("Not run yet"));
    // Trail + tree (editor ran it); the strip has no pending steps.
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
  });
});

describe("RunDetail in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "rundetail");
    assert.equal(row?.name, "RunDetail");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
