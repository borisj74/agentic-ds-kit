/**
 * ContextWindow: compact near-limit / full keep a word for screen readers beside the icon,
 * and the card's loading state has the polished skeleton (two bars, then five lines).
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
let ContextWindow;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ContextWindow } = await import("../dist/ui/ContextWindow/ContextWindow.js"));
});

const html = (props) => renderToStaticMarkup(React.createElement(ContextWindow, props));

describe("ContextWindow polish", () => {
  test("compact near limit: icon plus screen-reader word", () => {
    const out = html({ used: 171000, limit: 200000, compact: true });
    assert.match(out, /lucide-triangle-alert/);
    assert.match(out, /<span class="[^"]*srOnly[^"]*">Near limit<\/span>/);
  });

  test("compact full: icon plus screen-reader word", () => {
    const out = html({ used: 200000, limit: 200000, compact: true });
    assert.match(out, /lucide-circle-x/);
    assert.match(out, /<span class="[^"]*srOnly[^"]*">Full<\/span>/);
  });

  test("near-limit notice wording", () => {
    const out = html({ used: 171000, limit: 200000, segments: [{ id: "m", label: "Messages", tokens: 171000 }] });
    assert.match(out, /Oldest messages will be trimmed soon\. Trim now to keep control\./);
  });

  test("loading: two bars, then five lines", () => {
    const out = html({ used: 0, loading: true });
    assert.equal((out.match(/aria-busy="true"/g) ?? []).length >= 7, true, "seven skeletons inside the busy card");
  });
});
