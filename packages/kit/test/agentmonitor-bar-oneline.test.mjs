/**
 * AgentMonitor collapsed bar: the name and the headline each carry their full text in a title
 * attribute (they truncate to one line in CSS), and run actions come after the heading, in their own row.
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
let AgentMonitor;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AgentMonitor } = await import("../dist/ui/AgentMonitor/AgentMonitor.js"));
});

const noop = () => {};

describe("AgentMonitor collapsed bar", () => {
  test("name and headline keep their full text in a title attribute", () => {
    const out = renderToStaticMarkup(
      React.createElement(AgentMonitor, { name: "Invoice reconciler", headline: "Step 2 of 4", elapsed: "0:03", collapsed: true, onPause: noop, onStop: noop }),
    );
    assert.match(out, /<h3[^>]*title="Invoice reconciler"[^>]*>Invoice reconciler<\/h3>/);
    assert.match(out, /<p[^>]*title="Step 2 of 4"[^>]*>Step 2 of 4<\/p>/);
  });

  test("Stop run and Pause sit in their own row after the heading", () => {
    const out = renderToStaticMarkup(
      React.createElement(AgentMonitor, { name: "Invoice reconciler", headline: "Step 2 of 4", elapsed: "0:03", collapsed: true, onPause: noop, onStop: noop }),
    );
    const heading = out.indexOf("_barHeading_");
    const actions = out.indexOf("_barActions_");
    assert.ok(heading > -1 && actions > heading, "actions row after the heading");
    const row = out.slice(actions);
    assert.ok(row.indexOf(">Stop run<") > -1 && row.indexOf(">Pause<") > row.indexOf(">Stop run<"));
  });
});
