/**
 * LiveSession: one agent list maps onto Working now and steering, the oldest request shows
 * inline, and there is one solid primary in the view. Runs against the built kit (dist): build
 * first (npm run build -w agentic-ds-kit). CSS imports are stubbed so the block renders on the
 * server with react-dom/server.
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

const agents = [
  { id: "coder", name: "Coder", status: "running", activity: "editing invoice.ts", elapsed: "02:14", suggestions: ["Focus on refunds"] },
  { id: "docs", name: "Docs writer", status: "paused", elapsed: "00:40" },
  { id: "ops", name: "Ops", status: "running", activity: "preparing migration" },
  { id: "tester", name: "Tester", status: "failed", activity: "3 specs failed" },
  { id: "planner", name: "Planner", status: "done" },
];

const requests = [
  { id: "r1", agentId: "ops", title: "Run the staging migration?", risk: "high", action: { kind: "command", command: "npm run migrate" } },
  { id: "r2", agentId: "coder", title: "Write invoice.ts?", action: { kind: "diff", file: "src/invoice.ts", lines: [{ type: "add", text: "x" }] } },
];

const messages = [
  { id: "m1", role: "user", content: "Refactor the invoice totals and keep refunds working." },
  { id: "m2", role: "assistant", content: "On it. Coder is editing, Ops is preparing the migration." },
];

let logic;
let React;
let renderToStaticMarkup;
let LiveSession;

before(async () => {
  logic = await import("../dist/ui/LiveSession/liveSession.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ LiveSession } = await import("../dist/ui/LiveSession/LiveSession.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(LiveSession, { messages, agents, ...props }));
}

// The built kit keeps its CSS-module class names: a Button carries "_solid_… _primary_…".
const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;

describe("LiveSession mapping", () => {
  test("Working now: every agent not done, paused and asking ones wait", () => {
    const items = logic.runningItems(agents, requests);
    assert.deepEqual(items.map((i) => i.id), ["coder", "docs", "ops", "tester"]);
    assert.deepEqual(items.map((i) => i.status), ["waiting", "waiting", "waiting", "failed"]);
    assert.equal(items[1].activity, "paused by you");
    assert.equal(items[2].activity, "needs your OK");
    assert.equal(logic.runningItems(agents)[0].status, "running");
  });

  test("steering status and the steered agent", () => {
    assert.deepEqual(agents.map(logic.steeringStatus), ["running", "paused", "running", "stopped", "done"]);
    assert.equal(logic.steeredAgent(agents, undefined).id, "coder");
    assert.equal(logic.steeredAgent(agents, "ops").id, "ops");
    assert.equal(logic.steeredAgent(agents, "missing").id, "coder");
  });

  test("the oldest request is inline, the rest counted", () => {
    const ask = logic.currentRequest(agents, requests);
    assert.equal(ask.request.id, "r1");
    assert.equal(ask.agentName, "Ops");
    assert.equal(ask.more, 1);
    assert.equal(logic.currentRequest(agents, []), null);
    assert.equal(logic.sessionSummary(agents, requests), "4 agents working · 2 need you");
  });
});

describe("LiveSession render", () => {
  test("labelled section, chat log and steering for the first working agent", () => {
    const html = render();
    assert.match(html, /<h2[^>]*>Live session<\/h2>/);
    assert.ok(html.includes('role="log"'));
    assert.ok(html.includes('aria-label="Steer Coder"'));
  });

  test("the inline approval names the agent and how many more wait", () => {
    const html = render({ requests, defaultSelectedAgentId: "docs" });
    assert.ok(html.includes("Ops asks"));
    assert.ok(html.includes("1 more waiting"));
    assert.ok(html.includes("Run the staging migration?"));
    assert.ok(!html.includes("Write invoice.ts?"));
    assert.ok(html.includes('aria-label="Steer Docs writer"'));
  });

  test("one solid primary: chat send, or the approval while one waits", () => {
    assert.equal(solidPrimaries(render()), 1);
    assert.equal(solidPrimaries(render({ requests })), 1);
  });
});

describe("LiveSession in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "livesession");
    assert.equal(row?.name, "LiveSession");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
