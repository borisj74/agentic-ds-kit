/**
 * TraceWaterfall polish: a kind dot before each row label (failed rows keep the icon and word),
 * cost in its own style with an em dash when missing, whole seconds without ".0",
 * a primary kind badge in the detail, and the "dashed" note on complete and running runs only.
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
let TraceWaterfall;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ TraceWaterfall } = await import("../dist/ui/TraceWaterfall/TraceWaterfall.js"));
});

const SPANS = [
  { id: "plan", label: "Plan task", kind: "model", startMs: 0, endMs: 4200, cost: 0.03, detail: [{ label: "Model", value: "Claude Sonnet 5.5" }] },
  { id: "read", label: "read_file ×3", kind: "tool", startMs: 4200, endMs: 6000 },
  { id: "tests", label: "run_tests", kind: "tool", startMs: 6000, endMs: 15100, failed: true },
];
const html = (props) => renderToStaticMarkup(React.createElement(TraceWaterfall, { title: "Run trace", spans: SPANS, ...props }));

describe("TraceWaterfall polish", () => {
  test("rows: kind dot before the label; the failed row keeps its icon and word instead", () => {
    const out = html({ status: "failed", totalMs: 58000, error: "run_tests failed" });
    const rows = out.split("<li").slice(1);
    assert.match(rows[0], /_rowDot_[^"]*_kind-model_/);
    assert.match(rows[1], /_rowDot_[^"]*_kind-tool_/);
    assert.doesNotMatch(rows[2], /_rowDot_/);
    assert.match(rows[2], /lucide-circle-x/);
    assert.match(rows[2], />Failed</);
  });

  test("cost cell: styled when set, em dash when missing", () => {
    const out = html({});
    assert.match(out, /_cost_[^"]*">\$0\.03</);
    assert.match(out, /_none_[^"]*">—</);
    assert.doesNotMatch(out, />–</);
  });

  test("whole seconds drop the .0", () => {
    const out = html({ status: "failed", totalMs: 58000 });
    assert.match(out, /58s/);
    assert.doesNotMatch(out, /58\.0s/);
    assert.match(out, />4\.2s</);
  });

  test("detail badge is primary; dashed note shows unless the run failed", () => {
    const complete = html({ selectedId: "plan", onSpanClick() {} });
    assert.match(complete, /_primary_[^"]*"[^>]*>Model</);
    assert.match(complete, /dashed = still running/);
    assert.doesNotMatch(html({ status: "failed" }), /dashed = still running/);
  });
});
