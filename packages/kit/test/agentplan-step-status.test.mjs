/**
 * AgentPlan step row: with tool calls, the visible stepStatus span shows the count (and the
 * screen-reader word); with none, only the screen-reader word renders, so no empty span takes flex space.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

let React;
let renderToStaticMarkup;
let AgentPlan;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AgentPlan } = await import("../dist/ui/AgentPlan/AgentPlan.js"));
});

const STEPS = [
  { id: "a", label: "Read the invoice", calls: [{ id: "c1", name: "read_file", status: "success" }, { id: "c2", name: "read_file", status: "success" }] },
  { id: "b", label: "Draft the patch" },
  { id: "c", label: "Run the tests" },
];

describe("AgentPlan step status", () => {
  test("a step with calls keeps the visible count; steps without calls render no stepStatus span", () => {
    const out = renderToStaticMarkup(React.createElement(AgentPlan, { title: "Plan", steps: STEPS, status: "running", currentStepId: "b" }));
    const rows = out.split("<li").slice(1);
    assert.equal(rows.length, 3);
    assert.match(rows[0], /_stepStatus_[^"]*"><span class="[^"]*_srOnly_[^"]*">Done<\/span>2 calls<\/span>/);
    for (const [row, word] of [[rows[1], "Running"], [rows[2], "Queued"]]) {
      assert.doesNotMatch(row, /_stepStatus_/, "no visible status span");
      assert.match(row, new RegExp(`<span class="[^"]*_srOnly_[^"]*">${word}</span>`), "the word stays for screen readers");
    }
  });
});
