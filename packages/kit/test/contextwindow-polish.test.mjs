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

  test("loading: five lines inside loadingLines", () => {
    const out = html({ used: 0, loading: true });
    const start = out.search(/<div class="[^"]*_loadingLines_[^"]*">/);
    assert.ok(start > -1, "loadingLines group is there");
    const group = out.slice(start).match(/^<div class="[^"]*">((?:<span[^>]*>(?:<span[^>]*>[^<]*<\/span>|<span[^>]*><\/span>)*<\/span>)*)<\/div>/);
    assert.ok(group, "loadingLines holds only skeletons");
    const lines = group[1].match(/<span[^>]*aria-busy="true"/g) ?? [];
    assert.equal(lines.length, 5);
  });

  test("bar: only the last segment drops its split line", () => {
    const segments = [
      { id: "s", label: "System", tokens: 10000 },
      { id: "m", label: "Memory", tokens: 20000 },
      { id: "t", label: "Tools", tokens: 30000 },
    ];
    for (const used of [60000, 200000]) {
      const out = html({ used, limit: 200000, segments });
      const bar = out.slice(out.indexOf('role="meter"'));
      const classes = [...bar.matchAll(/<span class="([^"]*_segment_[^"]*)"/g)].map((m) => m[1]);
      assert.equal(classes.length, 3, "one span per segment");
      assert.deepEqual(
        classes.map((c) => /_segmentEnd_/.test(c)),
        [false, false, true],
        `only the last segment ends the bar (used ${used})`,
      );
    }
  });
});
