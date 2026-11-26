/**
 * RunningNow idleText: an idle strip with no count and no icon, only the line.
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
let RunningNow;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ RunningNow } = await import("../dist/ui/RunningNow/RunningNow.js"));
});

const html = (props) => renderToStaticMarkup(React.createElement(RunningNow, props));

describe("RunningNow idleText", () => {
  test("idle: the label has no count and the line has no icon", () => {
    const out = html({ items: [], idleText: "Idle · last run 2h ago" });
    assert.match(out, /<h3[^>]*>Running now<\/h3>/, "label without a count");
    assert.match(out, />Idle · last run 2h ago</);
    assert.doesNotMatch(out, /lucide-clock/, "no clock icon");
    assert.doesNotMatch(out, /Nothing running right now/, "idleText takes the place of emptyText");
  });

  test("without idleText the empty strip keeps the count 0 and the clock", () => {
    const out = html({ items: [] });
    assert.match(out, /_count_[^>]*>0</);
    assert.match(out, /lucide-clock/);
    assert.match(out, />Nothing running right now</);
  });

  test("idleText is ignored while items run or while loading", () => {
    const running = html({ items: [{ id: "a", name: "Docs sweep", status: "running" }], idleText: "Idle · last run 2h ago" });
    assert.doesNotMatch(running, /Idle · last run/);
    assert.match(running, /_count_[^>]*>1</);
    const loading = html({ items: [], loading: true, idleText: "Idle · last run 2h ago" });
    assert.doesNotMatch(loading, /Idle · last run/);
  });
});
