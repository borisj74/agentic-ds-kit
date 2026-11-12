/**
 * PlanReview: the plan, its expected changes and the autonomy dial under one decision. Logic,
 * SSR render through the CSS stub, one solid primary, and the callbacks. Runs against the built
 * kit (dist): build first (npm run build -w agentic-ds-kit).
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

const steps = [
  { id: "s1", label: "Read the router", tool: "read_file", target: "src/app.ts" },
  { id: "s2", label: "Add the limiter middleware", tool: "edit_file", target: "src/middleware/rateLimit.ts" },
  { id: "s3", label: "Install the Redis store", tool: "bash", target: "npm i rate-limit-redis", needsApproval: true },
  { id: "s4", label: "Run the tests", tool: "run_tests" },
];

const changes = [{ id: "routes", label: "Rate-limited routes", before: "0", after: "12", delta: "+12", direction: "up", sentiment: "good" }];

let logic;
let React;
let renderToStaticMarkup;
let PlanReview;
let Button;
let AgentPlan;
let AutonomyDial;

before(async () => {
  logic = await import("../dist/ui/PlanReview/planReview.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ PlanReview } = await import("../dist/ui/PlanReview/PlanReview.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ AgentPlan } = await import("../dist/ui/AgentPlan/AgentPlan.js"));
  ({ AutonomyDial } = await import("../dist/ui/AutonomyDial/AutonomyDial.js"));
});

const base = { planTitle: "Add rate limiting to the public API", steps, agent: "Backend agent", target: "acme/api", changes };

function render(props) {
  return renderToStaticMarkup(React.createElement(PlanReview, { ...base, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = PlanReview({ ...base, ...props });
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
const handlers = { onApprove() {}, onRequestChanges() {}, onReject() {}, onStepsChange() {} };

describe("PlanReview logic", () => {
  test("pauses follow the autonomy stop", () => {
    assert.equal(logic.pausesAt(steps, "ask"), 4);
    assert.equal(logic.pausesAt(steps, "risk"), 1);
    assert.equal(logic.pausesAt(steps, "tell"), 0);
    assert.equal(logic.pausesAt(steps, "run"), 0);
  });

  test("lead and approve hint", () => {
    assert.equal(logic.planLead(steps, "Backend agent", "acme/api"), "Backend agent proposes 4 steps on acme/api. Nothing runs until you approve.");
    assert.equal(logic.planLead([steps[0]]), "The agent proposes 1 step. Nothing runs until you approve.");
    const stops = [{ id: "risk", label: "Ask on high risk", description: "" }];
    assert.equal(logic.approveHint(steps, "risk", stops), "Runs 4 steps · Ask on high risk · 1 stop for your OK");
    assert.equal(logic.approveHint(steps, "run", []), "Runs 4 steps · no stops for your OK");
  });
});

describe("PlanReview render", () => {
  test("a labelled section with plan, changes, dial and decision", () => {
    const html = render(handlers);
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Plan review<\/h2>/s);
    for (const text of ["Add rate limiting to the public API", "What the plan changes", "Rate-limited routes", "Autonomy", "Your decision", "Approve plan", "Request changes", "Reject"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(html.includes("Runs 4 steps · Ask on high risk · 1 stop for your OK"));
  });

  test("Approve plan is the one solid primary; AgentPlan gets no Accept", () => {
    assert.equal(solidPrimaries(render(handlers)), 1);
    const node = tree(handlers);
    assert.equal(findAll(node, AgentPlan)[0].props.onAccept, undefined);
    assert.ok(!render(handlers).includes("Accept plan"));
  });

  test("a decided plan is locked and shows the outcome", () => {
    const html = render({ ...handlers, decision: "approved", decisionNote: "by you · 14:02" });
    assert.ok(html.includes("Plan approved"));
    assert.ok(html.includes("by you · 14:02"));
    assert.ok(!html.includes("Approve plan"));
    assert.equal(solidPrimaries(html), 0);
    const node = tree({ ...handlers, decision: "rejected" });
    assert.equal(findAll(node, AgentPlan)[0].props.onChange, undefined);
    assert.equal(findAll(node, AutonomyDial)[0].props.disabled, true);
  });
});

describe("PlanReview callbacks", () => {
  test("approve hands back the autonomy and steps; reject and step edits reach the props", () => {
    const calls = [];
    const node = tree({
      defaultAutonomy: "ask",
      onApprove: (approval) => calls.push(["approve", approval.autonomy, approval.steps.length]),
      onReject: () => calls.push(["reject"]),
      onRequestChanges: () => calls.push(["changes"]),
      onStepsChange: (next) => calls.push(["steps", next.length]),
    });
    const buttons = findAll(node, Button);
    buttons.find((b) => b.props.children === "Approve plan").props.onClick();
    buttons.find((b) => b.props.children === "Reject").props.onClick();
    findAll(node, AgentPlan)[0].props.onChange(steps.slice(0, 3));
    assert.deepEqual(calls, [["approve", "ask", 4], ["reject"], ["steps", 3]]);
  });
});

describe("PlanReview in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "planreview");
    assert.equal(row?.name, "PlanReview");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
