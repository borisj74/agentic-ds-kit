/**
 * AgentSteering while a steer is sending: the field is read-only (keeps its text, full contrast),
 * not disabled, and the composer is aria-busy.
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
let AgentSteering;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AgentSteering } = await import("../dist/ui/AgentSteering/AgentSteering.js"));
});

const html = (props) => renderToStaticMarkup(React.createElement(AgentSteering, { name: "Billing refactor", onSteer() {}, ...props }));
const field = (out) => out.match(/<input[^>]*>/)[0];

describe("AgentSteering sending", () => {
  test("sending: the field is read-only, not disabled, and keeps its text", () => {
    const out = html({ value: "Focus on refunds", sending: true });
    const input = field(out);
    assert.match(input, /readOnly=""|readonly=""/i);
    assert.doesNotMatch(input, /disabled=""/);
    assert.match(input, /value="Focus on refunds"/);
    assert.match(out, /<form[^>]*aria-busy="true"/);
  });

  test("not sending: editable; a finished run disables the field", () => {
    assert.doesNotMatch(field(html({ value: "x" })), /readonly|disabled/i);
    assert.match(field(html({ value: "", status: "done" })), /disabled=""/);
  });
});
