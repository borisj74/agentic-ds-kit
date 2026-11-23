/**
 * Timeline: every step names its status as a word, so the dot colour never stands alone. Runs
 * against the built kit (dist): build first (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, test } from "node:test";

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
let Timeline;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Timeline } = await import("../dist/ui/Timeline/Timeline.js"));
});

test("each step's phase line starts with Now, Next or Later; a phase that says it is not repeated", () => {
  const html = renderToStaticMarkup(
    React.createElement(Timeline, {
      label: "Release plan",
      items: [
        { status: "now", phase: "Now", title: "Ship beta" },
        { status: "next", phase: "Week 48", title: "Onboard partners" },
        { status: "later", title: "Public launch" },
      ],
    }),
  );
  assert.match(html, /<ol[^>]*aria-label="Release plan"/);
  assert.ok(html.includes(">Now<") && !html.includes("Now · Now"));
  assert.ok(html.includes(">Next · Week 48<"));
  assert.ok(html.includes(">Later<"));
});
